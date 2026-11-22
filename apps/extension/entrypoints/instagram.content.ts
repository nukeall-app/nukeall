import { defineContentScript } from 'wxt/utils/define-content-script';
import {
  deleteInstagramItem,
  getCurrentInstagramUser,
  scanInstagramTimeline,
} from '../src/adapters/instagram/api';
import type { CapturedIgItem } from '../src/adapters/instagram/parser';
import type { ExtensionMessage, MessageResponse } from '../src/core/messages';

export default defineContentScript({
  matches: ['*://instagram.com/*', '*://*.instagram.com/*'],
  runAt: 'document_start',
  main() {
    const buffer = new Map<string, CapturedIgItem>();
    let scanAbort: AbortController | null = null;

    const ALLOWED_IG_TYPES = new Set<CapturedIgItem['type']>(['comment', 'like', 'post', 'message']);
    const DIGITS_RE = /^\d+$/;
    const SHORTCODE_RE = /^[A-Za-z0-9_-]{1,32}$/;

    window.addEventListener('message', (e: MessageEvent) => {
      if (e.source !== window || e.origin !== location.origin) return;
      const data = e.data as { __nukeall?: string; items?: CapturedIgItem[] } | null;
      if (!data || data.__nukeall !== 'ig-data' || !Array.isArray(data.items)) return;
      for (const it of data.items) {
        if (!it || typeof it !== 'object') continue;
        if (typeof it.id !== 'string' || !it.id || it.id.length > 128) continue;
        if (!ALLOWED_IG_TYPES.has(it.type)) continue;
        const sanitized: CapturedIgItem = {
          id: it.id,
          type: it.type,
          text: typeof it.text === 'string' ? it.text.slice(0, 10_000) : '',
          createdAt: typeof it.createdAt === 'string' ? it.createdAt : new Date(0).toISOString(),
          mediaId: typeof it.mediaId === 'string' && DIGITS_RE.test(it.mediaId) ? it.mediaId : undefined,
          threadId: typeof it.threadId === 'string' && DIGITS_RE.test(it.threadId) ? it.threadId : undefined,
          itemId: typeof it.itemId === 'string' && DIGITS_RE.test(it.itemId) ? it.itemId : undefined,
          code: typeof it.code === 'string' && SHORTCODE_RE.test(it.code) ? it.code : undefined,
          likes: typeof it.likes === 'number' && Number.isFinite(it.likes) ? it.likes : undefined,
        };
        buffer.set(`${sanitized.type}:${sanitized.id}`, sanitized);
      }
    });

    browser.runtime.onMessage.addListener((rawMsg, _sender, sendResponse) => {
      const msg = rawMsg as ExtensionMessage;

      if (msg.type === 'PING') {
        sendResponse({ ok: true } satisfies MessageResponse);
        return false;
      }

      if (msg.type === 'GET_CURRENT_USER') {
        sendResponse({ ok: true, user: getCurrentInstagramUser() } satisfies MessageResponse);
        return false;
      }

      if (msg.type === 'STOP_SCAN') {
        scanAbort?.abort();
        sendResponse({ ok: true } satisfies MessageResponse);
        return false;
      }

      if (msg.type === 'SCAN_TIMELINE') {
        scanAbort?.abort();
        const ac = new AbortController();
        scanAbort = ac;
        const targetType: 'comment' | 'like' | 'post' | 'message' = msg.contentTypes.includes('message')
          ? 'message'
          : msg.contentTypes.includes('like')
            ? 'like'
            : msg.contentTypes.includes('post')
              ? 'post'
              : 'comment';

        scanInstagramTimeline(
          targetType,
          msg.maxItems,
          () => [...buffer.values()],
          ac.signal,
          (count) => {
            browser.runtime
              .sendMessage({ type: 'SCAN_PROGRESS', stage: 'scanning', kind: targetType, count })
              .catch(() => {});
          },
        )
          .then((items) => sendResponse({ ok: true, items } satisfies MessageResponse))
          .catch((err) =>
            sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) } satisfies MessageResponse),
          );
        return true;
      }

      if (msg.type === 'DELETE_SINGLE_ITEM') {
        deleteInstagramItem(msg.item)
          .then((result) => sendResponse({ ok: true, result } satisfies MessageResponse))
          .catch((err) =>
            sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) } satisfies MessageResponse),
          );
        return true;
      }

      return false;
    });
  },
});
