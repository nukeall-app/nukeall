import { defineBackground } from 'wxt/utils/define-background';
import { planInstagramScanSteps } from '../src/adapters/instagram/parser';
import { detectLinkedInHandleFromPath, planLinkedInScanSteps } from '../src/adapters/linkedin/parser';
import {
  generateOverwriteText,
  parseRedditListingChildren,
  parseRedditRateLimitMs,
  planRedditScanSteps,
  toFullname,
  type RedditListingChild,
} from '../src/adapters/reddit/api';
import { planXScanSteps, type XTimelineKind } from '../src/adapters/x/graphql';
import { Runner } from '../src/core/runner';
import {
  incrementDeletedToday,
  loadDeletedToday,
  loadJobCheckpoint,
  loadSettings,
  saveJobCheckpoint,
} from '../src/core/storage';
import type { DeleteOptions, ExtensionMessage, MessageResponse } from '../src/core/messages';
import type { ContentItem, ContentType, DeleteResult, PlatformId, ProgressEntry } from '../src/core/types';

let activeRunner: Runner | null = null;
let lastLogBuffer: ProgressEntry[] = [];
let scanCancelled = false;
let activeScanTabId: number | undefined;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const PLATFORM_META: Record<
  PlatformId,
  { matchRe: RegExp; queryUrls: string[]; homeUrl: string; displayName: string }
> = {
  x: {
    matchRe: /^https:\/\/(www\.)?(x|twitter)\.com/i,
    queryUrls: ['*://x.com/*', '*://twitter.com/*'],
    homeUrl: 'https://x.com/home',
    displayName: 'x.com',
  },
  instagram: {
    matchRe: /^https:\/\/(www\.)?instagram\.com/i,
    queryUrls: ['*://instagram.com/*', '*://*.instagram.com/*'],
    homeUrl: 'https://www.instagram.com/',
    displayName: 'instagram.com',
  },
  reddit: {
    matchRe: /^https:\/\/([a-z0-9-]+\.)?reddit\.com/i,
    queryUrls: ['*://reddit.com/*', '*://*.reddit.com/*'],
    homeUrl: 'https://www.reddit.com/',
    displayName: 'reddit.com',
  },
  linkedin: {
    matchRe: /^https:\/\/([a-z0-9-]+\.)?linkedin\.com/i,
    queryUrls: ['*://linkedin.com/*', '*://*.linkedin.com/*'],
    homeUrl: 'https://www.linkedin.com/feed/',
    displayName: 'linkedin.com',
  },
};

