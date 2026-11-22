import type { ContentItem, DeleteResult } from '../../core/types';
import type { PlatformUser } from '../types';
import {
  capturedToContentItems,
  shortcodeToMediaId,
  type CapturedIgItem,
} from './parser';

const IG_WEB_APP_ID = '936619743392459';
const DIGITS_RE = /^\d+$/;

function pageFetch(input: string, init?: RequestInit): Promise<Response> {
  const g = globalThis as unknown as { content?: { fetch?: typeof fetch } };
  if (g.content?.fetch) return g.content.fetch(input, init);
  return fetch(input, init);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function getIgCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

export function getCurrentInstagramUser(): PlatformUser {
  const id = getIgCookie('ds_user_id') ?? '';
  let handle = '';
  if (typeof document !== 'undefined') {
    const profileImg = document.querySelector<HTMLImageElement>('img[alt*="profile picture"], img[alt*="profil resmi"]');
    const link = profileImg?.closest<HTMLAnchorElement>('a[href^="/"]');
    const href = link?.getAttribute('href') ?? '';
    if (href && /^\/[A-Za-z0-9._]+\/?$/.test(href)) {
      handle = href.replace(/^\/|\/$/g, '');
    }
  }
  return { id, handle };
}

function buildIgHeaders(): Record<string, string> {
  const csrf = getIgCookie('csrftoken');
  if (!csrf) {
    throw new Error('Missing Instagram CSRF cookie. Make sure you are logged in on instagram.com.');
  }
  return {
    'x-csrftoken': csrf,
    'x-ig-app-id': IG_WEB_APP_ID,
    'x-requested-with': 'XMLHttpRequest',
    'content-type': 'application/x-www-form-urlencoded',
  };
}

function isRateLimitedBody(text: string): boolean {
  return /please wait a few minutes|feedback_required|rate limit|try again later/i.test(text);
}

function findDirectChatScrollContainer(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const main = document.querySelector<HTMLElement>('[role="main"]') ?? document.body;
  const grid = main.querySelector<HTMLElement>('[role="grid"]');
  const start: HTMLElement | null = grid ?? main;
  const candidates: HTMLElement[] = [];

  if (start) {
    let cur: HTMLElement | null = start;
    while (cur && cur !== document.body) {
      candidates.push(cur);
      cur = cur.parentElement;
    }
    for (const el of Array.from(start.querySelectorAll<HTMLElement>('div'))) {
      if (el.scrollHeight > el.clientHeight + 40 && el.clientHeight > 180) {
        candidates.push(el);
      }
    }
  }

  for (const el of candidates) {
    const cs = getComputedStyle(el);
    if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 10) {
      return el;
    }
  }
  return null;
}

function isOwnDirectRow(row: HTMLElement, containerRect: DOMRect): boolean {
  const rowText = (row.textContent ?? '').trim();
  if (!rowText) return false;
  // Screen-reader prefix Instagram attaches to own outgoing bubbles (EN/TR)
  if (/\b(you sent|sen gönderdin|şunu gönderdin)\b/i.test(rowText)) return true;

  // Recipient bubbles display a small profile picture avatar on the left; own bubbles do not
  const hasAvatar = Boolean(
    row.querySelector('img[alt*="profile" i], img[alt*="profil" i], a[href^="/"] img'),
  );
  if (hasAvatar) return false;

  // Geometry heuristic: own bubbles are anchored on the right half of the thread container
  const bubbles = Array.from(row.querySelectorAll<HTMLElement>('div[dir="auto"], div[role="button"]'));
  for (const b of bubbles) {
    const r = b.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > containerRect.left + containerRect.width * 0.65 && r.left > containerRect.left + containerRect.width * 0.22) {
      return true;
    }
  }
  return false;
}

