import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const OUT_DIR = resolve(import.meta.dirname, '..', 'apps', 'extension', '.output');
const TARGET_EXTS = new Set(['.js', '.mjs', '.html', '.json', '.css']);

const ALLOWED_EXACT = new Set([
  'x.com',
  'twitter.com',
  'abs.twimg.com',
  'instagram.com',
  'reddit.com',
  'linkedin.com',
  'nukeall.app',
  'github.com',
  'ko-fi.com',
  'addons.mozilla.org',
  'www.w3.org',
  'localhost',
  '127.0.0.1',
]);

const ALLOWED_SUFFIXES = ['.x.com', '.twitter.com', '.instagram.com', '.reddit.com', '.linkedin.com', '.nukeall.app'];

function isAllowedHost(rawHost) {
  const host = rawHost.toLowerCase().replace(/:\d+$/, '');
  if (ALLOWED_EXACT.has(host)) return true;
  return ALLOWED_SUFFIXES.some((sfx) => host.endsWith(sfx));
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (TARGET_EXTS.has(extname(name).toLowerCase())) files.push(full);
  }
  return files;
}

const files = walk(OUT_DIR);
if (files.length === 0) {
  console.error('check-network: no built extension files found in', OUT_DIR);
  process.exit(1);
}

const URL_RE = /https?:\/\/([A-Za-z0-9.*_-]+(?::\d+)?)/g;
const violations = [];

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  if (extname(file).toLowerCase() === '.css') {
    // Strip Tailwind's MIT license header comment (`/*! tailwindcss ... | https://tailwindcss.com */`)
    content = content.replace(/\/\*![^*]*https:\/\/tailwindcss\.com[^*]*\*\//g, '');
  }
  for (const m of content.matchAll(URL_RE)) {
    const host = m[1];
    if (!host) continue;
    // Strip leading wildcard used in manifest host_permissions like `*://x.com/*` (won't match http/https anyway)
    if (!isAllowedHost(host)) {
      violations.push({ file, url: m[0], host });
    }
  }
}

if (violations.length > 0) {
  console.error('check-network FAILED — disallowed URLs found in extension build:');
  for (const v of violations) {
    console.error(`  ${v.file}: ${v.url}`);
  }
  process.exit(1);
}

console.log(`check-network PASSED (${files.length} files scanned, 0 disallowed URLs).`);
