import type { ContentItem, RiskHit } from './types';

// Curated offline profanity/slur stems (EN + TR) matched on word boundaries.
// Kept focused to minimize false positives on benign words.
const EN_PROFANITY = [
  'fuck',
  'fucking',
  'fucker',
  'shit',
  'bullshit',
  'bitch',
  'asshole',
  'bastard',
  'dickhead',
  'motherfucker',
  'cunt',
  'slut',
  'whore',
  'retard',
  'retarded',
  'faggot',
  'nigger',
];

const TR_PROFANITY = [
  'amk',
  'aq',
  'mk',
  'orospu',
  'orospu çocuğu',
  'oç',
  'piç',
  'siktir',
  'sikik',
  'sikerim',
  'sikeyim',
  'yarrak',
  'göt',
  'götveren',
  'pezevenk',
  'kahpe',
  'ibne',
  'puşt',
  'amına',
  'amina',
  'gerizekalı',
  'mal',
  'aptal',
  'salak',
  'şerefsiz',
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTr(text: string): string {
  return text.toLocaleLowerCase('tr-TR');
}

// Match whole tokens using Unicode letter/digit boundaries so Turkish characters
// like ı, ğ, ü, ş, ö, ç are respected properly.
const WORD_PATTERNS: Array<{ raw: string; re: RegExp }> = [...EN_PROFANITY, ...TR_PROFANITY].map(
  (word) => ({
    raw: word,
    re: new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegex(normalizeTr(word))}(?![\\p{L}\\p{N}_])`, 'giu'),
  }),
);

const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;

// International and Turkish phone formats: +90 5xx..., 05xx xxx xx xx, +1-xxx-xxx-xxxx
const PHONE_RE =
  /(?<![\p{N}])(?:\+?90[\s.-]?\(?0?5\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}|0?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}|\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4})(?![\p{N}])/gu;

// Turkish IBAN (TR + 24 digits) or generic IBAN (2 letters + 2 digits + 11..30 alnum)
const IBAN_RE = /\b(?:TR\d{2}(?:\s?\d{4}){5}\s?\d{2}|[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){2,7}(?:\s?[A-Z0-9]{1,4})?)\b/gi;

// Candidate 11-digit Turkish ID number
const TCKN_CANDIDATE_RE = /(?<!\d)([1-9]\d{10})(?!\d)/g;

// Candidate 13-19 digit payment card number (with optional spaces or dashes)
const CARD_CANDIDATE_RE = /(?<!\d)((?:\d[\s-]?){13,19})(?!\d)/g;

/** Official 11-digit Turkish ID (T.C. Kimlik No) checksum verification. */
export function isValidTckn(digits: string): boolean {
  if (!/^[1-9]\d{10}$/.test(digits)) return false;
  const d = digits.split('').map(Number);
  const oddSum = (d[0] ?? 0) + (d[2] ?? 0) + (d[4] ?? 0) + (d[6] ?? 0) + (d[8] ?? 0);
  const evenSum = (d[1] ?? 0) + (d[3] ?? 0) + (d[5] ?? 0) + (d[7] ?? 0);
  const d10 = (((oddSum * 7 - evenSum) % 10) + 10) % 10;
  if (d[9] !== d10) return false;
  const sum10 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  return d[10] === sum10 % 10;
}

/** Standard Luhn check for payment card numbers. */
export function isValidLuhn(rawDigits: string): boolean {
  const digits = rawDigits.replace(/[\s-]/g, '');
  if (digits.length < 13 || digits.length > 19 || !/^\d+$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function maskSecret(val: string): string {
  const clean = val.trim();
  if (clean.length <= 6) return '***';
  return `${clean.slice(0, 3)}…${clean.slice(-2)}`;
}

export function scanItemRisks(item: ContentItem, customKeywords: string[] = []): RiskHit[] {
  const hits: RiskHit[] = [];
  const text = item.text || '';
  const normText = normalizeTr(text);

  for (const { raw, re } of WORD_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(normText)) {
      hits.push({ kind: 'profanity', match: raw });
    }
  }

  for (const kw of customKeywords) {
    const trimmed = normalizeTr(kw.trim());
    if (trimmed && normText.includes(trimmed)) {
      hits.push({ kind: 'custom', match: kw.trim() });
    }
  }

  EMAIL_RE.lastIndex = 0;
  for (const m of text.matchAll(EMAIL_RE)) {
    hits.push({ kind: 'email', match: m[0] });
  }

  PHONE_RE.lastIndex = 0;
  for (const m of text.matchAll(PHONE_RE)) {
    hits.push({ kind: 'phone', match: maskSecret(m[0]) });
  }

  IBAN_RE.lastIndex = 0;
  for (const m of text.matchAll(IBAN_RE)) {
    const compact = m[0].replace(/\s+/g, '');
    if (compact.length >= 16) {
      hits.push({ kind: 'iban', match: maskSecret(compact) });
    }
  }

  TCKN_CANDIDATE_RE.lastIndex = 0;
  for (const m of text.matchAll(TCKN_CANDIDATE_RE)) {
    const tckn = m[1];
    if (tckn && isValidTckn(tckn)) {
      hits.push({ kind: 'tckn', match: maskSecret(tckn) });
    }
  }

  CARD_CANDIDATE_RE.lastIndex = 0;
  for (const m of text.matchAll(CARD_CANDIDATE_RE)) {
    const rawCard = m[1];
    if (!rawCard) continue;
    const digits = rawCard.replace(/[\s-]/g, '');
    // Skip if already matched as TCKN or IBAN digits
    if (digits.length >= 13 && !isValidTckn(digits) && isValidLuhn(digits)) {
      hits.push({ kind: 'card', match: maskSecret(digits) });
    }
  }

  if (item.createdAt) {
    const d = new Date(item.createdAt);
    if (!Number.isNaN(d.getTime())) {
      const hour = d.getHours();
      if (hour >= 1 && hour < 5) {
        hits.push({ kind: 'late_night', match: `${String(hour).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` });
      }
    }
  }

  return hits;
}