function extractDirectRowText(row: HTMLElement): string {
  const dirEls = Array.from(row.querySelectorAll<HTMLElement>('div[dir="auto"], span[dir="auto"]'));
  const parts = dirEls
    .map((el) => (el.innerText ?? '').trim())
    .filter((t) => t.length > 0 && !/^(you sent|sen gönderdin|şunu gönderdin)$/i.test(t));
  if (parts.length > 0) return [...new Set(parts)].join(' ').trim();
  return (row.innerText ?? '').replace(/\b(you sent|sen gönderdin|şunu gönderdin)\b/gi, '').trim();
}

function parseVisibleDirectDom(threadId: string): ContentItem[] {
  const container = findDirectChatScrollContainer();
  const containerRect = container?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  const rows = Array.from(
    (container ?? document).querySelectorAll<HTMLElement>('[role="row"], [role="gridcell"]'),
  );
  const out: ContentItem[] = [];
  const seen = new Set<string>();
  let idx = 0;

  for (const row of rows) {
    // Avoid double-counting nested gridcell inside row
    if (row.getAttribute('role') === 'gridcell' && row.closest('[role="row"]')) continue;
    if (!isOwnDirectRow(row, containerRect)) continue;

    const text = extractDirectRowText(row);
    if (!text || text.length > 2000) continue;
    idx++;
    const sig = `${idx}:${text.slice(0, 100)}`;
    if (seen.has(sig)) continue;
    seen.add(sig);

    out.push({
      id: `dom_ig_dm_${idx}_${Math.abs(hashText(sig))}`,
      platform: 'instagram',
      type: 'message',
      text,
      createdAt: new Date(0).toISOString(),
      url: threadId ? `https://www.instagram.com/direct/t/${threadId}/` : location.href,
      meta: { threadId: threadId || undefined, domFallback: true },
    });
  }
  return out;
}

async function tryDirectDomUnsend(item: ContentItem): Promise<DeleteResult> {
  if (typeof document === 'undefined') {
    return { ok: false, error: 'DOM fallback unavailable outside page' };
  }
  const container = findDirectChatScrollContainer();
  const containerRect = container?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  const targetNorm = (item.text || '').trim().toLowerCase();

  const findRow = (): HTMLElement | null => {
    const rows = Array.from(
      (container ?? document).querySelectorAll<HTMLElement>('[role="row"], [role="gridcell"]'),
    );
    for (const row of rows) {
      if (row.getAttribute('role') === 'gridcell' && row.closest('[role="row"]')) continue;
      if (!isOwnDirectRow(row, containerRect)) continue;
      const rowText = extractDirectRowText(row).toLowerCase();
      if (targetNorm && (rowText === targetNorm || rowText.includes(targetNorm.slice(0, 60)))) {
        return row;
      }
    }
    return null;
  };

  let matchedRow = findRow();
  for (let tries = 0; tries < 10 && !matchedRow && container; tries++) {
    if (container.scrollTop <= 0) break;
    container.scrollTop = Math.max(0, container.scrollTop - Math.round(container.clientHeight * 0.7));
    await sleep(600);
    matchedRow = findRow();
  }

  if (!matchedRow) {
    return { ok: false, error: 'Message row not visible in the open Instagram chat.' };
  }

  matchedRow.scrollIntoView({ block: 'center' });
  await sleep(250);

  // Dispatch hover events to reveal the 3-dot More / Actions button on the bubble
  for (const evtName of ['mouseenter', 'mouseover', 'pointermove']) {
    matchedRow.dispatchEvent(new MouseEvent(evtName, { bubbles: true }));
  }
  await sleep(300);

  const moreBtn =
    matchedRow.querySelector<HTMLElement>(
      '[aria-label*="More" i], [aria-label*="Daha fazla" i], [aria-label*="options" i], [aria-label*="seçenek" i]',
    ) ??
    matchedRow.querySelector<HTMLElement>('[role="button"]');
  if (!moreBtn) {
    return { ok: false, error: 'Message menu button (More) not found on hover.' };
  }
  moreBtn.click();
  await sleep(400);

  const unsendOpt = Array.from(
    document.querySelectorAll<HTMLElement>('[role="menuitem"], [role="button"], button, span'),
  ).find((el) => /^(unsend|gönderimi geri al|geri al)$/i.test((el.textContent ?? '').trim()));
  if (!unsendOpt) {
    return { ok: false, error: 'Unsend menu option not found.' };
  }
  unsendOpt.click();
  await sleep(450);

  const dialog = document.querySelector('[role="dialog"]') ?? document;
  const confirmBtn = Array.from(dialog.querySelectorAll<HTMLElement>('button, div[role="button"]')).find((el) =>
    /^(unsend|gönderimi geri al|geri al)$/i.test((el.textContent ?? '').trim()),
  );
  if (confirmBtn) {
    confirmBtn.click();
    await sleep(550);
  }
  return { ok: true };
}

