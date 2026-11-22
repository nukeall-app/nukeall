# Privacy Policy — NukeAll

## Browser Extension

- **No servers:** NukeAll operates no backend, sync service, or database server.
- **No telemetry:** Zero analytics, zero crash reporting, zero remote code loading.
- **Local storage only:** Settings, filters, protection lists, checkpoints, and the offline archive cache are stored exclusively in `browser.storage.local` and `IndexedDB` inside your browser.
- **Platform traffic only:** Network requests are sent solely to the platform you actively choose to clean (`x.com`, `twitter.com`, `instagram.com`, `reddit.com`) using your existing logged-in browser session.
- **Enforced by CSP & CI:** Extension pages enforce `connect-src 'self'`, and CI executes `npm run check:network` on compiled output to block unknown origins.

## Website (`nukeall.app`)

- Static site hosted on Cloudflare Pages with self-hosted fonts and zero third-party ad/social embeds.
- Uses cookieless Cloudflare Web Analytics for aggregate traffic counts.
- Language banner dismissal preference is saved only in browser `localStorage`.
