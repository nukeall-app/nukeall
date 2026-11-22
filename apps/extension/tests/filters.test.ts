import { describe, expect, it } from 'vitest';
import { compileRegex, isSafeRegexPattern, matchesFilter } from '../src/core/filters';
import { importPresetJson } from '../src/core/presets';
import { DEFAULT_FILTERS, type ContentItem, type RiskHit } from '../src/core/types';

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: '1',
    platform: 'x',
    type: 'reply',
    text: 'Hello world from NukeAll',
    createdAt: '2025-05-01T12:00:00.000Z',
    url: 'https://x.com/user/status/1',
    media: false,
    ...overrides,
  };
}

describe('matchesFilter', () => {
  it('filters by content type', () => {
    const reply = makeItem({ type: 'reply' });
    expect(matchesFilter(reply, { ...DEFAULT_FILTERS, types: ['post'] })).toBe(false);
    expect(matchesFilter(reply, { ...DEFAULT_FILTERS, types: ['post', 'reply'] })).toBe(true);
  });

  it('filters by date range (from / to inclusive)', () => {
    const item = makeItem({ createdAt: '2025-05-10T15:30:00.000Z' });
    expect(matchesFilter(item, { ...DEFAULT_FILTERS, from: '2025-05-01', to: '2025-05-10' })).toBe(true);
    expect(matchesFilter(item, { ...DEFAULT_FILTERS, from: '2025-05-11' })).toBe(false);
    expect(matchesFilter(item, { ...DEFAULT_FILTERS, to: '2025-05-09' })).toBe(false);
  });

  it('filters by olderThanDays relative to now', () => {
    const now = new Date('2026-11-18T00:00:00.000Z');
    const oldItem = makeItem({ createdAt: '2025-10-01T00:00:00.000Z' });
    const freshItem = makeItem({ createdAt: '2026-11-10T00:00:00.000Z' });
    expect(matchesFilter(oldItem, { ...DEFAULT_FILTERS, olderThanDays: 365 }, undefined, now)).toBe(true);
    expect(matchesFilter(freshItem, { ...DEFAULT_FILTERS, olderThanDays: 365 }, undefined, now)).toBe(false);
  });

  it('filters by includeKeywords, excludeKeywords and regex', () => {
    const item = makeItem({ text: 'Deploying project XYZ-42 today!' });
    expect(matchesFilter(item, { ...DEFAULT_FILTERS, includeKeywords: ['xyz-42'] })).toBe(true);
    expect(matchesFilter(item, { ...DEFAULT_FILTERS, includeKeywords: ['missing'] })).toBe(false);
    expect(matchesFilter(item, { ...DEFAULT_FILTERS, excludeKeywords: ['deploying'] })).toBe(false);
    expect(matchesFilter(item, { ...DEFAULT_FILTERS, regex: 'XYZ-\\d+' })).toBe(true);
    expect(matchesFilter(item, { ...DEFAULT_FILTERS, regex: 'ABC-\\d+' })).toBe(false);
  });

  it('filters by media and onlyRisky', () => {
    const withMedia = makeItem({ id: 'm1', media: true });
    const noMedia = makeItem({ id: 'm2', media: false });
    expect(matchesFilter(withMedia, { ...DEFAULT_FILTERS, media: 'with' })).toBe(true);
    expect(matchesFilter(noMedia, { ...DEFAULT_FILTERS, media: 'with' })).toBe(false);
    expect(matchesFilter(noMedia, { ...DEFAULT_FILTERS, media: 'without' })).toBe(true);

    const risks = new Map<string, RiskHit[]>([['m1', [{ kind: 'profanity', match: 'shit' }]]]);
    expect(matchesFilter(withMedia, { ...DEFAULT_FILTERS, onlyRisky: true }, risks)).toBe(true);
    expect(matchesFilter(noMedia, { ...DEFAULT_FILTERS, onlyRisky: true }, risks)).toBe(false);
  });

  it('blocks unsafe ReDoS regex patterns and validates imported presets strictly', () => {
    expect(isSafeRegexPattern('XYZ-\\d+')).toBe(true);
    expect(isSafeRegexPattern('(a+)+$')).toBe(false);
    expect(isSafeRegexPattern('([a-z]+)*')).toBe(false);
    expect(isSafeRegexPattern('a'.repeat(201))).toBe(false);
    expect(compileRegex('(a+)+$')).toBeNull();
    expect(compileRegex('a'.repeat(201))).toBeNull();

    const cleanPreset = importPresetJson(
      JSON.stringify({
        schema: 'nukeall-preset-v1',
        name: 'Safe',
        filters: { types: ['post', 'invalid_type'], regex: 'deploy', extraEvil: true },
        protect: { keepPinned: false, minLikes: -5, unknownProp: 'drop' },
      }),
    );
    expect(cleanPreset.filters.types).toEqual(['post']);
    expect((cleanPreset.filters as unknown as Record<string, unknown>).extraEvil).toBeUndefined();
    expect((cleanPreset.protect as unknown as Record<string, unknown>).unknownProp).toBeUndefined();
    expect(cleanPreset.protect.minLikes).toBe(0);

    expect(() =>
      importPresetJson(
        JSON.stringify({
          schema: 'nukeall-preset-v1',
          filters: { types: ['post'], regex: '(a+)+$' },
          protect: { keepPinned: true },
        }),
      ),
    ).toThrow(/Unsafe or overly long regex/i);
  });
});