async function tryYourActivityDomDelete(item: ContentItem): Promise<DeleteResult> {
  if (typeof document === 'undefined') {
    return { ok: false, error: 'DOM fallback unavailable outside page' };
  }

  // Click "Select" / "Seç" button if checkboxes are not yet visible
  const hasCheckboxes = Boolean(
    document.querySelector('[aria-label="Toggle checkbox"], [role="checkbox"], input[type="checkbox"]'),
  );
  if (!hasCheckboxes) {
    const selectBtn = Array.from(document.querySelectorAll<HTMLElement>('span, button, div[role="button"]')).find(
      (el) => /^(select|seç)$/i.test((el.textContent ?? '').trim()),
    );
    if (selectBtn) {
      selectBtn.click();
      await sleep(500);
    }
  }

  // Find the matching row by comment text or shortcode
  const targetText = (item.text || '').trim().toLowerCase();
  const code = typeof item.meta?.code === 'string' ? item.meta.code : '';
  const checkboxes = Array.from(
    document.querySelectorAll<HTMLElement>('[aria-label="Toggle checkbox"], [role="checkbox"], input[type="checkbox"]'),
  );

  let matchedBox: HTMLElement | null = null;
  for (const box of checkboxes) {
    const row = box.closest('[data-bloks-name], article, li, div[style]')?.parentElement ?? box.parentElement;
    if (!row) continue;
    if (code && row.querySelector(`a[href*="/${CSS.escape(code)}"]`)) {
      matchedBox = box;
      break;
    }
    if (targetText && (row.textContent ?? '').toLowerCase().includes(targetText.slice(0, 60))) {
      matchedBox = box;
      break;
    }
  }

  if (!matchedBox) {
    return {
      ok: false,
      error: 'Item not visible on the Instagram Your Activity page for DOM deletion.',
    };
  }

  matchedBox.click();
  await sleep(400);

  // Click Delete / Unlike / Sil / Beğenmekten vazgeç
  const actionBtn = Array.from(document.querySelectorAll<HTMLElement>('span, button, div[role="button"]')).find(
    (el) => /^(delete|unlike|sil|beğenmekten vazgeç)(\s*\(\d+\))?$/i.test((el.textContent ?? '').trim()),
  );
  if (!actionBtn) {
    return { ok: false, error: 'Delete/Unlike button not found on Instagram page.' };
  }
  actionBtn.click();
  await sleep(500);

  // Confirm modal dialog
  const dialog = document.querySelector('[role="dialog"]') ?? document;
  const confirmBtn = Array.from(dialog.querySelectorAll<HTMLElement>('button, div[role="button"]')).find((el) =>
    /^(delete|unlike|sil|beğenmekten vazgeç)$/i.test((el.textContent ?? '').trim()),
  );
  if (!confirmBtn) {
    return { ok: false, error: 'Confirmation button not found in Instagram dialog.' };
  }
  confirmBtn.click();
  await sleep(600);
  return { ok: true };
}

