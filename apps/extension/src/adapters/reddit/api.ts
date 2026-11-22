import type { DeleteOptions } from '../../core/messages';
import type { ContentItem, ContentType, DeleteResult } from '../../core/types';
import type { PlatformUser } from '../types';

export interface RedditUser extends PlatformUser {
  modhash: string;
}

export interface RedditScanStep {
  url: string;
  type: 'comment' | 'post';
}

export function planRedditScanSteps(username: string, selectedTypes: ContentType[]): RedditScanStep[] {
  const clean = username.replace(/^u\//i, '').trim();
  if (!clean) return [];
  const steps: RedditScanStep[] = [];
  if (selectedTypes.includes('comment')) {
    steps.push({ url: `https://www.reddit.com/user/${encodeURIComponent(clean)}/comments/`, type: 'comment' });
  }
  if (selectedTypes.includes('post')) {
    steps.push({ url: `https://www.reddit.com/user/${encodeURIComponent(clean)}/submitted/`, type: 'post' });
  }
  return steps;
}

function pageFetch(input: string, init?: RequestInit): Promise<Response> {
  const g = globalThis as unknown as { content?: { fetch?: typeof fetch } };
  if (g.content?.fetch) return g.content.fetch(input, init);
  return fetch(input, init);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function detectRedditHandleFromPath(pathname: string): string {
  const m = pathname.match(/^\/(?:user|u)\/([^/?#]+)/i);
  const candidate = m?.[1]?.trim() ?? '';
  if (!candidate || /^me$/i.test(candidate)) return '';
  return candidate;
}

export function detectRedditHandleFromDom(): string {
  if (typeof document === 'undefined') return '';

  // 1. Shreddit root element attributes (modern www.reddit.com)
  const shredditApp = document.querySelector('shreddit-app');
  if (shredditApp) {
    const attrHandle =
      shredditApp.getAttribute('user-name') ||
      shredditApp.getAttribute('username') ||
      shredditApp.getAttribute('user-display-name');
    if (attrHandle && !/^me$/i.test(attrHandle.trim())) {
      return attrHandle.replace(/^u\//i, '').trim();
    }
  }

  // 2. User drawer / header profile links in Shreddit
  const selectors = [
    '#user-drawer-content a[href^="/user/"]',
    'reddit-header-large a[href^="/user/"]',
    'header a[href^="/user/"]',
    'a[href^="/user/"][slot]',
    '#header-bottom-right .user a',
  ];
  for (const sel of selectors) {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(sel));
    for (const a of links) {
      const href = a.getAttribute('href') ?? '';
      const parsed = detectRedditHandleFromPath(href);
      if (parsed) return parsed;
    }
  }

  // 3. Current URL path if user is already viewing /user/<handle>/...
  if (typeof location !== 'undefined') {
    const fromPath = detectRedditHandleFromPath(location.pathname);
    if (fromPath) return fromPath;
  }

  return '';
}

let cachedUser: RedditUser | null = null;

async function fetchMeSameOrigin(): Promise<RedditUser | null> {
  try {
    const origin = typeof location !== 'undefined' ? location.origin : 'https://www.reddit.com';
    const res = await pageFetch(`${origin}/api/me.json`, {
      credentials: 'include',
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { id?: string; name?: string; modhash?: string };
    };
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

export async function getCurrentRedditUser(forceRefresh = false): Promise<RedditUser> {
  if (cachedUser && !forceRefresh && cachedUser.handle) return cachedUser;

  // Same-origin /api/me.json only (cross-origin old.reddit.com is handled by background worker).
  const apiUser = await fetchMeSameOrigin();
  const domHandle = detectRedditHandleFromDom();

  const handle = apiUser?.handle || domHandle;
  if (!handle) return { id: apiUser?.id ?? '', handle: '', modhash: apiUser?.modhash ?? '' };

  cachedUser = {
    id: apiUser?.id ?? '',
    handle,
    modhash: apiUser?.modhash ?? '',
  };
  return cachedUser;
}

const WORD_POOL = [
  'amber', 'breeze', 'cedar', 'delta', 'ember', 'fjord', 'grove', 'harbor',
  'ivory', 'juniper', 'kelp', 'lumen', 'meadow', 'nebula', 'opal', 'pebble',
  'quartz', 'ripple', 'summit', 'timber', 'umbra', 'velvet', 'willow', 'zephyr',
];

export function generateOverwriteText(passIndex: number): string {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const words = Array.from(bytes, (b) => WORD_POOL[b % WORD_POOL.length]);
  return `${words.join(' ')} [${passIndex + 1}]`;
}

export function toFullname(item: ContentItem): string {
  if (/^t[13]_/i.test(item.id)) return item.id;
  return item.type === 'comment' ? `t1_${item.id}` : `t3_${item.id}`;
}

export function parseRedditRateLimitMs(json: unknown): number | undefined {
  const str = JSON.stringify(json ?? '');
  if (!/RATELIMIT/i.test(str)) return undefined;
  const minMatch = str.match(/(\d+)\s*minute/i);
  if (minMatch?.[1]) return (Number(minMatch[1]) * 60 + 5) * 1000;
  const secMatch = str.match(/(\d+)\s*second/i);
  if (secMatch?.[1]) return (Number(secMatch[1]) + 3) * 1000;
  return 60_000;
}

async function postRedditFormSameOrigin(
  path: string,
  params: Record<string, string>,
  modhash: string,
): Promise<Response> {
  const origin = typeof location !== 'undefined' ? location.origin : 'https://www.reddit.com';
  const body = new URLSearchParams({ ...params, ...(modhash ? { uh: modhash } : {}) });
  const headers: Record<string, string> = {
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    ...(modhash ? { 'x-modhash': modhash } : {}),
  };

  return pageFetch(`${origin}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: body.toString(),
  });
}

async function tryRedditDomDelete(item: ContentItem): Promise<DeleteResult> {
  if (typeof document === 'undefined') {
    return { ok: false, error: 'DOM fallback unavailable outside page' };
  }
  const fullname = toFullname(item);

  // Old Reddit DOM deletion
  const oldThing = document.querySelector<HTMLElement>(`.thing[data-fullname="${CSS.escape(fullname)}"]`);
  if (oldThing) {
    const delLink = oldThing.querySelector<HTMLAnchorElement>('form.del-button a.togglebutton');
    if (delLink) {
      delLink.click();
      await sleep(250);
      const yesLink = oldThing.querySelector<HTMLAnchorElement>('form.del-button .option.error a.yes');
      if (yesLink) {
        yesLink.click();
        await sleep(500);
        return { ok: true };
      }
    }
  }

  // Shreddit DOM fallback: locate matching comment/post element and open overflow menu
  const target =
    document.querySelector<HTMLElement>(`shreddit-profile-comment[comment-id="${CSS.escape(fullname)}"]`) ??
    document.querySelector<HTMLElement>(`shreddit-comment[thingid="${CSS.escape(fullname)}"]`) ??
    document.querySelector<HTMLElement>(`shreddit-post[id="${CSS.escape(fullname)}"]`);

  if (!target) {
    return { ok: false, error: 'Item not found on current Reddit page for DOM deletion.' };
  }

  const overflow =
    target.querySelector<HTMLElement>('shreddit-comment-action-row, shreddit-post-overflow-menu, [slot="overflow"]') ??
    target;
  const menuBtn = overflow.querySelector<HTMLElement>('button[aria-label*="more" i], button[aria-label*="overflow" i]');
  if (menuBtn) {
    menuBtn.click();
    await sleep(300);
    const deleteOption = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"], li, button')).find(
      (el) => /^(delete|sil|delete comment|delete post)$/i.test((el.textContent ?? '').trim()),
    );
    if (deleteOption) {
      deleteOption.click();
      await sleep(400);
      const confirmBtn = Array.from(document.querySelectorAll<HTMLElement>('button')).find((el) =>
        /^(delete|confirm|yes|sil)$/i.test((el.textContent ?? '').trim()),
      );
      if (confirmBtn) {
        confirmBtn.click();
        await sleep(500);
        return { ok: true };
      }
    }
  }

  return { ok: false, error: 'Could not find Reddit delete control in DOM.' };
}

export async function deleteRedditItem(
  item: ContentItem,
  options?: DeleteOptions,
): Promise<DeleteResult> {
  try {
    const user = await getCurrentRedditUser();
    if (!user.handle) {
      return { ok: false, error: 'Not logged into Reddit. Open reddit.com and sign in.' };
    }

    const fullname = toFullname(item);
    const passes = Math.min(3, Math.max(0, options?.redditOverwritePasses ?? 2));
    const customText = options?.redditOverwriteText?.trim() ?? '';
    const canEdit = item.type === 'comment' || item.meta?.isSelf !== false;

    if (canEdit && passes > 0) {
      for (let p = 0; p < passes; p++) {
        const text = customText || generateOverwriteText(p);
        const editRes = await postRedditFormSameOrigin(
          '/api/editusertext',
          { api_type: 'json', thing_id: fullname, text },
          user.modhash,
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

    const delRes = await postRedditFormSameOrigin('/api/del', { id: fullname }, user.modhash);
    if (delRes.status === 429) {
      return { ok: false, retryAfterMs: 60_000, error: 'Reddit rate limit (429)' };
    }
    if (delRes.status === 404) {
      return { ok: true, gone: true };
    }
    if (delRes.ok) {
      return { ok: true };
    }

    // Fallback to DOM deletion if same-origin /api/del fails
    const domRes = await tryRedditDomDelete(item);
    if (domRes.ok) return domRes;

    const body = await delRes.text().catch(() => '');
    return { ok: false, error: `HTTP ${delRes.status}: ${body.slice(0, 120)}` };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export interface RedditListingChild {
  kind?: string;
  data?: {
    id?: string;
    name?: string;
    body?: string;
    title?: string;
    selftext?: string;
    created_utc?: number;
    score?: number;
    permalink?: string;
    subreddit_name_prefixed?: string;
    subreddit?: string;
    is_self?: boolean;
    is_video?: boolean;
    post_hint?: string;
    pinned?: boolean;
    stickied?: boolean;
  };
}

export function parseRedditListingChildren(
  children: RedditListingChild[],
  type: 'comment' | 'post',
): ContentItem[] {
  const out: ContentItem[] = [];
  for (const ch of children) {
    const d = ch?.data;
    if (!d) continue;
    const fullname = d.name || (d.id ? `${type === 'comment' ? 't1' : 't3'}_${d.id}` : '');
    if (!fullname) continue;

    const text =
      type === 'comment'
        ? String(d.body ?? '')
        : [d.title, d.selftext].filter((s) => Boolean(s && s.trim())).join('\n\n');
    const createdAt =
      typeof d.created_utc === 'number'
        ? new Date(d.created_utc * 1000).toISOString()
        : new Date(0).toISOString();
    const permalink = d.permalink
      ? d.permalink.startsWith('http')
        ? d.permalink
        : `https://www.reddit.com${d.permalink}`
      : 'https://www.reddit.com';

    out.push({
      id: fullname,
      platform: 'reddit',
      type,
      text,
      createdAt,
      url: permalink,
      metrics: {
        likes: typeof d.score === 'number' ? d.score : 0,
        score: typeof d.score === 'number' ? d.score : 0,
      },
      source: d.subreddit_name_prefixed || (d.subreddit ? `r/${d.subreddit}` : undefined),
      media: Boolean(d.is_video || d.post_hint === 'image' || d.post_hint === 'hosted:video'),
      pinned: Boolean(d.pinned || d.stickied),
      meta: { isSelf: type === 'comment' ? true : Boolean(d.is_self) },
    });
  }
  return out;
}

function toIsoTs(raw?: string | null): string {
  if (!raw) return new Date(0).toISOString();
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? new Date(0).toISOString() : new Date(ms).toISOString();
}

function normalizeRedditUrl(href: string): string {
  if (!href) return 'https://www.reddit.com';
  return href.startsWith('http') ? href : `https://www.reddit.com${href.startsWith('/') ? '' : '/'}${href}`;
}

export function parseVisibleRedditDom(type: 'comment' | 'post', username: string, doc: Document = document): ContentItem[] {
  const found = new Map<string, ContentItem>();
  const cleanUser = username.replace(/^u\//i, '').toLowerCase();

  if (type === 'comment') {
    // 1. Modern Shreddit profile comment elements
    const shredditComments = Array.from(
      doc.querySelectorAll<HTMLElement>('shreddit-profile-comment, shreddit-comment'),
    );
    for (const el of shredditComments) {
      const rawId = el.getAttribute('comment-id') || el.getAttribute('thingid') || el.getAttribute('id') || '';
      const linkEl = el.querySelector<HTMLAnchorElement>('a[href*="/comments/"]');
      const href = el.getAttribute('permalink') || linkEl?.getAttribute('href') || '';
      const idFromHref = href.match(/\/comments\/[^/]+\/[^/]+\/([a-z0-9]+)/i)?.[1] ?? '';
      const rawNormalized = rawId.replace(/-comment$/i, '');
      const fullname = /^t1_/i.test(rawNormalized)
        ? rawNormalized
        : rawNormalized && /^[a-z0-9]+$/i.test(rawNormalized)
          ? `t1_${rawNormalized}`
          : idFromHref
            ? `t1_${idFromHref}`
            : '';
      if (!fullname || found.has(fullname)) continue;

      const authorAttr = (el.getAttribute('author') ?? '').toLowerCase();
      if (cleanUser && authorAttr && authorAttr !== cleanUser) continue;

      const textEl =
        el.querySelector<HTMLElement>('[id$="-comment-rtjson-content"], [slot="comment"], .md, [data-testid="comment"]') ??
        null;
      const text = (textEl?.textContent ?? el.getAttribute('body') ?? '').trim();
      const subMatch = href.match(/\/r\/([^/]+)\//i);
      const subAttr = el.getAttribute('subreddit-prefixed-name') || el.getAttribute('subreddit');
      const source = subAttr
        ? subAttr.startsWith('r/')
          ? subAttr
          : `r/${subAttr}`
        : subMatch?.[1]
          ? `r/${subMatch[1]}`
          : undefined;
      const score = Number(el.getAttribute('score') ?? 0) || 0;
      const ts =
        el.getAttribute('created-timestamp') ||
        el.querySelector('time')?.getAttribute('datetime') ||
        el.querySelector('faceplate-timeago')?.getAttribute('ts');

      found.set(fullname, {
        id: fullname,
        platform: 'reddit',
        type: 'comment',
        text,
        createdAt: toIsoTs(ts),
        url: normalizeRedditUrl(href),
        metrics: { likes: score, score },
        source,
        meta: { isSelf: true },
      });
    }

    // 2. Old Reddit comment rows (.thing.comment)
    for (const thing of Array.from(doc.querySelectorAll<HTMLElement>('.thing.comment'))) {
      const fullname = thing.getAttribute('data-fullname') || '';
      if (!fullname || found.has(fullname)) continue;
      const authorAttr = (thing.getAttribute('data-author') ?? '').toLowerCase();
      if (cleanUser && authorAttr && authorAttr !== cleanUser) continue;

      const href = thing.querySelector<HTMLAnchorElement>('a.bylink')?.getAttribute('href') ?? '';
      const text = (thing.querySelector<HTMLElement>('.usertext-body .md')?.textContent ?? '').trim();
      const sub = thing.getAttribute('data-subreddit-prefixed') || thing.getAttribute('data-subreddit');
      const ts = thing.querySelector('time')?.getAttribute('datetime');

      found.set(fullname, {
        id: fullname,
        platform: 'reddit',
        type: 'comment',
        text,
        createdAt: toIsoTs(ts),
        url: normalizeRedditUrl(href),
        source: sub ? (sub.startsWith('r/') ? sub : `r/${sub}`) : undefined,
        meta: { isSelf: true },
      });
    }

    // 3. Generic Shreddit profile feed article fallback
    if (found.size === 0) {
      for (const art of Array.from(doc.querySelectorAll<HTMLElement>('article'))) {
        const link = art.querySelector<HTMLAnchorElement>('a[href*="/comments/"]');
        const href = link?.getAttribute('href') ?? '';
        const idMatch = href.match(/\/r\/([^/]+)\/comments\/[^/]+\/[^/]+\/([a-z0-9]+)/i);
        if (!idMatch?.[2]) continue;
        const fullname = `t1_${idMatch[2]}`;
        if (found.has(fullname)) continue;

        const bodyEl = art.querySelector<HTMLElement>('[id*="rtjson-content"], .md, p');
        const text = (bodyEl?.textContent ?? art.textContent ?? '').trim().slice(0, 2000);
        const ts =
          art.querySelector('time')?.getAttribute('datetime') ||
          art.querySelector('faceplate-timeago')?.getAttribute('ts');

        found.set(fullname, {
          id: fullname,
          platform: 'reddit',
          type: 'comment',
          text,
          createdAt: toIsoTs(ts),
          url: normalizeRedditUrl(href),
          source: idMatch[1] ? `r/${idMatch[1]}` : undefined,
          meta: { isSelf: true },
        });
      }
    }
  } else {
    // Posts: 1. Shreddit <shreddit-post>
    for (const post of Array.from(doc.querySelectorAll<HTMLElement>('shreddit-post'))) {
      const rawId = post.getAttribute('id') || post.getAttribute('thingid') || '';
      const href = post.getAttribute('permalink') || post.querySelector<HTMLAnchorElement>('a[href*="/comments/"]')?.getAttribute('href') || '';
      const idFromHref = href.match(/\/comments\/([a-z0-9]+)/i)?.[1] ?? '';
      const fullname = /^t3_/i.test(rawId) ? rawId : rawId ? `t3_${rawId}` : idFromHref ? `t3_${idFromHref}` : '';
      if (!fullname || found.has(fullname)) continue;

      const authorAttr = (post.getAttribute('author') ?? '').toLowerCase();
      if (cleanUser && authorAttr && authorAttr !== cleanUser) continue;

      const title = post.getAttribute('post-title') || post.querySelector('[slot="title"]')?.textContent || '';
      const body = post.querySelector('[slot="text-body"], [id$="-post-rtjson-content"]')?.textContent || '';
      const text = [title.trim(), body.trim()].filter(Boolean).join('\n\n');
      const subAttr = post.getAttribute('subreddit-prefixed-name') || post.getAttribute('subreddit');
      const score = Number(post.getAttribute('score') ?? 0) || 0;
      const ts =
        post.getAttribute('created-timestamp') ||
        post.querySelector('time')?.getAttribute('datetime') ||
        post.querySelector('faceplate-timeago')?.getAttribute('ts');

      found.set(fullname, {
        id: fullname,
        platform: 'reddit',
        type: 'post',
        text,
        createdAt: toIsoTs(ts),
        url: normalizeRedditUrl(href),
        metrics: { likes: score, score },
        source: subAttr ? (subAttr.startsWith('r/') ? subAttr : `r/${subAttr}`) : undefined,
        meta: { isSelf: Boolean(body.trim()) || post.getAttribute('post-type') === 'text' },
      });
    }

    // 2. Old Reddit post rows (.thing.link)
    for (const thing of Array.from(doc.querySelectorAll<HTMLElement>('.thing.link'))) {
      const fullname = thing.getAttribute('data-fullname') || '';
      if (!fullname || found.has(fullname)) continue;
      const authorAttr = (thing.getAttribute('data-author') ?? '').toLowerCase();
      if (cleanUser && authorAttr && authorAttr !== cleanUser) continue;

      const titleEl = thing.querySelector<HTMLAnchorElement>('a.title');
      const href = thing.getAttribute('data-permalink') || thing.querySelector<HTMLAnchorElement>('a.comments')?.getAttribute('href') || '';
      const sub = thing.getAttribute('data-subreddit-prefixed') || thing.getAttribute('data-subreddit');
      const ts = thing.querySelector('time')?.getAttribute('datetime');

      found.set(fullname, {
        id: fullname,
        platform: 'reddit',
        type: 'post',
        text: (titleEl?.textContent ?? '').trim(),
        createdAt: toIsoTs(ts),
        url: normalizeRedditUrl(href),
        source: sub ? (sub.startsWith('r/') ? sub : `r/${sub}`) : undefined,
        meta: { isSelf: thing.classList.contains('self') },
      });
    }

    // 3. Generic Shreddit article fallback
    if (found.size === 0) {
      for (const art of Array.from(doc.querySelectorAll<HTMLElement>('article'))) {
        const link = art.querySelector<HTMLAnchorElement>('a[href*="/comments/"]');
        const href = link?.getAttribute('href') ?? '';
        const idMatch = href.match(/\/r\/([^/]+)\/comments\/([a-z0-9]+)/i);
        if (!idMatch?.[2]) continue;
        const fullname = `t3_${idMatch[2]}`;
        if (found.has(fullname)) continue;

        const title = art.querySelector('a[slot="title"], h1, h2, h3')?.textContent ?? '';
        const ts =
          art.querySelector('time')?.getAttribute('datetime') ||
          art.querySelector('faceplate-timeago')?.getAttribute('ts');

        found.set(fullname, {
          id: fullname,
          platform: 'reddit',
          type: 'post',
          text: title.trim() || (art.textContent ?? '').trim().slice(0, 300),
          createdAt: toIsoTs(ts),
          url: normalizeRedditUrl(href),
          source: idMatch[1] ? `r/${idMatch[1]}` : undefined,
          meta: { isSelf: true },
        });
      }
    }
  }

  return [...found.values()];
}

async function scanRedditDomTimeline(
  type: 'comment' | 'post',
  username: string,
  maxItems: number,
  signal: AbortSignal,
  onProgress: (count: number) => void,
): Promise<ContentItem[]> {
  const limit = maxItems > 0 ? maxItems : Number.POSITIVE_INFINITY;
  const collected = new Map<string, ContentItem>();

  // Wait up to ~12s for Shreddit components / DOM items to render
  for (let i = 0; i < 24 && !signal.aborted; i++) {
    if (parseVisibleRedditDom(type, username).length > 0) break;
    await sleep(500);
  }

  let idleRounds = 0;
  let lastHeight = 0;

  for (let round = 0; round < 400 && !signal.aborted; round++) {
    const before = collected.size;
    for (const item of parseVisibleRedditDom(type, username)) {
      if (collected.has(item.id)) continue;
      collected.set(item.id, item);
      if (collected.size >= limit) break;
    }
    onProgress(collected.size);
    if (collected.size >= limit) break;

    const height = document.documentElement.scrollHeight;
    if (collected.size === before && height === lastHeight) {
      // Click any "Load more" / pagination button if Shreddit paused lazy-loading
      const moreBtn = Array.from(document.querySelectorAll<HTMLElement>('button, a')).find((el) =>
        /^(load more|view more|next|sonraki|daha fazla yükle)$/i.test((el.textContent ?? '').trim()),
      );
      if (moreBtn) {
        moreBtn.click();
        await sleep(1500);
      }
      idleRounds++;
      if (idleRounds >= 6) break;
    } else {
      idleRounds = 0;
    }
    lastHeight = height;

    window.scrollTo({ top: height, behavior: 'smooth' });
    await sleep(1400 + Math.round(Math.random() * 800));
  }

  return [...collected.values()];
}

export async function scanRedditTimeline(
  type: 'comment' | 'post',
  username: string,
  maxItems: number,
  signal: AbortSignal,
  onProgress: (count: number) => void,
): Promise<ContentItem[]> {
  const clean = username.replace(/^u\//i, '').trim() || detectRedditHandleFromDom();
  if (!clean) throw new Error('Reddit username not found. Sign in on reddit.com first.');

  const origin = typeof location !== 'undefined' ? location.origin : 'https://www.reddit.com';
  const endpoint = type === 'comment' ? 'comments' : 'submitted';
  const limit = maxItems > 0 ? maxItems : Number.POSITIVE_INFINITY;
  const collected = new Map<string, ContentItem>();

  // Layer 1: Try same-origin Reddit listing JSON (do not throw if blocked with 403/400 on www.reddit.com)
  try {
    let after: string | null = null;
    for (let page = 0; page < 50 && !signal.aborted; page++) {
      const qs = new URLSearchParams({ limit: '100', raw_json: '1' });
      if (after) qs.set('after', after);
      const url = `${origin}/user/${encodeURIComponent(clean)}/${endpoint}.json?${qs.toString()}`;

      const res = await pageFetch(url, {
        credentials: 'include',
        headers: { accept: 'application/json' },
      });

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
      onProgress(collected.size);

      if (collected.size >= limit) break;
      after = json?.data?.after ?? null;
      if (!after) break;

      await sleep(800 + Math.round(Math.random() * 400));
    }
  } catch {
    // Fall through to Layer 2 DOM scanner
  }

  if (collected.size > 0 || signal.aborted) {
    return [...collected.values()];
  }

  // Layer 2: Shreddit / Old-Reddit live DOM scanner with auto-scroll
  return scanRedditDomTimeline(type, clean, maxItems, signal, onProgress);
}
