import type { ContentItem } from '../../core/types';

/** RFC 4180 CSV parser handling quoted fields, escaped quotes and embedded newlines. */
export function parseCsvRows(raw: string): string[][] {
  const input = raw.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\r') {
      if (input[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function toIsoDate(raw?: string): string {
  if (!raw) return new Date(0).toISOString();
  const normalized = raw.trim().replace(' UTC', 'Z').replace(' ', 'T');
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? new Date(0).toISOString() : new Date(ms).toISOString();
}

/**
 * Parses official Reddit data-export CSV files (`comments.csv` or `posts.csv`)
 * to bypass Reddit's 1,000-item profile history limit.
 */
export function parseRedditCsvArchive(rawCsv: string, kindHint?: 'comment' | 'post'): ContentItem[] {
  const rows = parseCsvRows(rawCsv);
  if (rows.length < 2) return [];

  const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const idCol = idx('id');
  if (idCol === -1) {
    throw new Error('Missing "id" column — expected Reddit comments.csv or posts.csv');
  }

  const permalinkCol = idx('permalink');
  const dateCol = idx('date');
  const subCol = idx('subreddit');
  const bodyCol = idx('body');
  const titleCol = idx('title');
  const parentCol = idx('parent');

  const detectedKind: 'comment' | 'post' =
    kindHint ?? (titleCol !== -1 && parentCol === -1 ? 'post' : 'comment');

  const out: ContentItem[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const rawId = (r[idCol] ?? '').trim();
    if (!rawId) continue;

    const fullname = /^t[13]_/i.test(rawId)
      ? rawId
      : `${detectedKind === 'comment' ? 't1' : 't3'}_${rawId}`;

    const title = titleCol !== -1 ? (r[titleCol] ?? '').trim() : '';
    const body = bodyCol !== -1 ? (r[bodyCol] ?? '').trim() : '';
    const text = detectedKind === 'post' ? [title, body].filter(Boolean).join('\n\n') : body;
    const sub = subCol !== -1 ? (r[subCol] ?? '').trim() : '';
    const link = permalinkCol !== -1 ? (r[permalinkCol] ?? '').trim() : '';

    out.push({
      id: fullname,
      platform: 'reddit',
      type: detectedKind,
      text,
      createdAt: toIsoDate(dateCol !== -1 ? r[dateCol] : undefined),
      url: link || 'https://www.reddit.com',
      source: sub ? (sub.startsWith('r/') ? sub : `r/${sub}`) : undefined,
      meta: { isSelf: detectedKind === 'comment' ? true : Boolean(body) },
    });
  }

  return out;
}