export async function deleteInstagramMessage(item: ContentItem): Promise<DeleteResult> {
  const threadId =
    (typeof item.meta?.threadId === 'string' && item.meta.threadId) ||
    (typeof location !== 'undefined' ? location.pathname.match(/\/direct\/t\/(\d+)/)?.[1] ?? '' : '');
  const itemId =
    (typeof item.meta?.itemId === 'string' && item.meta.itemId) ||
    (DIGITS_RE.test(item.id) ? item.id : '');

  if (DIGITS_RE.test(threadId) && DIGITS_RE.test(itemId) && !item.meta?.domFallback) {
    const res = await pageFetch(
      `${location.origin}/api/v1/direct_v2/threads/${encodeURIComponent(threadId)}/items/${encodeURIComponent(itemId)}/delete/`,
      {
        method: 'POST',
        credentials: 'include',
        headers: buildIgHeaders(),
        body: new URLSearchParams({ send_error: 'false' }).toString(),
      },
    );
    const bodyText = await res.text().catch(() => '');
    if (res.status === 429 || isRateLimitedBody(bodyText)) {
      return {
        ok: false,
        retryAfterMs: 120_000,
        error: 'Instagram rate limit reached — cooling down automatically.',
      };
    }
    if (res.status === 404) return { ok: true, gone: true };
    if (res.ok) return { ok: true };
  }

  return tryDirectDomUnsend(item);
}

