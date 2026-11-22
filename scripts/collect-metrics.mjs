#!/usr/bin/env node
// Local-only snapshot script to record due-diligence growth metrics into metrics-local/YYYY-MM-DD.json.
// Never sends telemetry from the extension and is intentionally excluded from Git commits (.gitignore).

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'metrics-local');

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const repo = getArgValue('--repo') || process.env.NUKEALL_GITHUB_REPO || '';
const amoSlug = getArgValue('--amo') || process.env.NUKEALL_AMO_SLUG || '';

async function fetchJsonSafe(url, headers = {}) {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      return { error: `HTTP ${res.status}`, data: null };
    }
    return { error: null, data: await res.json() };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err), data: null };
  }
}

async function main() {
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10);

  const snapshot = {
    schemaVersion: '1.0',
    collectedAt: now.toISOString(),
    dryRun: DRY_RUN,
    sources: {
      github: null,
      amo: null,
    },
    manualReminders: [
      'Export Chrome Web Store Developer Dashboard CSV (weekly users, impressions, installs) into metrics-local/cws/',
      'Export Firefox Add-ons (AMO) statistics CSV into metrics-local/amo/',
      'Export Cloudflare Web Analytics summary (pageviews, visits, top SEO guides) into metrics-local/cloudflare/',
    ],
  };

  if (DRY_RUN) {
    console.log('[collect-metrics] Dry run — skipping external API requests and file writes.');
    console.log(JSON.stringify(snapshot, null, 2));
    return;
  }

  if (repo && repo.includes('/') && !repo.includes('YOUR_GITHUB')) {
    const ghHeaders = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'nukeall-local-metrics',
    };
    if (process.env.GITHUB_TOKEN) {
      ghHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const repoRes = await fetchJsonSafe(`https://api.github.com/repos/${repo}`, ghHeaders);
    const relRes = await fetchJsonSafe(`https://api.github.com/repos/${repo}/releases?per_page=20`, ghHeaders);

    const totalReleaseDownloads = Array.isArray(relRes.data)
      ? relRes.data.reduce(
          (sum, rel) =>
            sum + (Array.isArray(rel.assets) ? rel.assets.reduce((aSum, a) => aSum + (a.download_count || 0), 0) : 0),
          0
        )
      : null;

    snapshot.sources.github = {
      repo,
      stars: repoRes.data?.stargazers_count ?? null,
      forks: repoRes.data?.forks_count ?? null,
      watchers: repoRes.data?.subscribers_count ?? null,
      openIssues: repoRes.data?.open_issues_count ?? null,
      totalReleaseDownloads,
      error: repoRes.error || relRes.error || null,
    };
  } else {
    snapshot.sources.github = {
      skipped: 'Pass --repo owner/name or set NUKEALL_GITHUB_REPO to record public GitHub stats.',
    };
  }

  if (amoSlug) {
    const amoRes = await fetchJsonSafe(`https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(amoSlug)}/`);
    snapshot.sources.amo = amoRes.data
      ? {
          slug: amoSlug,
          averageDailyUsers: amoRes.data.average_daily_users ?? null,
          weeklyDownloads: amoRes.data.weekly_downloads ?? null,
          ratingAverage: amoRes.data.ratings?.average ?? null,
          ratingCount: amoRes.data.ratings?.count ?? null,
        }
      : { slug: amoSlug, error: amoRes.error };
  } else {
    snapshot.sources.amo = {
      skipped: 'Pass --amo <slug> or set NUKEALL_AMO_SLUG to record public AMO stats.',
    };
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${dateStamp}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`[collect-metrics] Saved snapshot to ${path.relative(ROOT, outPath)}`);
}

await main();
