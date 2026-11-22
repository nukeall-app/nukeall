import { defineContentScript } from 'wxt/utils/define-content-script';
import {
  deleteLinkedInItem,
  getCurrentLinkedInUser,
  scanLinkedInTimeline,
} from '../src/adapters/linkedin/api';
import type { LinkedInContentKind } from '../src/adapters/linkedin/parser';
import type { ExtensionMessage, MessageResponse } from '../src/core/messages';

export default defineContentScript({
  matches: ['*://linkedin.com/*', '*://*.linkedin.com/*'],
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
        getCurrentLinkedInUser()
          .then((user) => sendResponse({ ok: true, user } satisfies MessageResponse))
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

        const targetType: LinkedInContentKind = msg.contentTypes.includes('comment')
          ? 'comment'
          : msg.contentTypes.includes('like')
            ? 'like'
            : 'post';

        scanLinkedInTimeline(targetType, msg.maxItems, ac.signal, (count) => {
          browser.runtime
            .sendMessage({ type: 'SCAN_PROGRESS', stage: 'scanning', kind: targetType, count })
            .catch(() => {});
        })
          .then((items) => sendResponse({ ok: true, items } satisfies MessageResponse))
          .catch((err) =>
            sendResponse({ ok: false, error: err instanceof Error ? err.message : String(err) } satisfies MessageResponse),
          );
        return true;
      }

      if (msg.type === 'DELETE_SINGLE_ITEM') {
        deleteLinkedInItem(msg.item)
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
