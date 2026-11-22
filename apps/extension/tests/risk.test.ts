import { describe, expect, it } from 'vitest';
import { isValidLuhn, isValidTckn, scanItemRisks } from '../src/core/risk';
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
    expect(clean.some((h) => h.kind === 'profanity')).toBe(false);
  });

  it('flags email, phone and IBAN', () => {
    const hits = scanItemRisks(
      makeItem('Contact me at john.doe@example.com or +90 532 123 45 67, IBAN TR330006100519786457841326'),
    );
    const kinds = new Set(hits.map((h) => h.kind));
    expect(kinds.has('email')).toBe(true);
    expect(kinds.has('phone')).toBe(true);
    expect(kinds.has('iban')).toBe(true);
  });

  it('validates Turkish TCKN checksum accurately', () => {
    // Valid algorithmic test TCKN: 10000000146
    expect(isValidTckn('10000000146')).toBe(true);
    expect(isValidTckn('10000000147')).toBe(false);
    expect(isValidTckn('00000000146')).toBe(false);

    const validHits = scanItemRisks(makeItem('TC no: 10000000146'));
    expect(validHits.some((h) => h.kind === 'tckn')).toBe(true);

    const invalidHits = scanItemRisks(makeItem('Order ref: 10000000147'));
    expect(invalidHits.some((h) => h.kind === 'tckn')).toBe(false);
  });

  it('validates payment cards via Luhn check', () => {
    expect(isValidLuhn('4111 1111 1111 1111')).toBe(true);
    expect(isValidLuhn('4111 1111 1111 1112')).toBe(false);

    const hits = scanItemRisks(makeItem('Card: 4111-1111-1111-1111'));
    expect(hits.some((h) => h.kind === 'card')).toBe(true);
  });

  it('flags late night hours (01:00 - 04:59 local)', () => {
    const late = new Date(2025, 4, 1, 2, 30, 0).toISOString();
    const day = new Date(2025, 4, 1, 14, 30, 0).toISOString();
    expect(scanItemRisks(makeItem('Awake', late)).some((h) => h.kind === 'late_night')).toBe(true);
    expect(scanItemRisks(makeItem('Awake', day)).some((h) => h.kind === 'late_night')).toBe(false);
  });
});
