import { describe, expect, it } from 'vitest';
import { scanItemRisks } from '../src/core/risk';
import type { ContentItem } from '../src/core/types';

function makeItem(text: string, createdAt = '2025-05-01T14:00:00.000Z'): ContentItem {
  return {
    id: 'r1',
    platform: 'x',
    type: 'post',
    text,
    createdAt,
    url: 'https://x.com/u/status/1',
  };
}

describe('scanItemRisks', () => {
  it('flags EN and TR profanity without false-positive substrings', () => {
    const hitsEn = scanItemRisks(makeItem('This is total bullshit!'));
    expect(hitsEn.some((h) => h.kind === 'profanity')).toBe(true);

    const hitsTr = scanItemRisks(makeItem('Bu ne saçma iş amk ya'));
    expect(hitsTr.some((h) => h.kind === 'profanity')).toBe(true);

    // Clean words containing letters like "mal" inside "normal" should not trigger
    const clean = scanItemRisks(makeItem('Her şey çok normal görünüyor'));
    expect(clean).toEqual([]);
  });

  it('supports optional custom keyword matching alongside profanity', () => {
    const hits = scanItemRisks(makeItem('Old awkward company mention'), ['company']);
    expect(hits).toEqual([{ kind: 'custom', match: 'company' }]);
  });

  it('does not flag emails, phone numbers, IBANs, numbers, or late-night timestamps', () => {
    const late = new Date(2025, 4, 1, 2, 30, 0).toISOString();
    const hits = scanItemRisks(
      makeItem(
        'Contact john.doe@example.com or +90 532 123 45 67, TR330006100519786457841326, 10000000146, 4111-1111-1111-1111',
        late,
      ),
    );
    expect(hits).toEqual([]);
  });
});
