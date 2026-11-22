import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const DIST_DIR = resolve(import.meta.dirname, '..', 'apps', 'website', 'dist');

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkHtml(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walkHtml(DIST_DIR);
if (files.length === 0) {
  console.error('check-seo: no HTML files found in', DIST_DIR);
  process.exit(1);
}

const errors = [];
const ALLOWED_EXTERNAL_ASSET_ORIGINS = new Set(['https://static.cloudflareinsights.com', 'https://nukeall.app']);

for (const file of files) {
  const rel = relative(DIST_DIR, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  const is404 = rel === '404.html' || rel.endsWith('/404.html');

  const check = (cond, msg) => {
    if (!cond) errors.push(`${rel}: ${msg}`);
  };

  check(/<html[^>]+lang="(en|tr)"/i.test(html), 'missing <html lang="en|tr">');
  check(/<title>[^<]+<\/title>/i.test(html), 'missing or empty <title>');
  check(/<meta[^>]+name="description"[^>]+content="[^"]+"/i.test(html), 'missing meta description');
  check(/<meta[^>]+property="og:title"[^>]+content="[^"]+"/i.test(html), 'missing og:title');
  check(/<meta[^>]+property="og:image"[^>]+content="[^"]+"/i.test(html), 'missing og:image');

  if (!is404) {
    check(/<link[^>]+rel="canonical"[^>]+href="https:\/\/nukeall\.app[^"]*"/i.test(html), 'missing canonical');
    check(/<link[^>]+rel="alternate"[^>]+hreflang="en"/i.test(html), 'missing hreflang="en"');
    check(/<link[^>]+rel="alternate"[^>]+hreflang="tr"/i.test(html), 'missing hreflang="tr"');
    check(/<link[^>]+rel="alternate"[^>]+hreflang="x-default"/i.test(html), 'missing hreflang="x-default"');
  }

  if (rel === 'index.html' || rel === 'tr/index.html') {
    check(
      html.includes('"@type":"SoftwareApplication"') || html.includes('"@type": "SoftwareApplication"'),
      'missing SoftwareApplication JSON-LD on home page',
    );
  }

  // Check active resource loads (src="..." or <link rel="stylesheet" ... href="https://...">)
  for (const m of html.matchAll(/\b(?:src|poster)=["'](https?:\/\/[^"']+)["']/gi)) {
    try {
      const origin = new URL(m[1]).origin;
      if (!ALLOWED_EXTERNAL_ASSET_ORIGINS.has(origin)) {
        errors.push(`${rel}: disallowed external asset src "${m[1]}"`);
      }
    } catch {
      errors.push(`${rel}: invalid src URL "${m[1]}"`);
    }
  }
}

if (errors.length > 0) {
  console.error('check-seo FAILED:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}

console.log(`check-seo PASSED (${files.length} HTML pages verified).`);
