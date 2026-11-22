import { defineContentScript } from 'wxt/utils/define-content-script';
import { deleteRedditItem, getCurrentRedditUser, scanRedditTimeline } from '../src/adapters/reddit/api';
import type { ExtensionMessage, MessageResponse } from '../src/core/messages';

export default defineContentScript({
  matches: ['*://reddit.com/*', '*://*.reddit.com/*'],
  runAt: 'document_idle',
  main() {
    let scanAbort: AbortController | null = null;

    browser.runtime.onMessage.addListener((rawMsg, _sender, sendResponse) => {
      const msg = rawMsg as ExtensionMessage;

      if (msg.type === 'PING') {
        sendResponse({ ok: true } satisfies MessageResponse);
        return false;
      }

      if (msg.type === 'GET_CURRENT_USER') {
        getCurrentRedditUser(true)
          .then((user) => sendResponse({ ok: true, user: { id: user.id, handle: user.handle } } satisfies MessageResponse))
          .catch((err) =>
            sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) } satisfies MessageResponse),
          );
        return true;
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
        const targetType = msg.contentTypes.includes('post') && !msg.contentTypes.includes('comment')
          ? 'post'
          : 'comment';

        (async () => {
          const user = await getCurrentRedditUser();
          const username = msg.expectedHandle || user.handle;
          const items = await scanRedditTimeline(
            targetType,
            username,
            msg.maxItems,
            ac.signal,
            (count) => {
              browser.runtime
                .sendMessage({ type: 'SCAN_PROGRESS', stage: 'scanning', kind: targetType, count })
                .catch(() => {});
            },
          );
          sendResponse({ ok: true, items } satisfies MessageResponse);
        })().catch((err) =>
          sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) } satisfies MessageResponse),
        );
        return true;
      }

      if (msg.type === 'DELETE_SINGLE_ITEM') {
        deleteRedditItem(msg.item, msg.options)
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
