# Contributing to NukeAll

Thanks for helping keep NukeAll free, open source, and private!

## Principles

1. **Own content only:** Never add features that act on other users' accounts or content (mass reporting, scraping others, engagement farming).
2. **100% local:** Never add analytics, third-party APIs, remote script loading, or CDNs. Every build must pass `npm run check:network`.
3. **Safety by default:** Keep safe speed defaults, dry-run/review steps, and local backups intact.

## Workflow

1. Fork the repository and create a branch from `main`.
2. Run `npm install` at the root.
3. Make your changes and add tests in `apps/extension/tests/`.
4. Verify locally before opening a PR:
   - `npm test`
   - `npm run typecheck`
   - `npm run build`
   - `npm run lint:firefox -w apps/extension`
   - `npm run check:network`
   - `npm run check:seo`

## Contributor License Agreement (CLA)

Before any pull request can be merged, all human authors must accept our [Contributor License Agreement](./CLA.md).

1. Open your pull request.
2. Review [CLA.md](./CLA.md).
3. Comment the exact phrase on the PR:

   ```text
   I have read the CLA Document and I hereby sign the CLA
   ```

Your signature is stored in [`cla-signatures.json`](./cla-signatures.json) once across all future contributions. This keeps the codebase cleanly relicensable and transferable to long-term privacy-aligned stewardship.

## Trademark & Dependency License Policy

- **Branding:** See [TRADEMARK.md](./TRADEMARK.md) for guidelines on using the **NukeAll** name, icons, and `nukeall.app` branding.
- **Dependencies:** All dependencies must remain compatible with `GPL-3.0-or-later`. Run the full verification suite locally before opening a PR:

  ```bash
  npm run check:licenses
  npm run typecheck
  npm test
  npm run build
  npm run check:network
  npm run check:seo
  ```
