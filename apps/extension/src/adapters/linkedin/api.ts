import type { ContentItem, DeleteResult } from '../../core/types';
import type { PlatformUser } from '../types';
import {
  detectLinkedInHandleFromPath,
  extractLinkedInUrn,
  linkedinUrnToIso,
  parseLinkedInRelativeDate,
  sanitizeLinkedInUrl,
  type LinkedInContentKind,
} from './parser';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function detectLinkedInHandleFromDom(doc: Document = document, pathname?: string): string {
  const path = pathname ?? (typeof location !== 'undefined' ? location.pathname : '');
  const fromPath = detectLinkedInHandleFromPath(path);
  if (fromPath) return fromPath;

  const selectors = [
    '.feed-identity-module a[href*="/in/"]',
    '.scaffold-layout__sidebar a[href*="/in/"]',
    'a.global-nav__primary-link[href*="/in/"]',
    'header a[href*="/in/"]',
    'nav a[href*="/in/"]',
  ];

  for (const sel of selectors) {
    const links = Array.from(doc.querySelectorAll<HTMLAnchorElement>(sel));
    for (const a of links) {
      const href = a.getAttribute('href') ?? '';
      try {
        const u = new URL(href, 'https://www.linkedin.com');
        const candidate = detectLinkedInHandleFromPath(u.pathname);
        if (candidate) return candidate;
      } catch {
        const candidate = detectLinkedInHandleFromPath(href);
        if (candidate) return candidate;
      }
    }
  }

  // Fallback: LinkedIn embeds hydrated member store JSON inside <code> tags with publicIdentifier
  const codeBlocks = Array.from(doc.querySelectorAll('code'));
  for (const codeEl of codeBlocks) {
    const raw = codeEl.textContent ?? '';
    if (!raw.includes('publicIdentifier')) continue;
    const m = raw.match(/"publicIdentifier"\s*:\s*"([^"]+)"/);
    if (m?.[1] && !/^me$/i.test(m[1])) {
      return m[1].trim();
    }
  }

  return '';
}

export async function getCurrentLinkedInUser(): Promise<PlatformUser> {
  if (typeof location !== 'undefined' && location.pathname.includes('/checkpoint/')) {
    throw new Error('LinkedIn security checkpoint active. Complete verification in linkedin.com first.');
  }
  const handle = typeof document !== 'undefined' ? detectLinkedInHandleFromDom(document) : '';
  return { id: '', handle };
}

function findCardUrn(card: Element): string {
  const ownAttr = card.getAttribute('data-urn') || card.getAttribute('data-id') || '';
  const direct = extractLinkedInUrn(ownAttr);
  if (direct) return direct.urn;

  const nestedEl = card.querySelector('[data-urn*="urn:li:"], [data-id*="urn:li:"]');
  if (nestedEl) {
    const nestedAttr = nestedEl.getAttribute('data-urn') || nestedEl.getAttribute('data-id') || '';
    const nested = extractLinkedInUrn(nestedAttr);
    if (nested) return nested.urn;
  }

  const links = Array.from(card.querySelectorAll<HTMLAnchorElement>('a[href]'));
  for (const a of links) {
    const fromHref = extractLinkedInUrn(a.getAttribute('href') ?? '');
    if (fromHref) return fromHref.urn;
  }

  return '';
}

