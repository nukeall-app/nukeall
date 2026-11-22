# NukeAll Website (`nukeall.app`)

Static Astro website (EN + TR) deployed to Cloudflare Pages.

## Local Development

From the repo root:

```bash
npm install
npm run dev:web
```

Build and SEO verification:

```bash
npm run build -w apps/website
npm run check:seo
```

## Cloudflare Pages Settings

- **Root directory:** `apps/website` (or keep root and run `npm run build -w apps/website` with output `apps/website/dist`)
  - Note: because this is an npm workspace monorepo, if Cloudflare Pages fails to resolve workspace deps when `Root directory` is `apps/website`, set **Root directory** to `/` (repo root), **Build command** to `npm run build -w apps/website`, and **Build output directory** to `apps/website/dist`.
- **Node version:** `NODE_VERSION=20` (or `22` / `24`)
- **Cloudflare Web Analytics (optional):** Either enable it directly in the Cloudflare Pages dashboard, or set environment variable `PUBLIC_CF_BEACON_TOKEN` to your Web Analytics token.

## Before Launch

Update placeholders in `src/config.ts`:
- `GITHUB_USER`
- `KOFI_USER`
- Set `AMO_LIVE = true` once the Firefox Add-ons page is published.
