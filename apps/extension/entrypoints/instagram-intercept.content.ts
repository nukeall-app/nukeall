import { defineContentScript } from 'wxt/utils/define-content-script';
import { extractCapturedIgItems } from '../src/adapters/instagram/parser';

// Passively reads Instagram's own Your Activity / Direct / GraphQL / Bloks responses in the active tab.
// Zero external requests; passes parsed items to NukeAll's isolated content script via postMessage.
export default defineContentScript({
  matches: ['*://instagram.com/*', '*://*.instagram.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    const inferHint = (): 'comment' | 'like' | 'post' | 'message' => {
      const p = location.pathname;
      if (p.startsWith('/direct')) return 'message';
      if (p.includes('/comments')) return 'comment';
      if (p.includes('/likes')) return 'like';
      return 'post';
    };

    const getOwnerUserId = (): string => {
      const m = document.cookie.match(/(?:^|;\s*)ds_user_id=([^;]*)/);
      return m?.[1] ? decodeURIComponent(m[1]) : '';
    };

    const isRelevantUrl = (url: string): boolean =>
      /\/api\/v1\/(?:bloks|web|feed|media|direct_v2)|\/graphql\/query/i.test(url);

    const publish = (payload: unknown) => {
      try {
        const items = extractCapturedIgItems(payload, inferHint(), getOwnerUserId());
        if (items.length > 0) {
          window.postMessage({ __nukeall: 'ig-data', items }, location.origin);
        }
      } catch {
        // ignore
      }
    };

    const origFetch = window.fetch;
    window.fetch = async function (this: unknown, ...args: Parameters<typeof fetch>) {
      const res = await origFetch.apply(this as typeof window, args);
      try {
        const input = args[0];
        const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
        if (isRelevantUrl(url)) {
          res
            .clone()
            .json()
            .then(publish)
            .catch(() => {});
        }
      } catch {
        // ignore
      }
      return res;
    } as typeof fetch;

    const proto = XMLHttpRequest.prototype as XMLHttpRequest & { __nukeallIgUrl?: string };
    const origOpen = proto.open;
    const origSend = proto.send;
    proto.open = function (this: XMLHttpRequest & { __nukeallIgUrl?: string }, ...args: any[]) {
      this.__nukeallIgUrl = String(args[1] ?? '');
      return (origOpen as any).apply(this, args);
    } as typeof proto.open;
    proto.send = function (this: XMLHttpRequest & { __nukeallIgUrl?: string }, ...args: any[]) {
      if (isRelevantUrl(this.__nukeallIgUrl ?? '')) {
        this.addEventListener('load', () => {
          try {
            const json =
              this.responseType === 'json'
                ? this.response
                : this.responseType === '' || this.responseType === 'text'
                  ? JSON.parse(this.responseText)
                  : null;
            if (json) publish(json);
          } catch {
            // ignore
          }
        });
      }
      return (origSend as any).apply(this, args);
    } as typeof proto.send;
  },
});
