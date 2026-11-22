#!/usr/bin/env node
// Scans package-lock.json and rejects packages without a GPL-3.0-or-later compatible license.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const LOCK_PATH = path.join(ROOT, 'package-lock.json');

// Licenses compatible with distributing NukeAll under GPL-3.0-or-later.
// Note: GPL-2.0-only, SSPL, BSL, AGPL-3.0 (in library code if unwanted), UNLICENSED, and NC/ND licenses are excluded.
const ALLOWED_LICENSES = new Set([
  'MIT',
  'MIT-0',
  'ISC',
  '0BSD',
  'BSD-2-Clause',
  'BSD-2-Clause-FreeBSD',
  'BSD-3-Clause',
  'Apache-2.0',
  'CC0-1.0',
  'CC-BY-3.0',
  'CC-BY-4.0',
  'OFL-1.1',
  'Unlicense',
  'WTFPL',
  'Zlib',
  'BlueOak-1.0.0',
  'Artistic-2.0',
  'Python-2.0',
  'PSF-2.0',
  'UPL-1.0',
  'MPL-2.0',
  'MPL-2.0-no-copyleft-exception',
  'LGPL-2.1-or-later',
  'LGPL-3.0-only',
  'LGPL-3.0-or-later',
  'GPL-2.0-or-later',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'GPL-3.0',
  'BSD',
]);

const FORBIDDEN_PATTERNS = [
  /UNLICENSED/i,
  /PROPRIETARY/i,
  /SEE LICENSE/i,
  /COMMERCIAL/i,
  /SSPL/i,
  /BSL/i,
  /CC-BY-NC/i,
  /CC-BY-ND/i,
  /GPL-2\.0-only/i,
  /WTFPL-1/i,
];

function extractLicenseString(pkgMeta, pkgPath) {
  let raw = pkgMeta.license ?? pkgMeta.licenses;
  if (!raw && pkgPath) {
    const fallbackPkgJson = path.join(ROOT, pkgPath, 'package.json');
    if (fs.existsSync(fallbackPkgJson)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(fallbackPkgJson, 'utf8'));
        raw = parsed.license ?? parsed.licenses;
      } catch {
        // Ignore unreadable nested manifest; handled below.
      }
    }
  }
  if (!raw) return '';
  if (typeof raw === 'string') return raw.trim();
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === 'string' ? item : item?.type || ''))
      .filter(Boolean)
      .join(' OR ');
  }
  if (typeof raw === 'object' && typeof raw.type === 'string') {
    return raw.type.trim();
  }
  return '';
}

function isCompatibleExpression(expr) {
  if (!expr) return false;
  for (const pat of FORBIDDEN_PATTERNS) {
    if (pat.test(expr)) return false;
  }

  // Strip parentheses and normalize whitespace for SPDX AND / OR evaluation.
  const cleaned = expr.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return false;

  // For OR expressions, at least one branch must be allowed.
  if (/\sOR\s/.test(cleaned) && !/\sAND\s/.test(cleaned)) {
    const branches = cleaned.split(/\sOR\s/).map((s) => s.trim());
    return branches.some((branch) => isCompatibleExpression(branch));
  }

  // For AND expressions, all terms must be allowed.
  if (/\sAND\s/.test(cleaned)) {
    const terms = cleaned.split(/\sAND\s/).map((s) => s.trim());
    return terms.every((term) => isCompatibleExpression(term));
  }

  // Handle legacy "/" delimiter (equivalent to OR in older package.json manifests).
  if (cleaned.includes('/')) {
    const branches = cleaned.split('/').map((s) => s.trim());
    return branches.some((branch) => ALLOWED_LICENSES.has(branch));
  }

  return ALLOWED_LICENSES.has(cleaned);
}

if (!fs.existsSync(LOCK_PATH)) {
  console.error(`package-lock.json not found at ${LOCK_PATH}`);
  process.exit(1);
}

const lock = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
const packages = lock.packages || {};

const violations = [];
const licenseCounts = new Map();
let checkedCount = 0;

for (const [pkgPath, pkgMeta] of Object.entries(packages)) {
  // Skip root workspace entry and local workspace symlinks (they declare license in root).
  if (pkgPath === '' || pkgMeta.link) continue;
  if (!pkgPath.includes('node_modules')) continue;

  checkedCount++;
  const expr = extractLicenseString(pkgMeta, pkgPath);
  if (!expr) {
    violations.push({ pkgPath, version: pkgMeta.version || 'unknown', license: '<missing>' });
    continue;
  }

  licenseCounts.set(expr, (licenseCounts.get(expr) || 0) + 1);
  if (!isCompatibleExpression(expr)) {
    violations.push({ pkgPath, version: pkgMeta.version || 'unknown', license: expr });
  }
}

if (violations.length > 0) {
  console.error(`License compatibility check FAILED (${violations.length} incompatible or missing packages):`);
  for (const v of violations) {
    console.error(`  - ${v.pkgPath}@${v.version}: ${v.license}`);
  }
  process.exit(1);
}

console.log(`License check OK: ${checkedCount} packages verified GPL-3.0-or-later compatible.`);
const summary = [...licenseCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([lic, n]) => `${lic}=${n}`)
  .join(', ');
console.log(`Top licenses: ${summary}`);
