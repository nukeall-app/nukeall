#!/usr/bin/env node
// Stages cleanly named Chrome, Firefox & source release zips, generates SHA256SUMS.txt,
// and audits release bundles for accidental PII, local paths, or secrets before publishing.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'apps', 'extension', '.output');
const RELEASE_DIR = path.join(OUTPUT_DIR, 'release');

const FORBIDDEN_ZIP_ENTRY_RE = /(?:^|\/)(?:\.env(?:\.|$)|metrics-local(?:\/|$)|\.git(?:\/|$)|id_rsa|\.pem$|\.key$)/i;

const FORBIDDEN_CONTENT_RULES = [
  { name: 'Windows user path', re: /[A-Za-z]:\\Users\\[A-Za-z0-9._-]+/g },
  { name: 'Unix/macOS user path', re: /\/Users\/[A-Za-z0-9._-]+/g },
  { name: 'Personal email domain', re: /[A-Za-z0-9._%+-]+@(?:gmail|hotmail|outlook|yahoo)\.com/gi },
  { name: 'Personal identifier', re: /ramazanefemerca|\bramazan\b|(?<![a-z0-9])efe(?![a-z0-9])|efe[-_](?:dev|privacy)/gi },
  { name: 'GitHub token', re: /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{12,}/g },
  { name: 'Private key header', re: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/g },
  { name: 'Cloudflare account or analytics token', re: /5455cddefcf1487d0db668c9b1d49ec9|8c089ff5c5f64e93a1d21d27cea2cfd8|eec9e3f813bb4a50b3262203cce44966|e49514a86699a3db05d0ff1f59fc38c6/g },
];

const TEXT_EXTS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.html', '.css', '.txt', '.md', '.yml', '.yaml']);

function readZipEntries(zipPath) {
  const buf = fs.readFileSync(zipPath);
  // Locate End of Central Directory record (0x06054b50) from end of file.
  let eocdOffset = -1;
  const minOffset = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= minOffset; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error(`Invalid ZIP archive (missing EOCD): ${zipPath}`);
  }

  const cdSize = buf.readUInt32LE(eocdOffset + 12);
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const cdEnd = cdOffset + cdSize;
  const entries = [];

  let ptr = cdOffset;
  while (ptr < cdEnd) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) {
      throw new Error(`Corrupt central directory entry in ${zipPath}`);
    }
    const method = buf.readUInt16LE(ptr + 10);
    const compressedSize = buf.readUInt32LE(ptr + 20);
    const fnameLen = buf.readUInt16LE(ptr + 28);
    const extraLen = buf.readUInt16LE(ptr + 30);
    const commentLen = buf.readUInt16LE(ptr + 32);
    const localOffset = buf.readUInt32LE(ptr + 42);

    const name = buf.subarray(ptr + 46, ptr + 46 + fnameLen).toString('utf8');
    ptr += 46 + fnameLen + extraLen + commentLen;

    if (name.endsWith('/')) continue;

    if (buf.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`Corrupt local header for ${name} in ${zipPath}`);
    }
    const localNameLen = buf.readUInt16LE(localOffset + 26);
    const localExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const rawSlice = buf.subarray(dataStart, dataStart + compressedSize);

    let content;
    if (method === 0) content = rawSlice;
    else if (method === 8) content = zlib.inflateRawSync(rawSlice);
    else throw new Error(`Unsupported ZIP compression method ${method} for ${name}`);

    entries.push({ name, content });
  }

  return entries;
}

function findSingleZip(suffix) {
  const candidates = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(suffix))
    .sort();
  if (candidates.length === 0) {
    throw new Error(`Missing *${suffix} in ${OUTPUT_DIR}. Run extension zip scripts first.`);
  }
  return path.join(OUTPUT_DIR, candidates[0]);
}

function auditArchive(zipPath) {
  const relZip = path.relative(ROOT, zipPath);
  const entries = readZipEntries(zipPath);
  const issues = [];

  for (const entry of entries) {
    if (FORBIDDEN_ZIP_ENTRY_RE.test(entry.name)) {
      issues.push(`${relZip} -> forbidden entry path: ${entry.name}`);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!TEXT_EXTS.has(ext)) continue;

    // Do not self-flag the audit script inside sources.zip if it happens to list patterns.
    if (entry.name.endsWith('stage-release.mjs')) continue;

    const text = entry.content.toString('utf8');
    for (const rule of FORBIDDEN_CONTENT_RULES) {
      rule.re.lastIndex = 0;
      const m = rule.re.exec(text);
      if (m) {
        issues.push(`${relZip} -> ${entry.name}: matched ${rule.name} ("${m[0].slice(0, 40)}")`);
      }
    }
  }

  return { entryCount: entries.length, issues };
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.error(`Output directory missing: ${OUTPUT_DIR}`);
    process.exit(1);
  }

  const chromeSrc = findSingleZip('-chrome.zip');
  const firefoxSrc = findSingleZip('-firefox.zip');
  const sourcesSrc = findSingleZip('-sources.zip');

  fs.mkdirSync(RELEASE_DIR, { recursive: true });

  const targets = [
    { src: chromeSrc, dest: path.join(RELEASE_DIR, 'nukeall-chrome.zip') },
    { src: firefoxSrc, dest: path.join(RELEASE_DIR, 'nukeall-firefox.zip') },
    { src: sourcesSrc, dest: path.join(RELEASE_DIR, 'nukeall-sources.zip') },
  ];

  const checksumLines = [];
  const allIssues = [];

  for (const { src, dest } of targets) {
    fs.copyFileSync(src, dest);
    const bytes = fs.readFileSync(dest);
    const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    const name = path.basename(dest);
    checksumLines.push(`${sha256}  ${name}`);

    const { entryCount, issues } = auditArchive(dest);
    allIssues.push(...issues);
    console.log(`Staged ${name} (${(bytes.length / 1024).toFixed(2)} kB, ${entryCount} files, sha256=${sha256.slice(0, 12)}…)`);
  }

  const sumsPath = path.join(RELEASE_DIR, 'SHA256SUMS.txt');
  fs.writeFileSync(sumsPath, `${checksumLines.join('\n')}\n`, 'utf8');

  if (allIssues.length > 0) {
    console.error('Release audit FAILED — sensitive data detected:');
    for (const iss of allIssues) console.error(`  - ${iss}`);
    process.exit(1);
  }

  console.log(`Release staging & privacy audit PASSED (0 PII/secret matches across ${targets.length} archives).`);
}

main();
