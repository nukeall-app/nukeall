import type { ContentItem } from '../../core/types';
import { parseCsvRows } from '../reddit/archive';
import {
  extractLinkedInUrn,
  linkedinUrnToIso,
  sanitizeLinkedInUrl,
  type LinkedInContentKind,
} from './parser';

function normalizeLinkedInExportDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  // LinkedIn CSV exports typically format timestamps as "YYYY-MM-DD HH:MM:SS" in UTC.
  const isoCandidate = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?::\d{2})?$/.test(s)
    ? `${s.replace(/\s+/, 'T')}Z`
    : s;
  const ms = Date.parse(isoCandidate);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

function stableRowHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function detectLinkedInCsvKind(headers: string[], filename?: string): LinkedInContentKind | null {
  const norm = new Set(headers.map((h) => h.trim().toLowerCase()));
  const fname = (filename ?? '').toLowerCase();

  if (norm.has('sharecommentary') || norm.has('sharelink') || fname.includes('shares')) {
    return 'post';
  }
  if ((norm.has('message') || norm.has('comment')) && norm.has('link') && norm.has('date')) {
    return 'comment';
  }
  if (fname.includes('comment') && (norm.has('message') || norm.has('comment'))) {
    return 'comment';
  }
  if ((norm.has('type') && norm.has('link') && norm.has('date')) || fname.includes('reaction')) {
    return 'like';
  }
  return null;
}

/**
 * Parses LinkedIn official data export CSVs:
 * - Shares.csv (Date, ShareLink, ShareCommentary, SharedUrl, MediaUrl, Visibility)
 * - Comments.csv (Date, Link, Message)
 * - Reactions.csv (Date, Type, Link)
 */
export function parseLinkedInCsvArchive(rawText: string, filename?: string): ContentItem[] {
  const rows = parseCsvRows(rawText);
  if (rows.length < 2) return [];

  const headerRow = rows[0] ?? [];
  const headers = headerRow.map((h) => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  const kind = detectLinkedInCsvKind(headers, filename);
  if (!kind) return [];

  const colIndex = (name: string): number => headers.indexOf(name);
  const dateIdx = colIndex('date');
  const shareLinkIdx = colIndex('sharelink');
  const linkIdx = colIndex('link');
  const commentaryIdx = colIndex('sharecommentary');
  const sharedUrlIdx = colIndex('sharedurl');
  const mediaUrlIdx = colIndex('mediaurl');
  const visibilityIdx = colIndex('visibility');
  const messageIdx = colIndex('message') !== -1 ? colIndex('message') : colIndex('comment');
  const typeIdx = colIndex('type');

  const items: ContentItem[] = [];
  const seenIds = new Set<string>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c.trim())) continue;

    const get = (idx: number): string => (idx >= 0 ? (row[idx] ?? '').trim() : '');
    const rawDate = get(dateIdx);
    const rawUrl = kind === 'post' ? get(shareLinkIdx) || get(linkIdx) : get(linkIdx) || get(shareLinkIdx);
    const urnParts = extractLinkedInUrn(rawUrl);

    const createdAt =
      normalizeLinkedInExportDate(rawDate) ??
      (urnParts ? linkedinUrnToIso(urnParts.urn) : null) ??
      new Date(0).toISOString();

    let text = '';
    if (kind === 'post') {
      const commentary = get(commentaryIdx);
      const sharedUrl = get(sharedUrlIdx);
      text = [commentary, sharedUrl ? `Shared: ${sharedUrl}` : ''].filter(Boolean).join('\n');
    } else if (kind === 'comment') {
      text = get(messageIdx);
    } else {
      const reactionType = get(typeIdx);
      text = reactionType ? `Reaction: ${reactionType}` : 'Reaction';
    }

    const baseId = urnParts?.urn ?? `li_csv_${kind}_${stableRowHash(`${rawDate}|${rawUrl}|${text}`)}`;
    const id = seenIds.has(baseId) ? `${baseId}_${i}` : baseId;
    seenIds.add(id);

    const url = rawUrl ? sanitizeLinkedInUrl(rawUrl) : 'https://www.linkedin.com/feed/';
    const visibility = get(visibilityIdx);
    const mediaUrl = get(mediaUrlIdx);

    items.push({
      id,
      platform: 'linkedin',
      type: kind,
      text: text || `[LinkedIn ${kind}]`,
      createdAt,
      url,
      media: Boolean(mediaUrl),
      metrics: {},
      meta: {
        urn: urnParts?.urn,
        permalink: rawUrl || undefined,
        visibility: visibility || undefined,
        source: 'linkedin-archive',
      },
    });
  }

  return items;
}
