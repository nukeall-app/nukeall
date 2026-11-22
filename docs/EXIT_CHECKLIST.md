# NukeAll Acquisition & Exit Readiness Checklist

This checklist prepares NukeAll for clean technical and legal due diligence if the project is ever transferred to a privacy-focused steward or acquirer.

---

## 1. Intellectual Property & Licensing Hygiene

- [x] **CLA Enforcement Enabled:** [`CLA.md`](../CLA.md) grants perpetual copyright, patent, and relicensing rights to the Project Maintainer and its `successors and assigns`, enforced by [`.github/workflows/cla.yml`](../.github/workflows/cla.yml) and logged in [`cla-signatures.json`](../cla-signatures.json).
- [x] **Trademark Separation:** [`TRADEMARK.md`](../TRADEMARK.md) distinguishes open-source `GPL-3.0-or-later` code rights from the NukeAll name, icons, and `nukeall.app` domain.
- [x] **Automated Dependency License Audit:** `npm run check:licenses` (`scripts/check-licenses.mjs`) runs in CI and release workflows to block incompatible/proprietary dependencies.
- [ ] **No Unclean Third-Party Assets:** Confirm all icons, screenshots, and copy in `apps/extension` and `apps/website` are original works created for NukeAll.
- [ ] **GitHub Branch Protection:** Enable `Require a pull request before merging` + require `NukeAll CLA` and `CI` status checks on `main`.

---

## 2. Transferable Infrastructure & Accounts

Keep every production account under a dedicated project role email (for example `ops@nukeall.app`) rather than a personal account:

- [ ] **Domain Registrar (`nukeall.app`):** Separate project registrar account with transfer lock documented and DNS managed cleanly in Cloudflare.
- [ ] **GitHub Organization:** Host the canonical repository under a dedicated GitHub Organization rather than a personal username so ownership transfers in one click.
- [ ] **Chrome Web Store Developer Account:** Publish under a dedicated project publisher account (`2FA` recovery codes stored offline).
- [ ] **Firefox Add-ons (AMO) Account:** Publish under a dedicated project account and document add-on transfer procedures.
- [ ] **Cloudflare Pages + Web Analytics:** Keep the `nukeall.app` Pages project and Web Analytics site inside a transferable team account.
- [ ] **Funding Links Ready:** Replace `YOUR_GITHUB` and `YOUR_KOFI` placeholders when live sponsor accounts are connected.

---

## 3. Verifiable Due-Diligence Metrics (Zero Extension Telemetry)

Because NukeAll collects zero runtime telemetry inside the extension, valuation and traction rely on clean external store & organic web records:

- [ ] **Monthly Metric Snapshots:** Run `node scripts/collect-metrics.mjs --repo <org/nukeall> --amo <amo-slug>` monthly to archive snapshots inside the gitignored `metrics-local/` folder.
- [ ] **Store CSV Exports:** Save quarterly Chrome Web Store & Firefox AMO analytics CSVs in `metrics-local/` (installs, active weekly users, uninstall rate, ratings).
- [ ] **Cloudflare Web Analytics History:** Keep cookieless organic SEO traffic exports in `metrics-local/` across the high-intent guide pages.
- [ ] **Reproducible Signed Releases:** Every tagged release (`v*`) publishes `.zip`, `.xpi`, and `SHA256SUMS.txt` via [`.github/workflows/release.yml`](../.github/workflows/release.yml).
