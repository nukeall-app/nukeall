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

  return hits;
}