function extractTextFromSelectors(root: Element, selectors: string[]): string {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    const text = (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  return '';
}

/**
 * Pure DOM extractor for LinkedIn Recent Activity cards (works on both live pages and Linkedom tests).
 */
export function parseVisibleLinkedInDom(doc: Document, kind: LinkedInContentKind): ContentItem[] {
  const candidates = Array.from(
    doc.querySelectorAll<HTMLElement>(
      [
        '[data-urn^="urn:li:activity:"]',
        '[data-urn^="urn:li:ugcPost:"]',
        '[data-urn^="urn:li:share:"]',
        '[data-id^="urn:li:activity:"]',
        '.feed-shared-update-v2',
        'li.profile-creator-shared-feed-update__mini-container',
      ].join(', '),
    ),
  );

  // Skip nested wrapper elements that fall inside an already-selected outer card
  const outerCards = candidates.filter(
    (el) => !el.parentElement?.closest('[data-urn^="urn:li:"], .feed-shared-update-v2'),
  );

  const collected = new Map<string, ContentItem>();

  for (const card of outerCards) {
    const urn = findCardUrn(card);
    if (!urn) continue;

    const headerText = extractTextFromSelectors(card, [
      '.update-components-header__text-view',
      '.feed-shared-header__text-view',
    ]);
    const isRepost = /\b(reposted|yeniden paylaştı|paylaştı)\b/i.test(headerText);

    const postBody = extractTextFromSelectors(card, [
      '.update-components-text .break-words',
      '.update-components-text',
      '.feed-shared-update-v2__description',
      '.feed-shared-inline-show-more-text',
      '.feed-shared-text',
    ]);

    const commentBody =
      kind === 'comment'
        ? extractTextFromSelectors(card, [
            '.comments-comment-item__main-content',
            '.comments-comment-entity__content',
            '.comments-comment-item-content-body',
          ])
        : '';

    const timeEl = card.querySelector<HTMLTimeElement>('time[datetime]');
    const timeAttr = timeEl?.getAttribute('datetime')?.trim() ?? '';
    const subDesc = extractTextFromSelectors(card, [
      '.update-components-actor__sub-description',
      '.feed-shared-actor__sub-description',
      'time',
    ]);

    const createdAt =
      (timeAttr && !Number.isNaN(Date.parse(timeAttr)) ? new Date(timeAttr).toISOString() : null) ??
      linkedinUrnToIso(urn) ??
      parseLinkedInRelativeDate(subDesc) ??
      new Date(0).toISOString();

    const commentUrnEl = card.querySelector('[data-id^="urn:li:comment:"], [data-urn^="urn:li:comment:"]');
    const commentUrn =
      commentUrnEl?.getAttribute('data-id') || commentUrnEl?.getAttribute('data-urn') || undefined;

    const text =
      kind === 'comment'
        ? commentBody || postBody || '[LinkedIn comment]'
        : kind === 'like'
          ? postBody || headerText || '[LinkedIn reaction]'
          : postBody || (isRepost ? `[Repost] ${headerText}`.trim() : '[LinkedIn post]');

    const hasMedia = Boolean(
      card.querySelector(
        'img.update-components-image__image, video, .update-components-document, .feed-shared-article, .update-components-linkedin-video',
      ),
    );

    const itemId = kind === 'comment' && commentUrn ? commentUrn : urn;
    if (collected.has(itemId)) continue;

    collected.set(itemId, {
      id: itemId,
      platform: 'linkedin',
      type: kind,
      text,
      createdAt,
      url: sanitizeLinkedInUrl(urn),
      media: hasMedia,
      metrics: {},
      meta: {
        urn,
        commentUrn,
        isRepost,
      },
    });
  }

  return [...collected.values()];
}

export async function scanLinkedInTimeline(
  type: LinkedInContentKind,
  maxItems: number,
  signal: AbortSignal,
  onProgress: (count: number) => void,
): Promise<ContentItem[]> {
  if (typeof location !== 'undefined' && location.pathname.includes('/checkpoint/')) {
    throw new Error('LinkedIn security checkpoint active. Complete verification in linkedin.com first.');
  }

  const limit = maxItems > 0 ? maxItems : Number.POSITIVE_INFINITY;

  // Wait up to 10s for initial activity stream render
  for (let i = 0; i < 20 && !signal.aborted; i++) {
    if (
      document.querySelector('[data-urn^="urn:li:"], .feed-shared-update-v2') ||
      /nothing to see for now|no activity|henüz aktivite yok/i.test(document.body.textContent ?? '')
    ) {
      break;
    }
    await sleep(500);
  }

  const collected = new Map<string, ContentItem>();
  let idleRounds = 0;
  let lastHeight = 0;

  for (let round = 0; round < 400 && !signal.aborted; round++) {
    const before = collected.size;
    const visible = parseVisibleLinkedInDom(document, type);

    for (const item of visible) {
      if (collected.has(item.id)) continue;
      collected.set(item.id, item);
      if (collected.size >= limit) break;
    }

    onProgress(collected.size);
    if (collected.size >= limit) break;

    // Click "Show more results" button if present in recent-activity infinite scroll
    const loadMoreBtn = document.querySelector<HTMLButtonElement>(
      'button.scaffold-finite-scroll__load-button, button[aria-label*="Show more" i]',
    );
    if (loadMoreBtn && !loadMoreBtn.disabled) {
      loadMoreBtn.click();
    }

    const height = document.documentElement.scrollHeight;
    if (collected.size === before && height === lastHeight) {
      idleRounds++;
      if (idleRounds >= 5) break;
    } else {
      idleRounds = 0;
    }
    lastHeight = height;

    window.scrollTo({ top: height, behavior: 'smooth' });
    await sleep(1400 + Math.round(Math.random() * 800));
  }

  return [...collected.values()];
}

function escapeAttrValue(val: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(val);
  }
  return val.replace(/["\\]/g, '\\$&');
}

function findCardElementForItem(item: ContentItem): HTMLElement | null {
  const urn = (typeof item.meta?.urn === 'string' && item.meta.urn) || extractLinkedInUrn(item.id)?.urn || '';
  if (urn) {
    const esc = escapeAttrValue(urn);
    const byAttr = document.querySelector<HTMLElement>(
      `[data-urn="${esc}"], [data-id="${esc}"]`,
    );
    if (byAttr) return byAttr;

    const byPartialAttr = document.querySelector<HTMLElement>(
      `[data-urn*="${esc}"], [data-id*="${esc}"]`,
    );
    if (byPartialAttr) return byPartialAttr;

    const byLink = document.querySelector<HTMLAnchorElement>(`a[href*="${esc}"]`);
    if (byLink) {
      return byLink.closest<HTMLElement>('[data-urn], .feed-shared-update-v2') ?? byLink.parentElement;
    }
  }

  // On /feed/update/urn:li:.../ detail pages there is typically a single primary card
  if (typeof location !== 'undefined' && urn && location.href.includes(urn)) {
    return document.querySelector<HTMLElement>('[data-urn^="urn:li:"], .feed-shared-update-v2, main article');
  }

  return null;
}

const DELETE_MENU_RE =
  /^(?:delete\s+post|delete\s+comment|delete|remove\s+repost|undo\s+repost|gönderiyi\s+sil|yorumu\s+sil|sil|yeniden\s+paylaşımı\s+kaldır)$/i;
const CONFIRM_DELETE_RE = /^(?:delete|remove|sil|kaldır)$/i;

export async function deleteLinkedInItem(item: ContentItem): Promise<DeleteResult> {
  if (typeof location !== 'undefined' && location.pathname.includes('/checkpoint/')) {
    return {
      ok: false,
      retryAfterMs: 120_000,
      error: 'LinkedIn security checkpoint active — pausing automatically.',
    };
  }

  const card = findCardElementForItem(item);
  if (!card) {
    return { ok: false, error: 'NOT_IN_DOM' };
  }

  card.scrollIntoView({ block: 'center', behavior: 'instant' });
  await sleep(250);

  // Direct 1-click toggle for reactions/likes when active
  if (item.type === 'like') {
    const activeLikeBtn = card.querySelector<HTMLButtonElement>(
      'button.react-button__trigger[aria-pressed="true"], button[aria-pressed="true"][aria-label*="Like" i], button[aria-pressed="true"][aria-label*="Beğen" i]',
    );
    if (activeLikeBtn) {
      activeLikeBtn.click();
      await sleep(500);
      return { ok: true };
    }
  }

  // Open the card's or comment's control menu ("...")
  const menuScope =
    item.type === 'comment'
      ? (card.querySelector<HTMLElement>('.comments-comment-item, .comments-comment-entity') ?? card)
      : card;

  const menuTrigger =
    menuScope.querySelector<HTMLButtonElement>(
      [
        'button.feed-shared-control-menu__trigger',
        'button[aria-label*="Open control menu" i]',
        'button[aria-label*="More actions" i]',
        'button[aria-label*="comment options" i]',
        'button.comments-options-trigger',
        'button[aria-label*="Kontrol menüsünü aç" i]',
        'button[aria-label*="Diğer işlemler" i]',
      ].join(', '),
    ) ??
    card.querySelector<HTMLButtonElement>(
      'button.feed-shared-control-menu__trigger, button[aria-label*="Open control menu" i]',
    );

  if (!menuTrigger) {
    return { ok: false, error: 'LinkedIn control menu button not found on activity card.' };
  }

  menuTrigger.click();

  // Wait up to 2s for dropdown menu item to render
  let actionItem: HTMLElement | null = null;
  for (let i = 0; i < 10; i++) {
    await sleep(200);
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.feed-shared-control-menu__content [role="menuitem"], .feed-shared-control-menu__content button, .artdeco-dropdown__content-inner button, .artdeco-dropdown__content-inner [role="menuitem"], .artdeco-dropdown__content-inner li[role="button"]',
      ),
    );
    actionItem =
      candidates.find((el) => {
        const txt = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
        return DELETE_MENU_RE.test(txt) || DELETE_MENU_RE.test(el.getAttribute('aria-label')?.trim() ?? '');
      }) ?? null;
    if (actionItem) break;
  }

  if (!actionItem) {
    // Close open menu gently via Escape so subsequent items aren't obscured
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return {
      ok: false,
      error: 'Delete or remove-repost action was not available in the LinkedIn menu for this item.',
    };
  }

  actionItem.click();

  // Wait briefly for confirmation modal (posts/comments show modal; remove-repost may complete directly)
  let confirmBtn: HTMLElement | null = null;
  for (let i = 0; i < 12; i++) {
    await sleep(200);
    const modal = document.querySelector<HTMLElement>(
      '[role="dialog"], .artdeco-modal[role="dialog"], .artdeco-modal-overlay .artdeco-modal',
    );
    if (!modal) continue;
    confirmBtn =
      Array.from(modal.querySelectorAll<HTMLElement>('button')).find((b) =>
        CONFIRM_DELETE_RE.test((b.textContent ?? '').replace(/\s+/g, ' ').trim()),
      ) ?? null;
    if (confirmBtn) break;
  }

  if (confirmBtn) {
    confirmBtn.click();
    await sleep(700);
  } else {
    await sleep(500);
  }

  return { ok: true };
}
