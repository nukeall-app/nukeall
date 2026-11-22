import type { ContentType } from '../../core/types';

export type LinkedInContentKind = 'post' | 'comment' | 'like';

export interface LinkedInScanStep {
  url: string;
  type: LinkedInContentKind;
}

export interface LinkedInUrnParts {
  urn: string;
  kind: 'activity' | 'ugcPost' | 'share';
  id: string;
}

// LinkedIn 64-bit Snowflake IDs store Unix epoch ms in the upper 41 bits (>> 22).
const MIN_LINKEDIN_EPOCH_MS = 1_356_998_400_000; // 2013-01-01T00:00:00.000Z
const MAX_LINKEDIN_EPOCH_MS = 4_102_444_800_000; // 2100-01-01T00:00:00.000Z

export function extractLinkedInUrn(input: string): LinkedInUrnParts | null {
  if (!input) return null;
  const decoded = (() => {
    try {
      return decodeURIComponent(input);
    } catch {
      return input;
    }
  })();
  const m = decoded.match(/urn:li:(activity|ugcPost|share):(\d{10,22})/);
  if (!m?.[1] || !m[2]) return null;
  return {
    urn: `urn:li:${m[1]}:${m[2]}`,
    kind: m[1] as LinkedInUrnParts['kind'],
    id: m[2],
  };
}

/**
 * Decodes exact creation timestamp from a LinkedIn activity/ugcPost/share Snowflake URN
 * by shifting the numeric ID 22 bits right to extract Unix milliseconds.
 */
export function linkedinUrnToIso(urnOrId: string): string | null {
  const parts = extractLinkedInUrn(urnOrId);
  const digits = parts?.id ?? (/^\d{15,22}$/.test(urnOrId.trim()) ? urnOrId.trim() : '');
  if (!digits) return null;

  try {
    const ms = Number(BigInt(digits) >> 22n);
    if (!Number.isFinite(ms) || ms < MIN_LINKEDIN_EPOCH_MS || ms > MAX_LINKEDIN_EPOCH_MS) {
      return null;
    }
    return new Date(ms).toISOString();
  } catch {
    return null;
  }
}

export function sanitizeLinkedInUrl(urnOrUrl: string): string {
  const parts = extractLinkedInUrn(urnOrUrl);
  if (parts) {
    return `https://www.linkedin.com/feed/update/${parts.urn}/`;
  }
  if (/^https:\/\/(?:www\.)?linkedin\.com\//i.test(urnOrUrl.trim())) {
    return urnOrUrl.trim();
  }
  return 'https://www.linkedin.com/feed/';
}

export function detectLinkedInHandleFromPath(pathname: string): string {
  const m = pathname.match(/^\/in\/([^/?#]+)/i);
  const raw = m?.[1]?.trim() ?? '';
  if (!raw) return '';
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // Keep raw segment if malformed encoding
  }
  const clean = decoded.replace(/\/+$/, '').trim();
  if (!clean || /^me$/i.test(clean)) return '';
  return clean;
}

export function planLinkedInScanSteps(handle: string, selectedTypes: ContentType[]): LinkedInScanStep[] {
  const clean = handle
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i, '')
    .replace(/^\/?in\//i, '')
    .split(/[/?#]/)[0]
    ?.trim();

  if (!clean || /^me$/i.test(clean)) return [];

  const encoded = encodeURIComponent(clean);
  const steps: LinkedInScanStep[] = [];
  if (selectedTypes.includes('post')) {
    steps.push({ url: `https://www.linkedin.com/in/${encoded}/recent-activity/all/`, type: 'post' });
  }
  if (selectedTypes.includes('comment')) {
    steps.push({ url: `https://www.linkedin.com/in/${encoded}/recent-activity/comments/`, type: 'comment' });
  }
  if (selectedTypes.includes('like')) {
    steps.push({ url: `https://www.linkedin.com/in/${encoded}/recent-activity/reactions/`, type: 'like' });
  }
  return steps;
}

/**
 * Parses English or Turkish LinkedIn relative time labels (e.g. "3w", "2mo", "1y", "4 ay • Düzenlendi")
 * into an approximate UTC ISO timestamp when a Snowflake URN is unavailable.
 */
export function parseLinkedInRelativeDate(label: string, now: Date = new Date()): string | null {
  const cleaned = label
    .replace(/\u2022.*$/g, '')
    .replace(/edited|düzenlendi|visible to.*$/gi, '')
    .trim();
  if (!cleaned) return null;

  if (/^(?:just\s+now|now|şimdi|az\s+önce)$/i.test(cleaned)) {
    return now.toISOString();
  }

  const unitMatch = cleaned.match(
    /^(\d+)\s*(yıl|yr|yrs|year|years|y|ay|mos|mo|month|months|hafta|hf|wk|wks|week|weeks|w|gün|g|day|days|d|saat|sa|hr|hrs|hour|hours|h|dakika|dk|min|mins|minute|minutes|m|sn|sec|secs|s)\b/i,
  );
  if (unitMatch?.[1] && unitMatch[2]) {
    const qty = Number.parseInt(unitMatch[1], 10);
    const unit = unitMatch[2].toLowerCase();
    if (!Number.isFinite(qty) || qty < 0) return null;

    let msPerUnit = 0;
    if (['y', 'yr', 'yrs', 'year', 'years', 'yıl'].includes(unit)) {
      msPerUnit = 365 * 86_400_000;
    } else if (['mo', 'mos', 'month', 'months', 'ay'].includes(unit)) {
      msPerUnit = 30 * 86_400_000;
    } else if (['w', 'wk', 'wks', 'week', 'weeks', 'hf', 'hafta'].includes(unit)) {
      msPerUnit = 7 * 86_400_000;
    } else if (['d', 'day', 'days', 'g', 'gün'].includes(unit)) {
      msPerUnit = 86_400_000;
    } else if (['h', 'hr', 'hrs', 'hour', 'hours', 'sa', 'saat'].includes(unit)) {
      msPerUnit = 3_600_000;
    } else if (['m', 'min', 'mins', 'minute', 'minutes', 'dk', 'dakika'].includes(unit)) {
      msPerUnit = 60_000;
    } else if (['s', 'sec', 'secs', 'sn'].includes(unit)) {
      msPerUnit = 1_000;
    }

    if (msPerUnit > 0) {
      return new Date(now.getTime() - qty * msPerUnit).toISOString();
    }
  }

  const parsedMs = Date.parse(cleaned);
  if (!Number.isNaN(parsedMs)) {
    return new Date(parsedMs).toISOString();
  }

  return null;
}