// Background worker has host_permissions for *://*.reddit.com/* so old.reddit.com works without page CORS.
async function fetchOldRedditMe(): Promise<{ id: string; handle: string; modhash: string } | null> {
  try {
    const res = await fetch('https://old.reddit.com/api/me.json', {
      credentials: 'include',
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { id?: string; name?: string; modhash?: string } };
    const d = json?.data;
    if (!d?.name) return null;
    return {
      id: String(d.id ?? ''),
      handle: String(d.name),
      modhash: String(d.modhash ?? ''),
    };
  } catch {
    return null;
  }
}

async function scanRedditViaOldJson(
  type: 'comment' | 'post',
  username: string,
  maxItems: number,
): Promise<ContentItem[]> {
  const clean = username.replace(/^u\//i, '').trim();
  if (!clean) return [];
  const endpoint = type === 'comment' ? 'comments' : 'submitted';
  const limit = maxItems > 0 ? maxItems : Number.POSITIVE_INFINITY;
  const collected = new Map<string, ContentItem>();
  let after: string | null = null;

  try {
    for (let page = 0; page < 40 && !scanCancelled; page++) {
      const qs = new URLSearchParams({ limit: '100', raw_json: '1' });
      if (after) qs.set('after', after);
      const res = await fetch(
        `https://old.reddit.com/user/${encodeURIComponent(clean)}/${endpoint}.json?${qs.toString()}`,
        {
          credentials: 'include',
          headers: { accept: 'application/json' },
        },
      );
      if (res.status === 429) {
        await sleep(10_000);
        continue;
      }
      if (!res.ok) break;
      const json = (await res.json().catch(() => null)) as {
        data?: { after?: string | null; children?: RedditListingChild[] };
      } | null;
      const children = json?.data?.children ?? [];
      if (children.length === 0) break;

      for (const item of parseRedditListingChildren(children, type)) {
        collected.set(item.id, item);
        if (collected.size >= limit) break;
      }
      browser.runtime
        .sendMessage({ type: 'SCAN_PROGRESS', stage: 'scanning', kind: type, count: collected.size })
        .catch(() => {});

      if (collected.size >= limit) break;
      after = json?.data?.after ?? null;
      if (!after) break;
      await sleep(800);
    }
  } catch {
    return [...collected.values()];
  }

  return [...collected.values()];
}

async function postOldRedditForm(
  path: string,
  params: Record<string, string>,
  modhash: string,
): Promise<Response> {
  const body = new URLSearchParams({ ...params, ...(modhash ? { uh: modhash } : {}) });
  return fetch(`https://old.reddit.com${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      ...(modhash ? { 'x-modhash': modhash } : {}),
    },
    body: body.toString(),
  });
}

async function deleteRedditViaOldApi(item: ContentItem, options?: DeleteOptions): Promise<DeleteResult | null> {
  const me = await fetchOldRedditMe();
  if (!me?.handle || !me.modhash) return null;

  const fullname = toFullname(item);
  const passes = Math.min(3, Math.max(0, options?.redditOverwritePasses ?? 2));
  const customText = options?.redditOverwriteText?.trim() ?? '';
  const canEdit = item.type === 'comment' || item.meta?.isSelf !== false;

  if (canEdit && passes > 0) {
    for (let p = 0; p < passes; p++) {
      const text = customText || generateOverwriteText(p);
      const editRes = await postOldRedditForm(
        '/api/editusertext',
        { api_type: 'json', thing_id: fullname, text },
        me.modhash,
      );
      if (editRes.status === 429) {
        return { ok: false, retryAfterMs: 60_000, error: 'Reddit rate limit (429) during overwrite' };
      }
      if (editRes.ok) {
        const json = await editRes.json().catch(() => null);
        const rlMs = parseRedditRateLimitMs(json);
        if (rlMs) return { ok: false, retryAfterMs: rlMs, error: 'Reddit RATELIMIT during overwrite' };
      }
      if (p < passes - 1) await sleep(650);
    }
  }

  if (options?.redditEditOnly) {
    return { ok: true };
  }

  const delRes = await postOldRedditForm('/api/del', { id: fullname }, me.modhash);
  if (delRes.status === 429) {
    return { ok: false, retryAfterMs: 60_000, error: 'Reddit rate limit (429)' };
  }
  if (delRes.status === 404) {
    return { ok: true, gone: true };
  }
  if (delRes.ok) {
    return { ok: true };
  }
  return null;
}

async function findTargetTabId(platform: PlatformId, explicitTabId?: number): Promise<number | undefined> {
  if (explicitTabId) return explicitTabId;
  const meta = PLATFORM_META[platform];
  const [active] = await browser.tabs.query({ active: true, currentWindow: true });
  if (active?.id && active.url && meta.matchRe.test(active.url)) {
    return active.id;
  }
  const tabs = await browser.tabs.query({ url: meta.queryUrls });
  return tabs[0]?.id;
}

async function waitForTabComplete(tabId: number, timeoutMs = 20_000): Promise<void> {
  const existing = await browser.tabs.get(tabId).catch(() => null);
  if (existing?.status === 'complete') return;

  await new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      browser.tabs.onUpdated.removeListener(onUpdated);
      clearTimeout(timer);
      resolve();
    };
    const onUpdated = (id: number, info: { status?: string }) => {
      if (id === tabId && info.status === 'complete') done();
    };
    const timer = setTimeout(done, timeoutMs);
    browser.tabs.onUpdated.addListener(onUpdated);
  });
}

async function waitForContentScript(tabId: number, timeoutMs = 12_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const resp = (await browser.tabs.sendMessage(tabId, {
        type: 'PING',
      } satisfies ExtensionMessage)) as MessageResponse | undefined;
      if (resp?.ok) return true;
    } catch {
      // Content script not ready yet
    }
    await sleep(350);
  }
  return false;
}

function normalizeUrl(u?: string): string {
  return (u ?? '').replace(/\/+$/, '').toLowerCase();
}

async function navigateAndWait(tabId: number, targetUrl: string, forceReloadIfSame: boolean): Promise<boolean> {
  const tab = await browser.tabs.get(tabId).catch(() => null);
  if (!tab) return false;

  if (normalizeUrl(tab.url) === normalizeUrl(targetUrl)) {
    if (forceReloadIfSame) {
      await browser.tabs.reload(tabId);
      await sleep(300);
      await waitForTabComplete(tabId);
    }
  } else {
    await browser.tabs.update(tabId, { url: targetUrl, active: true });
    await sleep(300);
    await waitForTabComplete(tabId);
  }

  return waitForContentScript(tabId);
}

async function resolveLoggedInHandle(tabId: number): Promise<string> {
  let ready = await waitForContentScript(tabId, 2000);
  if (!ready) {
    await browser.tabs.reload(tabId);
    await sleep(300);
    await waitForTabComplete(tabId);
    ready = await waitForContentScript(tabId, 12_000);
  }
  if (!ready) return '';

  for (let i = 0; i < 16; i++) {
    try {
      const resp = (await browser.tabs.sendMessage(tabId, {
        type: 'GET_CURRENT_USER',
      } satisfies ExtensionMessage)) as MessageResponse | undefined;
      if (resp?.ok && resp.user?.handle) return resp.user.handle;
    } catch {
      // ignore and retry
    }
    await sleep(400);
  }
  return '';
}

async function deleteViaTab(
  platform: PlatformId,
  tabId: number | undefined,
  item: ContentItem,
  options?: DeleteOptions,
): Promise<DeleteResult> {
  if (platform === 'reddit') {
    const oldRes = await deleteRedditViaOldApi(item, options).catch(() => null);
    if (oldRes) return oldRes;
  }

  const id = await findTargetTabId(platform, tabId);
  if (!id) {
    const host = PLATFORM_META[platform].displayName;
    return {
      ok: false,
      error: `No open ${host} tab found. Keep a ${host} tab open while deleting.`,
    };
  }
  try {
    const res = (await browser.tabs.sendMessage(id, {
      type: 'DELETE_SINGLE_ITEM',
      item,
      options,
    } satisfies ExtensionMessage)) as MessageResponse | undefined;
    if (!res) return { ok: false, error: `No response from ${PLATFORM_META[platform].displayName} tab` };
    if (!res.ok) return { ok: false, error: res.error };

    // For LinkedIn items loaded from CSV archive or scrolled off the activity DOM, navigate directly to the post URL and retry once.
    if (
      platform === 'linkedin' &&
      res.result &&
      !res.result.ok &&
      res.result.error === 'NOT_IN_DOM' &&
      item.url.startsWith('https://www.linkedin.com/')
    ) {
      const ready = await navigateAndWait(id, item.url, true);
      if (ready) {
        await sleep(1500);
        const retryRes = (await browser.tabs.sendMessage(id, {
          type: 'DELETE_SINGLE_ITEM',
          item,
          options,
        } satisfies ExtensionMessage)) as MessageResponse | undefined;
        if (retryRes?.ok && retryRes.result) return retryRes.result;
      }
      return {
        ok: false,
        error: 'LinkedIn card was not found in the DOM (it may already be deleted).',
      };
    }

    return res.result ?? { ok: false, error: 'Missing delete result' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

interface UnifiedScanStep {
  url: string;
  types: ContentType[];
  kind?: XTimelineKind;
  forceReloadIfSame: boolean;
}

export default defineBackground(() => {
  const g = globalThis as unknown as {
    chrome?: {
      sidePanel?: { setPanelBehavior?: (opts: { openPanelOnActionClick: boolean }) => Promise<void> };
    };
  };
  g.chrome?.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {});

  browser.runtime.onMessage.addListener((rawMsg, sender, sendResponse) => {
    const rawType =
      rawMsg && typeof rawMsg === 'object' ? (rawMsg as { type?: unknown }).type : undefined;

    if (rawType === 'SCAN_PROGRESS' || rawType === 'JOB_PROGRESS') {
      return false;
    }

    const msg = rawMsg as ExtensionMessage;

    const extOrigin = browser.runtime.getURL('');
    const senderUrl = sender.url ?? '';
    if ((sender.id && sender.id !== browser.runtime.id) || !senderUrl.startsWith(extOrigin)) {
      sendResponse({ ok: false, error: 'Unauthorized message sender' } satisfies MessageResponse);
      return false;
    }

    (async () => {
      try {
        if (msg.type === 'GET_STATE') {
          const [cp, deletedToday] = await Promise.all([loadJobCheckpoint(), loadDeletedToday()]);
          const state = activeRunner ? activeRunner.getState() : cp.activeJob;
          sendResponse({
            ok: true,
            state: {
              activeJob: state,
              checkpointIds: cp.checkpointIds,
              lastLog: lastLogBuffer.length > 0 ? lastLogBuffer : cp.lastLog,
              itemsCount: state?.total ?? 0,
              deletedToday,
            },
          } satisfies MessageResponse);
          return;
        }

        if (msg.type === 'GET_CURRENT_USER') {
          const platform = msg.platform ?? 'x';
          const tabId = await findTargetTabId(platform, msg.tabId);
          if (!tabId) {
            sendResponse({
              ok: false,
              error: `Open ${PLATFORM_META[platform].displayName} in a browser tab first.`,
            } satisfies MessageResponse);
            return;
          }
          const resp = (await browser.tabs.sendMessage(tabId, msg)) as MessageResponse;
          sendResponse(resp);
          return;
        }

        if (msg.type === 'STOP_SCAN') {
          scanCancelled = true;
          if (activeScanTabId != null) {
            browser.tabs.sendMessage(activeScanTabId, { type: 'STOP_SCAN' } satisfies ExtensionMessage).catch(() => {});
          }
          sendResponse({ ok: true } satisfies MessageResponse);
          return;
        }

        if (msg.type === 'START_SCAN') {
          if (msg.contentTypes.length === 0) {
            sendResponse({ ok: false, error: 'Select a content type to scan.' } satisfies MessageResponse);
            return;
          }

          const platform = msg.platform;
          const meta = PLATFORM_META[platform];
          let tabId = await findTargetTabId(platform);
          if (!tabId) {
            const created = await browser.tabs.create({ url: meta.homeUrl, active: true });
            tabId = created.id;
            if (!tabId) {
              sendResponse({ ok: false, error: `Could not open a ${meta.displayName} tab.` } satisfies MessageResponse);
              return;
            }
            await waitForTabComplete(tabId);
          }

          scanCancelled = false;
          activeScanTabId = tabId;

          let handle = '';
          let steps: UnifiedScanStep[] = [];

          if (platform === 'x') {
            const needsHandle = msg.contentTypes.some((t) => t !== 'bookmark');
            handle = needsHandle ? await resolveLoggedInHandle(tabId) : '';
            if (needsHandle && !handle) {
              activeScanTabId = undefined;
              sendResponse({
                ok: false,
                error: 'Could not detect your X account. Make sure you are logged in on x.com.',
              } satisfies MessageResponse);
              return;
            }
            steps = planXScanSteps(handle, msg.contentTypes).map((s) => ({
              url: s.url,
              types: s.types,
              kind: s.kind,
              forceReloadIfSame: true,
            }));
          } else if (platform === 'instagram') {
            if (msg.contentTypes.includes('message')) {
              const currentTab = await browser.tabs.get(tabId).catch(() => null);
              const curUrl = currentTab?.url ?? '';
              if (/^https:\/\/(www\.)?instagram\.com\/direct\/t\/\d+/i.test(curUrl)) {
                steps = [{ url: curUrl, types: ['message'], forceReloadIfSame: false }];
              } else {
                await browser.tabs.update(tabId, {
                  url: 'https://www.instagram.com/direct/inbox/',
                  active: true,
                });
                activeScanTabId = undefined;
                sendResponse({ ok: false, error: 'IG_OPEN_CHAT_FIRST' } satisfies MessageResponse);
                return;
              }
            } else {
              steps = planInstagramScanSteps(msg.contentTypes).map((s) => ({
                url: s.url,
                types: [s.type],
                forceReloadIfSame: true,
              }));
            }
          } else if (platform === 'reddit') {
            const oldMe = await fetchOldRedditMe();
            handle = oldMe?.handle || (await resolveLoggedInHandle(tabId));
            if (!handle) {
              activeScanTabId = undefined;
              sendResponse({
                ok: false,
                error: 'Could not detect your Reddit account. Make sure you are logged in on reddit.com.',
              } satisfies MessageResponse);
              return;
            }
            steps = planRedditScanSteps(handle, msg.contentTypes).map((s) => ({
              url: s.url,
              types: [s.type],
              forceReloadIfSame: false,
            }));
          } else if (platform === 'linkedin') {
            handle = await resolveLoggedInHandle(tabId);
            if (!handle) {
              const readyMe = await navigateAndWait(tabId, 'https://www.linkedin.com/in/me/', false);
              if (readyMe) {
                await sleep(1000);
                const updatedTab = await browser.tabs.get(tabId).catch(() => null);
                const pathname = (() => {
                  try {
                    return updatedTab?.url ? new URL(updatedTab.url).pathname : '';
                  } catch {
                    return '';
                  }
                })();
                handle = detectLinkedInHandleFromPath(pathname) || (await resolveLoggedInHandle(tabId));
              }
            }
            if (!handle) {
              activeScanTabId = undefined;
              sendResponse({
                ok: false,
                error: 'Could not detect your LinkedIn profile handle. Make sure you are signed in on linkedin.com.',
              } satisfies MessageResponse);
              return;
            }
            steps = planLinkedInScanSteps(handle, msg.contentTypes).map((s) => ({
              url: s.url,
              types: [s.type],
              forceReloadIfSame: false,
            }));
          }

          const collected = new Map<string, ContentItem>();
          const maxTotal = msg.maxItems > 0 ? msg.maxItems : 0;

          for (const step of steps) {
            if (scanCancelled) break;
            if (maxTotal > 0 && collected.size >= maxTotal) break;

            browser.runtime
              .sendMessage({
                type: 'SCAN_PROGRESS',
                stage: 'navigating',
                url: step.url,
                count: collected.size,
              })
              .catch(() => {});

            const ready = await navigateAndWait(tabId, step.url, step.forceReloadIfSame);
            if (!ready || scanCancelled) break;

            const remaining = maxTotal > 0 ? Math.max(1, maxTotal - collected.size) : 0;
            const resp = (await browser.tabs.sendMessage(tabId, {
              type: 'SCAN_TIMELINE',
              platform,
              kind: step.kind,
              contentTypes: step.types,
              maxItems: remaining,
              expectedHandle: handle || undefined,
            } satisfies ExtensionMessage)) as MessageResponse | undefined;

            if (resp && !resp.ok && platform !== 'reddit') {
              activeScanTabId = undefined;
              sendResponse(resp);
              return;
            }
            if (resp?.ok) {
              for (const item of resp.items ?? []) {
                collected.set(item.id, item);
              }
            }

            // Layer 3 Reddit fallback: background worker fetch to old.reddit.com JSON (no CORS)
            if (platform === 'reddit' && collected.size === 0 && !scanCancelled) {
              const targetType = step.types.includes('post') ? 'post' : 'comment';
              const oldItems = await scanRedditViaOldJson(targetType, handle, remaining);
              for (const item of oldItems) {
                collected.set(item.id, item);
              }
            }
          }

          activeScanTabId = undefined;
          sendResponse({ ok: true, items: [...collected.values()] } satisfies MessageResponse);
          return;
        }

        if (msg.type === 'START_DELETE') {
          if (activeRunner && activeRunner.getState().status === 'running') {
            sendResponse({ ok: false, error: 'A deletion job is already running.' } satisfies MessageResponse);
            return;
          }
          const [settings, cp, deletedToday] = await Promise.all([
            loadSettings(),
            loadJobCheckpoint(),
            loadDeletedToday(),
          ]);
          const initialDoneIds = msg.resume ? cp.checkpointIds : [];
          lastLogBuffer = msg.resume ? [...cp.lastLog] : [];
          const jobId = msg.resume && cp.activeJob ? cp.activeJob.jobId : `job_${Date.now()}`;
          const remainingDaily =
            settings.dailyLimit > 0 ? Math.max(0, settings.dailyLimit - deletedToday) : 0;

          if (settings.dailyLimit > 0 && remainingDaily === 0) {
            sendResponse({
              ok: false,
              error: `Daily safety limit (${settings.dailyLimit}) already reached today. Adjust it in Settings if needed.`,
            } satisfies MessageResponse);
            return;
          }

          let runningToday = deletedToday;
          const deleteOptions: DeleteOptions = {
            redditOverwritePasses: settings.redditOverwritePasses,
            redditOverwriteText: settings.redditOverwriteText,
            redditEditOnly: settings.redditEditOnly,
          };

          const runner = new Runner({
            jobId,
            platform: msg.platform,
            items: msg.items,
            speed: settings.speed,
            dailyLimit: remainingDaily,
            initialDoneIds,
            deleteFn: (item) => deleteViaTab(msg.platform, msg.tabId, item, deleteOptions),
            onCheckpoint: async (state, doneIds, entry) => {
              if (entry) {
                lastLogBuffer.push(entry);
                if (entry.ok) {
                  runningToday = await incrementDeletedToday(1);
                }
              }
              await saveJobCheckpoint(state, doneIds, lastLogBuffer);
              browser.runtime
                .sendMessage({ type: 'JOB_PROGRESS', state, log: lastLogBuffer, deletedToday: runningToday })
                .catch(() => {});
            },
            onStatusChange: (state) => {
              browser.runtime
                .sendMessage({ type: 'JOB_PROGRESS', state, log: lastLogBuffer, deletedToday: runningToday })
                .catch(() => {});
            },
          });

          activeRunner = runner;
          void runner.start().finally(() => {
            if (activeRunner === runner) {
              activeRunner = null;
            }
          });
          sendResponse({
            ok: true,
            state: {
              activeJob: runner.getState(),
              checkpointIds: initialDoneIds,
              lastLog: lastLogBuffer,
              itemsCount: msg.items.length,
              deletedToday: runningToday,
            },
          } satisfies MessageResponse);
          return;
        }

        if (msg.type === 'PAUSE_JOB') {
          activeRunner?.pause();
          sendResponse({ ok: true } satisfies MessageResponse);
          return;
        }

        if (msg.type === 'RESUME_JOB') {
          activeRunner?.resume();
          sendResponse({ ok: true } satisfies MessageResponse);
          return;
        }

        if (msg.type === 'STOP_JOB') {
          activeRunner?.stop();
          sendResponse({ ok: true } satisfies MessageResponse);
          return;
        }

        if (msg.type === 'CLEAR_JOB') {
          activeRunner?.stop();
          activeRunner = null;
          lastLogBuffer = [];
          await saveJobCheckpoint(null, [], []);
          sendResponse({ ok: true } satisfies MessageResponse);
          return;
        }

        sendResponse({ ok: false, error: 'Unknown message type' } satisfies MessageResponse);
      } catch (err) {
        sendResponse({
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        } satisfies MessageResponse);
      }
    })();

    return true;
  });
});
