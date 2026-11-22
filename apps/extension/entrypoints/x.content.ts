import { defineContentScript } from 'wxt/utils/define-content-script';
import { deleteXItem, getCurrentXUser, scanXTimeline } from '../src/adapters/x/api';
import type { RawXTweet, XTimelineKind } from '../src/adapters/x/graphql';
import type { ExtensionMessage, MessageResponse } from '../src/core/messages';

const KINDS: XTimelineKind[] = ['tweets', 'likes', 'bookmarks'];

export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  // Start early so no timeline response from the page is missed.
  runAt: 'document_start',
  main() {
    const buffer: Record<XTimelineKind, Map<string, RawXTweet>> = {
      tweets: new Map(),
      likes: new Map(),
      bookmarks: new Map(),
    };
    let scanAbort: AbortController | null = null;

    // Receive parsed timeline data from the MAIN-world interceptor (same tab & origin only).
    window.addEventListener('message', (e: MessageEvent) => {
      if (e.source !== window || e.origin !== location.origin) return;
      const data = e.data as { __nukeall?: string; kind?: XTimelineKind; tweets?: RawXTweet[] } | null;
      if (!data || data.__nukeall !== 'x-timeline' || !data.kind || !KINDS.includes(data.kind)) return;
      if (!Array.isArray(data.tweets)) return;
      for (const t of data.tweets) {
        if (t && typeof t.id === 'string' && /^\d+$/.test(t.id)) buffer[data.kind].set(t.id, t);
      }
    });

    browser.runtime.onMessage.addListener((rawMsg, _sender, sendResponse) => {
      const msg = rawMsg as ExtensionMessage;

      if (msg.type === 'PING') {
        sendResponse({ ok: true } satisfies MessageResponse);
        return false;
      }

      if (msg.type === 'GET_CURRENT_USER') {
        sendResponse({ ok: true, user: getCurrentXUser() } satisfies MessageResponse);
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
        const kind = msg.kind ?? 'tweets';
        scanXTimeline(
          {
            kind,
            types: msg.contentTypes,
            maxItems: msg.maxItems,
            expectedHandle: msg.expectedHandle,
          },
          () => [...buffer[kind].values()],
          ac.signal,
          (count) => {
            browser.runtime.sendMessage({ type: 'SCAN_PROGRESS', stage: 'scanning', kind, count }).catch(() => {});
          },
        )
          .then((items) => sendResponse({ ok: true, items } satisfies MessageResponse))
          .catch((err) =>
            sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) } satisfies MessageResponse),
          );
        return true;
      }

      if (msg.type === 'DELETE_SINGLE_ITEM') {
        deleteXItem(msg.item)
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
