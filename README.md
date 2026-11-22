# NukeAll

[Türkçe](README.tr.md) · [Website](https://nukeall.app) · [Privacy](PRIVACY.md) · [Sponsor](https://nukeall.app/sponsor/)

**Free, open-source (`GPL-3.0-or-later`), 100% local social media history cleaner.**

NukeAll bulk-deletes **your own** posts, replies, comments, likes, reposts and bookmarks directly inside your browser — with zero servers, zero accounts, zero telemetry, and no paywalled limits.

## Features (X, Instagram, Reddit & LinkedIn Live)

- **Unlimited & free:** No 30-day cap, no daily paywall, no credits.
- **X (Twitter):** Auto-navigates to Replies, Likes, Bookmarks or Profile; passive GraphQL reader + runtime queryId discovery + DOM fallback + `tweets.js`/`like.js` archive import.
- **Instagram:** Auto-navigates to Your Activity (Comments, Likes, Posts) plus Direct Chat (unsend your own sent DM messages); session API + passive Bloks/GraphQL reader + shortcode-to-mediaId decoding + DOM fallback + JSON archive import (with Turkish UTF-8 mojibake fix).
- **Reddit:** Auto-navigates to your comments/submitted history; **multi-pass overwrite (0–3 passes)** with random or custom text (plus edit-only mode) before deleting + `comments.csv`/`posts.csv` archive import.
- **LinkedIn:** Auto-navigates to `/in/<handle>/recent-activity/{all,comments,reactions}/`; decodes exact creation dates from 64-bit Snowflake URNs (`BigInt >> 22n`) + relative EN/TR timestamps + `Shares.csv`/`Comments.csv`/`Reactions.csv` archive import + safe human-paced DOM click automation.
- **Single-type scan picker:** Select one content type per scan for maximum stability.
- **Date Picker & Review grid:** Pick `From` / `To` calendar dates or one-click age chips (`> 30d`, `> 6m`, `> 1y`, `Clear`) right in Review Grid; filter by keywords, regex, media, or risk flags; protect pinned or high-engagement posts and `#keep` tags.
- **Offline local risk scan:** Flags EN + TR profanity, emails, phone numbers, IBANs, validated Turkish ID numbers (TCKN), Luhn-checked card numbers, and late-night posts (01:00–05:00) — zero AI downloads.
- **Manual backups & reports:** Optional one-click JSON/CSV backup, single-file searchable offline HTML archive, 10-second cancel countdown, crash-resilient checkpoints, and downloadable HTML/JSON deletion reports.
- **Bilingual UI:** English & Turkish (`EN` / `TR`), dark & light themes.

## Privacy Guarantee

- Extension CSP enforces `connect-src 'self'`.
- Network permissions are strictly limited to supported social platforms (`x.com`, `twitter.com`, `instagram.com`, `reddit.com`, `linkedin.com`).
- `npm run check:network` runs in CI to fail builds if any unknown external URL appears in compiled extension bundles.
- `npm run check:licenses` audits dependencies in CI for `GPL-3.0-or-later` compatibility.

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
```

Load unpacked in Chromium from `apps/extension/.output/chrome-mv3`, or temporary add-on in Firefox (`about:debugging`) from `apps/extension/.output/firefox-mv3/manifest.json`.

## Governance & Legal

- Contributors accept [CLA.md](CLA.md) so the project remains relicensable and transferable to long-term privacy-aligned stewardship ([`cla-signatures.json`](cla-signatures.json)).
- Brand names, icons and `nukeall.app` are governed separately under [TRADEMARK.md](TRADEMARK.md).

## Disclaimer

Platforms discourage fast automation in their Terms of Service. Keep the default **Safe** speed and daily safety limit enabled. Use at your own risk. Not affiliated with X Corp, Meta, Reddit or LinkedIn.

## License

[GPL-3.0-or-later](LICENSE)
