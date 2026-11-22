import type { ContentItem, ContentType, DeleteResult } from '../../core/types';
import type { PlatformUser } from '../types';
import { rawToContentItems, type RawXTweet, type XTimelineKind } from './graphql';

// Standard public web-client bearer token used by x.com in the user's browser session.
const X_WEB_BEARER =
  'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

type MutationOp = 'DeleteTweet' | 'DeleteRetweet' | 'UnfavoriteTweet' | 'DeleteBookmark';

// Fallback query ids. The real ones are discovered at runtime from the X bundle
// that is already loaded in the page, because X rotates them regularly.
const FALLBACK_QUERY_IDS: Record<MutationOp, string> = {
  DeleteTweet: 'VaenaVgh5q5ih7kvyVjgtg',
  DeleteRetweet: 'iQtK4dl5hBmXewYZuEOKVw',
  UnfavoriteTweet: 'ZYKSe-w7KEslx3JhSIk5LA',
  DeleteBookmark: 'Wlmlj2-xzyS1GN3a6cj-mQ',
};

const QUERY_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

let discoveredQueryIds: Partial<Record<MutationOp, string>> | null = null;

/** Firefox content scripts must use `content.fetch` so requests are made as the page. */
function pageFetch(input: string, init?: RequestInit): Promise<Response> {
  const g = globalThis as unknown as { content?: { fetch?: typeof fetch } };
  if (g.content?.fetch) return g.content.fetch(input, init);
  return fetch(input, init);
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getCurrentXUser(): PlatformUser {
  const twid = getCookie('twid') ?? '';
  const idMatch = twid.match(/u=(\d+)/);
  const id = idMatch?.[1] ?? '';

  let handle = '';
  if (typeof document !== 'undefined') {
    const profileLink = document.querySelector<HTMLAnchorElement>('a[data-testid="AppTabBar_Profile_Link"]');
    const href = profileLink?.getAttribute('href') ?? '';
    if (href) handle = href.replace(/^\//, '').split('/')[0] ?? '';
    if (!handle) {
      const acct = document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]')?.textContent ?? '';
      const m = acct.match(/@([A-Za-z0-9_]+)/);
      if (m?.[1]) handle = m[1];
    }
  }
  return { id, handle };
}

async function resolveQueryIds(): Promise<Partial<Record<MutationOp, string>>> {
  if (discoveredQueryIds) return discoveredQueryIds;
  const found: Partial<Record<MutationOp, string>> = {};
  try {
    const srcs = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))
      .map((s) => s.src)
      .filter((src) => /^https:\/\/abs\.twimg\.com\/responsive-web\/client-web[^/]*\/main\.[^/]+\.js/.test(src));
    for (const src of srcs.slice(0, 2)) {
      const res = await pageFetch(src);
      if (!res.ok) continue;
      const js = await res.text();
      const re = /queryId:"([^"]+)",operationName:"(DeleteTweet|DeleteRetweet|UnfavoriteTweet|DeleteBookmark)"/g;
      for (const m of js.matchAll(re)) {
        if (m[1] && m[2] && QUERY_ID_RE.test(m[1])) {
          found[m[2] as MutationOp] = m[1];
        }
      }
    }
  } catch {
    // fall back to defaults
  }
  discoveredQueryIds = found;
  return found;
}

function buildHeaders(): Record<string, string> {
  const ct0 = getCookie('ct0');
  if (!ct0) {
    throw new Error('Missing X CSRF cookie (ct0). Make sure you are logged in on x.com.');
  }
  return {
    authorization: `Bearer ${X_WEB_BEARER}`,
    'x-csrf-token': ct0,
    'x-twitter-auth-type': 'OAuth2Session',
    'x-twitter-active-user': 'yes',
    'content-type': 'application/json',
  };
}

