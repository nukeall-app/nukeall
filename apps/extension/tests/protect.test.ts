import { describe, expect, it } from 'vitest';
import { isProtected } from '../src/core/protect';
import { DEFAULT_PROTECT, type ContentItem } from '../src/core/types';

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 't1',
    platform: 'x',
    type: 'post',
    text: 'Regular tweet',
    createdAt: '2025-01-01T12:00:00.000Z',
    url: 'https://x.com/user/status/t1',
    metrics: { likes: 5, reposts: 1 },
    pinned: false,
    ...overrides,
  };
}

describe('isProtected', () => {
  it('protects pinned posts when keepPinned is true', () => {
    const pinned = makeItem({ pinned: true });
    expect(isProtected(pinned, { ...DEFAULT_PROTECT, keepPinned: true })).toEqual({
      protected: true,
      reason: 'pinned',
    });
    expect(isProtected(pinned, { ...DEFAULT_PROTECT, keepPinned: false })).toEqual({
      protected: false,
    });
  });

  it('protects by minLikes and minReposts thresholds', () => {
    const viral = makeItem({ metrics: { likes: 120, reposts: 30 } });
    expect(isProtected(viral, { ...DEFAULT_PROTECT, minLikes: 100 })).toEqual({
      protected: true,
      reason: 'minLikes',
    });
    expect(isProtected(viral, { ...DEFAULT_PROTECT, minLikes: 0, minReposts: 25 })).toEqual({
      protected: true,
      reason: 'minReposts',
    });
  });

  it('protects by keepTag case-insensitively', () => {
    const tagged = makeItem({ text: 'Important note #KEEP forever' });
    expect(isProtected(tagged, { ...DEFAULT_PROTECT, keepTag: '#keep' })).toEqual({
      protected: true,
      reason: 'keepTag',
    });
  });

  it('protects manually pinned IDs', () => {
    const manual = makeItem({ id: 'keep-me-1' });
    expect(isProtected(manual, { ...DEFAULT_PROTECT, protectedIds: ['keep-me-1'] })).toEqual({
      protected: true,
      reason: 'manual',
    });
  });
});
