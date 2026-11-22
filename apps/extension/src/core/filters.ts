import type { ContentItem, FilterOptions, RiskHit } from './types';

const MAX_REGEX_LENGTH = 200;

/**
 * Checks whether a user/preset regex pattern is bounded and free of nested
 * quantifiers or backreferences that could trigger catastrophic backtracking.
 */
export function isSafeRegexPattern(pattern: string): boolean {
  if (!pattern || pattern.length > MAX_REGEX_LENGTH) return false;

  const groupStack: boolean[] = [];
  let inCharClass = false;

  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]!;
    if (ch === '\\') {
      const next = pattern[i + 1];
      if (!inCharClass && next && next >= '1' && next <= '9') {
        return false; // reject backreferences
      }
      i++;
      continue;
    }
    if (inCharClass) {
      if (ch === ']') inCharClass = false;
      continue;
    }
    if (ch === '[') {
      inCharClass = true;
      continue;
    }
    if (ch === '(') {
      groupStack.push(false);
      continue;
    }
    if (ch === '*' || ch === '+' || ch === '{') {
      if (groupStack.length > 0) {
        groupStack[groupStack.length - 1] = true;
      }
      continue;
    }
    if (ch === ')') {
      const hadInnerQuantifier = groupStack.pop() ?? false;
      const next = pattern[i + 1] ?? '';
      if (hadInnerQuantifier && (next === '*' || next === '+' || next === '{')) {
        return false;
      }
      if (hadInnerQuantifier && groupStack.length > 0) {
        groupStack[groupStack.length - 1] = true;
      }
    }
  }

  return true;
}

export function compileRegex(pattern?: string): RegExp | null {
  const trimmed = pattern?.trim();
  if (!trimmed || !isSafeRegexPattern(trimmed)) return null;
  try {
    return new RegExp(trimmed, 'i');
  } catch {
    return null;
  }
}

export function matchesFilter(
  item: ContentItem,
  opts: FilterOptions,
  riskHits?: Map<string, RiskHit[]>,
  now: Date = new Date(),
): boolean {
  if (opts.types.length > 0 && !opts.types.includes(item.type)) {
    return false;
  }

  const createdMs = Date.parse(item.createdAt);
  if (!Number.isNaN(createdMs)) {
    if (opts.from) {
      const fromMs = Date.parse(opts.from);
      if (!Number.isNaN(fromMs) && createdMs < fromMs) return false;
    }
    if (opts.to) {
      // Include the full "to" day when YYYY-MM-DD is given
      const toStr = /^\d{4}-\d{2}-\d{2}$/.test(opts.to) ? `${opts.to}T23:59:59.999Z` : opts.to;
      const toMs = Date.parse(toStr);
      if (!Number.isNaN(toMs) && createdMs > toMs) return false;
    }
    if (opts.olderThanDays && opts.olderThanDays > 0) {
      const cutoff = now.getTime() - opts.olderThanDays * 86_400_000;
      if (createdMs > cutoff) return false;
    }
  }

  if (opts.media === 'with' && !item.media) return false;
  if (opts.media === 'without' && item.media) return false;

  const textLower = (item.text || '').toLocaleLowerCase();

  if (opts.excludeKeywords.length > 0) {
    for (const kw of opts.excludeKeywords) {
      const k = kw.trim().toLocaleLowerCase();
      if (k && textLower.includes(k)) return false;
    }
  }

  if (opts.includeKeywords.length > 0) {
    const cleaned = opts.includeKeywords.map((k) => k.trim().toLocaleLowerCase()).filter(Boolean);
    if (cleaned.length > 0 && !cleaned.some((k) => textLower.includes(k))) {
      return false;
    }
  }

  if (opts.regex && opts.regex.trim()) {
    const re = compileRegex(opts.regex);
    if (!re || !re.test(item.text || '')) return false;
  }

  if (opts.onlyRisky) {
    const hits = riskHits?.get(item.id) ?? [];
    if (hits.length === 0) return false;
  }

  return true;
}