function computeRetryAfterMs(res: Response): number {
  const reset = res.headers.get('x-rate-limit-reset');
  if (reset) {
    const diff = Number(reset) * 1000 - Date.now();
    if (Number.isFinite(diff) && diff > 0) return Math.min(diff + 2000, 15 * 60 * 1000);
  }
  const retryAfter = Number(res.headers.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
  return 60_000;
}

async function callGraphQl(op: MutationOp, variables: Record<string, unknown>): Promise<Response> {
  const ids = await resolveQueryIds();
  const rawId = ids[op];
  const queryId = rawId && QUERY_ID_RE.test(rawId) ? rawId : FALLBACK_QUERY_IDS[op];
  return pageFetch(`${location.origin}/i/api/graphql/${queryId}/${op}`, {
    method: 'POST',
    credentials: 'include',
    headers: buildHeaders(),
    body: JSON.stringify({ variables, queryId }),
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tryDomDelete(item: ContentItem): Promise<DeleteResult> {
  const link = document.querySelector<HTMLAnchorElement>(`a[href*="/status/${CSS.escape(item.id)}"]`);
  const article = link?.closest('article[data-testid="tweet"]');
  if (!article) return { ok: false, error: 'Tweet not visible in page for fallback deletion' };

  if (item.type === 'like') {
    const btn = article.querySelector<HTMLButtonElement>('button[data-testid="unlike"]');
    if (!btn) return { ok: false, error: 'Unlike button not found' };
    btn.click();
    return { ok: true };
  }
  if (item.type === 'repost') {
    const btn = article.querySelector<HTMLButtonElement>('button[data-testid="unretweet"]');
    if (!btn) return { ok: false, error: 'Unretweet button not found' };
    btn.click();
    await sleep(300);
    const confirm = document.querySelector<HTMLElement>('[data-testid="unretweetConfirm"]');
    if (!confirm) return { ok: false, error: 'Unretweet confirm not found' };
    confirm.click();
    return { ok: true };
  }
  const caret = article.querySelector<HTMLButtonElement>('button[data-testid="caret"]');
  if (!caret) return { ok: false, error: 'More menu button not found' };
  caret.click();
  await sleep(300);
  const menuItems = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  const delItem = menuItems.find((el) => /delete|sil/i.test(el.textContent ?? ''));
  if (!delItem) return { ok: false, error: 'Delete menu item not found' };
  delItem.click();
  await sleep(300);
  const confirm = document.querySelector<HTMLElement>('[data-testid="confirmationSheetConfirm"]');
  if (!confirm) return { ok: false, error: 'Confirmation button not found' };
  confirm.click();
  return { ok: true };
}

export async function deleteXItem(item: ContentItem): Promise<DeleteResult> {
  try {
    let res: Response;
    if (item.type === 'like') {
      res = await callGraphQl('UnfavoriteTweet', { tweet_id: item.id });
    } else if (item.type === 'repost') {
      res = await callGraphQl('DeleteRetweet', { source_tweet_id: item.targetId ?? item.id, dark_request: false });
    } else if (item.type === 'bookmark') {
      res = await callGraphQl('DeleteBookmark', { tweet_id: item.id });
    } else {
      res = await callGraphQl('DeleteTweet', { tweet_id: item.id, dark_request: false });
    }

    if (res.status === 429) {
      return { ok: false, retryAfterMs: computeRetryAfterMs(res), error: 'Rate limited (429)' };
    }
    if (res.status === 404 || res.status === 400 || res.status === 403) {
      discoveredQueryIds = null; // re-discover next time
      const domRes = await tryDomDelete(item);
      if (domRes.ok) return domRes;
      return { ok: false, error: `HTTP ${res.status} (${domRes.error})` };
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 120)}` };
    }

    const json = (await res.json().catch(() => ({}))) as { errors?: Array<{ message?: string; code?: number }> };
    if (json.errors && json.errors.length > 0) {
      const msg = json.errors.map((e) => e.message).join('; ');
      if (json.errors.some((e) => e.code === 144) || /not found|no status/i.test(msg)) {
        return { ok: true, gone: true };
      }
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------- Scanning ----------

const KIND_TYPES: Record<XTimelineKind, ContentType[]> = {
  tweets: ['post', 'reply', 'repost', 'quote'],
  likes: ['like'],
  bookmarks: ['bookmark'],
};

/** DOM fallback, used only if the page data could not be read. */
function parseVisibleTweets(kind: XTimelineKind, handle: string): ContentItem[] {
  const found: ContentItem[] = [];
  const handleLower = handle.toLowerCase();
  for (const article of Array.from(document.querySelectorAll<HTMLElement>('article[data-testid="tweet"]'))) {
    const timeEl = article.querySelector<HTMLTimeElement>('time[datetime]');
    const href = timeEl?.closest<HTMLAnchorElement>('a[href*="/status/"]')?.getAttribute('href') ?? '';
    const match = href.match(/^\/([^/]+)\/status\/(\d+)/);
    if (!match?.[1] || !match[2]) continue;
    const [, author, id] = match;
    const socialContext = article.querySelector('[data-testid="socialContext"]')?.textContent ?? '';

    let type: ContentType;
    if (kind === 'likes') type = 'like';
    else if (kind === 'bookmarks') type = 'bookmark';
    else {
      const isRepost = Boolean(article.querySelector('button[data-testid="unretweet"]')) && author.toLowerCase() !== handleLower;
      if (isRepost) type = 'repost';
      else if (author.toLowerCase() !== handleLower) continue;
      else {
        const txt = article.textContent ?? '';
        type = /Replying to|yanıt olarak|Yanıtlanan/i.test(txt) || location.pathname.endsWith('/with_replies') && article.closest('[data-testid="cellInnerDiv"]')?.previousElementSibling?.querySelector('article') ? 'reply' : 'post';
      }
    }
    const text = article.querySelector<HTMLElement>('[data-testid="tweetText"]')?.innerText ?? '';
    found.push({
      id,
      platform: 'x',
      type,
      text,
      createdAt: timeEl?.getAttribute('datetime') ?? new Date().toISOString(),
      url: `https://x.com${href}`,
      media: Boolean(article.querySelector('[data-testid="tweetPhoto"], [data-testid="videoPlayer"]')),
      pinned: /pinned|sabitlen/i.test(socialContext),
    });
  }
  return found;
}

export interface XScanRequest {
  kind: XTimelineKind;
  /** Content types the user selected; only these are collected. */
  types: ContentType[];
  /** 0 = no limit (scroll until the end of the timeline). */
  maxItems: number;
  /** Logged-in handle passed from background so we never miss ownership on freshly navigated tabs. */
  expectedHandle?: string;
}

export async function scanXTimeline(
  req: XScanRequest,
  getRaw: () => RawXTweet[],
  signal: AbortSignal,
  onProgress: (count: number) => void,
): Promise<ContentItem[]> {
  const allowed = new Set(KIND_TYPES[req.kind].filter((t) => req.types.length === 0 || req.types.includes(t)));
  const collected = new Map<string, ContentItem>();
  const limit = req.maxItems > 0 ? req.maxItems : Number.POSITIVE_INFINITY;

  // Wait for the timeline to render and user identity to be available (max ~15s)
  for (let i = 0; i < 30 && !signal.aborted; i++) {
    const cur = getCurrentXUser();
    const hasIdentity = Boolean(cur.id || cur.handle || req.expectedHandle);
    const hasContent = Boolean(document.querySelector('article[data-testid="tweet"]') || getRaw().length > 0);
    if (hasIdentity && hasContent) break;
    await sleep(500);
  }

  let idleRounds = 0;
  let lastHeight = 0;
  for (let round = 0; round < 3000 && !signal.aborted; round++) {
    const detected = getCurrentXUser();
    const me = {
      id: detected.id,
      handle: detected.handle || req.expectedHandle || '',
    };

    const before = collected.size;
    const fromPage = rawToContentItems(getRaw(), req.kind, me);
    const source = fromPage.length > 0 ? fromPage : parseVisibleTweets(req.kind, me.handle);
    for (const item of source) {
      if (!allowed.has(item.type) || collected.has(item.id)) continue;
      collected.set(item.id, item);
      if (collected.size >= limit) break;
    }
    onProgress(collected.size);
    if (collected.size >= limit) break;

    const height = document.documentElement.scrollHeight;
    if (collected.size === before && height === lastHeight) {
      idleRounds++;
      if (idleRounds >= 6) break; // reached the end of the timeline
    } else {
      idleRounds = 0;
    }
    lastHeight = height;

    window.scrollTo({ top: height, behavior: 'smooth' });
    await sleep(1500 + Math.round(Math.random() * 1000));
  }

  return [...collected.values()];
}
