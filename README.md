# NukeAll

[Türkçe](README.tr.md) · [Website](https://nukeall.pages.dev/) · [Install Guide](https://nukeall.pages.dev/install/) · [Privacy](PRIVACY.md) · [Sponsor](https://nukeall.pages.dev/sponsor/)

**Free, open-source (`GPL-3.0-or-later`), 100% local social media history cleaner.**

NukeAll bulk-deletes **your own** old posts, replies, comments, likes, reposts, bookmarks and sent Direct messages directly inside your browser — with **zero servers, zero passwords, zero tracking, and no paywalls**.

## Supported Platforms & Features

- **Completely free & unlimited:** No 30-day limits, no daily paywalls, no credits.
- **X (Twitter):** Clean old tweets, replies, likes, reposts and bookmarks automatically, or upload your official X data download to clear history from years ago.
- **Instagram:** Remove old comments, likes and posts automatically, unsend only **your own** messages in Direct chats, or import your official Instagram data export cleanly.
- **Reddit:** Overwrite comments and text posts **0–3 times** with random or custom text before deleting so old words don't linger, plus import your official Reddit data download for deep history.
- **LinkedIn:** Pick exact calendar dates (or one click for `> 30d`, `> 6m`, `> 1y`) to delete old posts, comments and likes safely before a career move, or import your LinkedIn archive.
- **Offline profanity filter:** Automatically flag posts containing profanity (English + Turkish word lists) or custom keywords inside your browser before deleting.
- **Review screen & protections:** Search and check/uncheck items before anything is touched; protect pinned or popular posts and keep tags.
- **Personal backups & summaries:** Optionally save a readable personal copy (including a single-file offline web page you can search anytime) and view a summary of what was cleaned.
- **Account-safe pacing:** Randomized delays, automatic cooldowns when a platform asks to slow down, daily safety caps and automatic resume if interrupted.
- **Bilingual interface:** Full English and Turkish support with dark and light themes.

## Download & Install

NukeAll currently ships directly via **[GitHub Releases](https://github.com/nukeall-app/nukeall/releases/latest)** (both Chrome and Firefox packages are included under **Assets** with `SHA256SUMS.txt` checksums):

- **Chrome / Edge / Brave:** Download `nukeall-chrome.zip`, unzip it, open `chrome://extensions`, enable **Developer mode**, and click **Load unpacked**.
- **Firefox:** Firefox Add-ons store listing is not live yet. Download `nukeall-firefox.zip`, open `about:debugging#/runtime/this-firefox`, and click **Load Temporary Add-on…**.
- Step-by-step instructions: **[nukeall.pages.dev/install/](https://nukeall.pages.dev/install/)**

## Privacy Guarantee

- Never asks for your password, 2FA code, or API keys — works directly inside your existing signed-in browser tab.
- Network access is strictly locked by browser permissions and Content Security Policy to your chosen social platforms (`x.com`, `twitter.com`, `instagram.com`, `reddit.com`, `linkedin.com`).
- Zero telemetry, zero analytics, zero external servers in the extension — automatically verified on every build via `npm run check:network`.
- Open-source `GPL-3.0-or-later` dependencies are audited in CI via `npm run check:licenses`.

## Development

```bash
npm install
npm run check:licenses
npm test
npm run typecheck
npm run build
npm run lint:firefox -w apps/extension
npm run check:network
npm run check:seo
npm run package:release
```

## Governance & Legal

- Contributors accept [CLA.md](CLA.md) ([`cla-signatures.json`](cla-signatures.json)).
- Brand names and marks are governed by [TRADEMARK.md](TRADEMARK.md).

## Disclaimer

Platforms discourage rapid automation in their Terms of Service. Keep the default **Safe** speed and daily safety limit enabled. Use at your own risk. Not affiliated with X Corp, Meta, Reddit or LinkedIn.

## License

[GPL-3.0-or-later](LICENSE)
