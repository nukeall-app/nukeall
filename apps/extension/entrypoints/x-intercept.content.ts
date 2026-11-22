import { defineContentScript } from 'wxt/utils/define-content-script';
import { extractTimelineTweets, OP_KIND, opFromUrl } from '../src/adapters/x/graphql';

// Runs in the page (MAIN world) and passively reads the timeline responses X
// itself downloads. It never sends requests of its own and never leaves the tab:
// parsed tweets are handed to the NukeAll content script via window.postMessage.
export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    const publish = (op: string, json: unknown) => {
      const kind = OP_KIND[op];
      if (!kind) return;
      try {
        const tweets = extractTimelineTweets(json);
        if (tweets.length > 0) {
          window.postMessage({ __nukeall: 'x-timeline', kind, tweets }, location.origin);
        }
      } catch {
        // ignore malformed payloads
      }
    };

    const origFetch = window.fetch;
    window.fetch = async function (this: unknown, ...args: Parameters<typeof fetch>) {
      const res = await origFetch.apply(this as typeof window, args);
      try {
        const input = args[0];
        const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
        const op = opFromUrl(url);
        if (op && OP_KIND[op]) {
          res
            .clone()
            .json()
            .then((j) => publish(op, j))
            .catch(() => {});
        }
      } catch {
        // ignore
      }
      return res;
    } as typeof fetch;

    const proto = XMLHttpRequest.prototype as XMLHttpRequest & { __nukeallUrl?: string };
    const origOpen = proto.open;
    const origSend = proto.send;
    proto.open = function (this: XMLHttpRequest & { __nukeallUrl?: string }, ...args: any[]) {
      this.__nukeallUrl = String(args[1] ?? '');
      return (origOpen as any).apply(this, args);
    } as typeof proto.open;
    proto.send = function (this: XMLHttpRequest & { __nukeallUrl?: string }, ...args: any[]) {
      const op = opFromUrl(this.__nukeallUrl ?? '');
      if (op && OP_KIND[op]) {
        this.addEventListener('load', () => {
          try {
            const json =
              this.responseType === 'json'
                ? this.response
                : this.responseType === '' || this.responseType === 'text'
                  ? JSON.parse(this.responseText)
                  : null;
            if (json) publish(op, json);
          } catch {
            // ignore
          }
        });
      }
      return (origSend as any).apply(this, args);
    } as typeof proto.send;
  },
});