export async function deleteInstagramItem(item: ContentItem): Promise<DeleteResult> {
  try {
    if (item.type === 'message') {
      return await deleteInstagramMessage(item);
    }

    const mediaIdRaw =
      typeof item.meta?.mediaId === 'string' && item.meta.mediaId
        ? item.meta.mediaId
        : typeof item.meta?.code === 'string' && item.meta.code
          ? shortcodeToMediaId(item.meta.code)
          : DIGITS_RE.test(item.id)
            ? item.id
            : '';
    const mediaId = DIGITS_RE.test(mediaIdRaw) ? mediaIdRaw : '';

    let res: Response | null = null;

    if (item.type === 'comment' && mediaId && DIGITS_RE.test(item.id)) {
      res = await pageFetch(
        `${location.origin}/api/v1/web/comments/${mediaId}/delete/${item.id}/`,
        {
          method: 'POST',
          credentials: 'include',
          headers: buildIgHeaders(),
        },
      );
    } else if (item.type === 'like' && mediaId) {
      res = await pageFetch(`${location.origin}/api/v1/web/likes/${mediaId}/unlike/`, {
        method: 'POST',
        credentials: 'include',
        headers: buildIgHeaders(),
      });
    } else if (item.type === 'post' && mediaId) {
      res = await pageFetch(`${location.origin}/api/v1/create/${mediaId}/delete/`, {
        method: 'POST',
        credentials: 'include',
        headers: buildIgHeaders(),
      });
      if (res.status === 404) {
        res = await pageFetch(
          `${location.origin}/api/v1/media/${mediaId}/delete/?media_type=PHOTO`,
          {
            method: 'POST',
            credentials: 'include',
            headers: buildIgHeaders(),
          },
        );
      }
    }

    if (res) {
      const bodyText = await res.text().catch(() => '');
      if (res.status === 429 || isRateLimitedBody(bodyText)) {
        return {
          ok: false,
          retryAfterMs: 120_000,
          error: 'Instagram rate limit reached — cooling down automatically.',
        };
      }
      if (res.status === 404) return { ok: true, gone: true };
      if (res.ok) return { ok: true };
    }

    // Fallback: DOM deletion inside Your Activity page
    return await tryYourActivityDomDelete(item);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function scanOwnPostsViaApi(
  userId: string,
  limit: number,
  signal: AbortSignal,
  onProgress: (count: number) => void,
): Promise<ContentItem[]> {
  const out: ContentItem[] = [];
  let maxId = '';
  for (let page = 0; page < 50 && !signal.aborted; page++) {
    const qs = new URLSearchParams({ count: '33' });
    if (maxId) qs.set('max_id', maxId);
    const res = await pageFetch(`${location.origin}/api/v1/feed/user/${encodeURIComponent(userId)}/?${qs.toString()}`, {
      credentials: 'include',
      headers: {
        'x-ig-app-id': IG_WEB_APP_ID,
        'x-requested-with': 'XMLHttpRequest',
      },
    });
    if (!res.ok) break;
    const json = (await res.json()) as {
      items?: Array<{
        pk?: string | number;
        id?: string;
        code?: string;
        taken_at?: number;
        like_count?: number;
        caption?: { text?: string } | null;
      }>;
      next_max_id?: string;
      more_available?: boolean;
    };
    const list = json.items ?? [];
    if (list.length === 0) break;

    for (const it of list) {
      const mediaId = String(it.pk ?? it.id ?? '').split('_')[0] ?? '';
      if (!mediaId) continue;
      out.push({
        id: mediaId,
        platform: 'instagram',
        type: 'post',
        text: it.caption?.text ?? '',
        createdAt: it.taken_at ? new Date(it.taken_at * 1000).toISOString() : new Date(0).toISOString(),
        url: it.code ? `https://www.instagram.com/p/${it.code}/` : 'https://www.instagram.com/',
        metrics: { likes: it.like_count ?? 0 },
        media: true,
        meta: { mediaId, code: it.code },
      });
      if (out.length >= limit) break;
    }
    onProgress(out.length);
    if (out.length >= limit || !json.more_available || !json.next_max_id) break;
    maxId = json.next_max_id;
    await sleep(1000 + Math.round(Math.random() * 500));
  }
  return out;
}

function parseVisibleYourActivityDom(type: 'comment' | 'like' | 'post'): ContentItem[] {
  const out: ContentItem[] = [];
  const seen = new Set<string>();

  if (type === 'like' || type === 'post') {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/p/"], a[href*="/reel/"]'));
    for (const a of links) {
      const href = a.getAttribute('href') ?? '';
      const m = href.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
      const code = m?.[1];
      if (!code || seen.has(code)) continue;
      seen.add(code);
      const mediaId = shortcodeToMediaId(code);
      const imgAlt = a.querySelector<HTMLImageElement>('img')?.alt ?? '';
      out.push({
        id: mediaId || code,
        platform: 'instagram',
        type,
        text: imgAlt || `Instagram ${type} (${code})`,
        createdAt: new Date(0).toISOString(),
        url: `https://www.instagram.com${href}`,
        media: true,
        meta: { mediaId: mediaId || undefined, code },
      });
    }
    return out;
  }

  // Comments on /your_activity/interactions/comments
  const blocks = Array.from(
    document.querySelectorAll<HTMLElement>('[data-bloks-name="bk.components.Flexbox"], article, li'),
  );
  let idx = 0;
  for (const el of blocks) {
    // Only leaf-like comment rows with a reasonable text length and no huge nested list
    if (el.querySelectorAll('[data-bloks-name="bk.components.Flexbox"]').length > 6) continue;
    const rawText = (el.innerText ?? '').trim();
    if (!rawText || rawText.length < 2 || rawText.length > 1500) continue;
    if (/^(select|seç|sort & filter|sırala ve filtrele|comments|yorumlar|no comments)/i.test(rawText)) {
      continue;
    }
    const key = rawText.slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    idx++;

    const link = el.querySelector<HTMLAnchorElement>('a[href*="/p/"], a[href*="/reel/"]');
    const code = link?.getAttribute('href')?.match(/\/(?:p|reel)\/([A-Za-z0-9_-]+)/)?.[1] ?? '';
    const mediaId = code ? shortcodeToMediaId(code) : '';

    out.push({
      id: `dom_ig_comment_${idx}_${Math.abs(hashText(key))}`,
      platform: 'instagram',
      type: 'comment',
      text: rawText,
      createdAt: new Date(0).toISOString(),
      url: code ? `https://www.instagram.com/p/${code}/` : location.href,
      meta: { mediaId: mediaId || undefined, code: code || undefined, domFallback: true },
    });
  }

  return out;
}

function hashText(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

async function scanInstagramDirectChat(
  maxItems: number,
  getCaptured: () => CapturedIgItem[],
  signal: AbortSignal,
  onProgress: (count: number) => void,
): Promise<ContentItem[]> {
  const limit = maxItems > 0 ? maxItems : Number.POSITIVE_INFINITY;
  const threadId = typeof location !== 'undefined' ? location.pathname.match(/\/direct\/t\/(\d+)/)?.[1] ?? '' : '';

  // Wait briefly for message thread UI to finish rendering
  for (let i = 0; i < 20 && !signal.aborted; i++) {
    if (getCaptured().some((c) => c.type === 'message') || document.querySelector('[role="row"], [role="gridcell"]')) {
      break;
    }
    await sleep(400);
  }

  const collected = new Map<string, ContentItem>();
  let idleRounds = 0;
  let lastTop = -1;

  for (let round = 0; round < 300 && !signal.aborted; round++) {
    const before = collected.size;
    const fromCaptured = capturedToContentItems(
      getCaptured()
        .filter((c) => c.type === 'message')
        .map((c) => ({ ...c, threadId: c.threadId || threadId || undefined })),
    );
    const source = fromCaptured.length > 0 ? fromCaptured : parseVisibleDirectDom(threadId);

    for (const item of source) {
      if (collected.has(item.id)) continue;
      collected.set(item.id, item);
      if (collected.size >= limit) break;
    }
    onProgress(collected.size);
    if (collected.size >= limit) break;

    const container = findDirectChatScrollContainer();
    const curTop = container ? container.scrollTop : 0;

    if (collected.size === before && (curTop <= 0 || curTop === lastTop)) {
      idleRounds++;
      if (idleRounds >= 5) break;
    } else {
      idleRounds = 0;
    }
    lastTop = curTop;

    if (container && curTop > 0) {
      container.scrollTop = Math.max(0, curTop - Math.round(container.clientHeight * 0.8));
    }
    await sleep(1300 + Math.round(Math.random() * 700));
  }

  return [...collected.values()];
}

export async function scanInstagramTimeline(
  type: 'comment' | 'like' | 'post' | 'message',
  maxItems: number,
  getCaptured: () => CapturedIgItem[],
  signal: AbortSignal,
  onProgress: (count: number) => void,
): Promise<ContentItem[]> {
  if (type === 'message') {
    return scanInstagramDirectChat(maxItems, getCaptured, signal, onProgress);
  }

  const limit = maxItems > 0 ? maxItems : Number.POSITIVE_INFINITY;
  const user = getCurrentInstagramUser();

  // For own posts, Instagram's session user feed API returns clean structured items with IDs.
  if (type === 'post' && user.id) {
    const apiPosts = await scanOwnPostsViaApi(user.id, limit, signal, onProgress);
    if (apiPosts.length > 0) return apiPosts;
  }

  // Wait for Your Activity page to finish initial Bloks render
  for (let i = 0; i < 24 && !signal.aborted; i++) {
    if (getCaptured().length > 0 || document.querySelector('[data-bloks-name], a[href*="/p/"]')) break;
    await sleep(500);
  }

  const collected = new Map<string, ContentItem>();
  let idleRounds = 0;
  let lastHeight = 0;

  for (let round = 0; round < 500 && !signal.aborted; round++) {
    const before = collected.size;
    const fromCaptured = capturedToContentItems(getCaptured().filter((c) => c.type === type));
    const source = fromCaptured.length > 0 ? fromCaptured : parseVisibleYourActivityDom(type);

    for (const item of source) {
      if (collected.has(item.id)) continue;
      collected.set(item.id, item);
      if (collected.size >= limit) break;
    }
    onProgress(collected.size);
    if (collected.size >= limit) break;

    const height = document.documentElement.scrollHeight;
    if (collected.size === before && height === lastHeight) {
      idleRounds++;
      if (idleRounds >= 5) break;
    } else {
      idleRounds = 0;
    }
    lastHeight = height;

    window.scrollTo({ top: height, behavior: 'smooth' });
    await sleep(1600 + Math.round(Math.random() * 900));
  }

  return [...collected.values()];
}
