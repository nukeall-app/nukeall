import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import { detectLinkedInHandleFromDom, parseVisibleLinkedInDom } from '../src/adapters/linkedin/api';
import { parseLinkedInCsvArchive } from '../src/adapters/linkedin/archive';
import {
  detectLinkedInHandleFromPath,
  linkedinUrnToIso,
  parseLinkedInRelativeDate,
  planLinkedInScanSteps,
} from '../src/adapters/linkedin/parser';
import { matchesFilter } from '../src/core/filters';
import { DEFAULT_FILTERS } from '../src/core/types';

describe('linkedin adapter', () => {
  it('detects handle and plans LinkedIn activity scan steps', () => {
    expect(detectLinkedInHandleFromPath('/in/efe-dev/recent-activity/all/')).toBe('efe-dev');
    expect(detectLinkedInHandleFromPath('/in/me/')).toBe('');
    expect(planLinkedInScanSteps('https://www.linkedin.com/in/efe-dev/', ['post', 'comment', 'like'])).toEqual([
      { url: 'https://www.linkedin.com/in/efe-dev/recent-activity/all/', type: 'post' },
      { url: 'https://www.linkedin.com/in/efe-dev/recent-activity/comments/', type: 'comment' },
      { url: 'https://www.linkedin.com/in/efe-dev/recent-activity/reactions/', type: 'like' },
    ]);
  });

  it('extracts exact UTC timestamps from 64-bit LinkedIn Snowflake URNs', () => {
    const targetMs = Date.UTC(2024, 2, 15, 10, 30, 0);
    const snowflakeId = (BigInt(targetMs) << 22n).toString();
    expect(linkedinUrnToIso(`urn:li:activity:${snowflakeId}`)).toBe('2024-03-15T10:30:00.000Z');
    expect(linkedinUrnToIso(`urn:li:ugcPost:${snowflakeId}`)).toBe('2024-03-15T10:30:00.000Z');
    expect(linkedinUrnToIso('urn:li:activity:12345')).toBeNull();
  });

  it('parses English and Turkish relative LinkedIn timestamps', () => {
    const now = new Date('2026-11-20T12:00:00.000Z');
    expect(parseLinkedInRelativeDate('just now', now)).toBe('2026-11-20T12:00:00.000Z');
    expect(parseLinkedInRelativeDate('2d • Edited', now)).toBe('2026-11-18T12:00:00.000Z');
    expect(parseLinkedInRelativeDate('3 ay • Düzenlendi', now)).toBe('2026-08-22T12:00:00.000Z');
    expect(parseLinkedInRelativeDate('1 yıl', now)).toBe('2025-11-20T12:00:00.000Z');
  });

  it('parses LinkedIn Shares.csv and Comments.csv archives with date filtering', () => {
    const oldTs = Date.UTC(2022, 0, 10, 9, 0, 0);
    const oldUrn = `urn:li:share:${(BigInt(oldTs) << 22n).toString()}`;
    const sharesCsv = [
      'Date,ShareLink,ShareCommentary,SharedUrl,MediaUrl,Visibility',
      `2022-01-10 09:00:00,https://www.linkedin.com/feed/update/${oldUrn}/,"Launching my old side project\nLine 2",https://example.com,,PUBLIC`,
      '2026-10-05 14:15:00,https://www.linkedin.com/feed/update/urn:li:activity:7400000000000000000/,"Recent 2026 update",,,CONNECTIONS',
    ].join('\n');

    const posts = parseLinkedInCsvArchive(sharesCsv, 'Shares.csv');
    expect(posts).toHaveLength(2);
    expect(posts[0]).toMatchObject({
      id: oldUrn,
      platform: 'linkedin',
      type: 'post',
      createdAt: '2022-01-10T09:00:00.000Z',
    });
    expect(posts[0]?.text).toContain('Launching my old side project');

    const oldOnly = posts.filter((p) =>
      matchesFilter(p, { ...DEFAULT_FILTERS, types: ['post'], to: '2023-12-31' }),
    );
    expect(oldOnly.map((p) => p.id)).toEqual([oldUrn]);

    const commentsCsv = [
      'Date,Link,Message',
      '2023-07-04 18:00:00,https://www.linkedin.com/feed/update/urn:li:activity:7100000000000000000/,"Great architectural breakdown!"',
    ].join('\n');
    const comments = parseLinkedInCsvArchive(commentsCsv, 'Comments.csv');
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      platform: 'linkedin',
      type: 'comment',
      text: 'Great architectural breakdown!',
    });
  });

  it('extracts handle and activity items from LinkedIn DOM cards', () => {
    const postMs = Date.UTC(2023, 8, 1, 15, 0, 0);
    const urn = `urn:li:activity:${(BigInt(postMs) << 22n).toString()}`;
    const { document: doc } = parseHTML(`
      <html><body>
        <nav><a class="global-nav__primary-link" href="/in/efe-privacy/">Profile</a></nav>
        <div class="feed-shared-update-v2" data-urn="${urn}">
          <div class="update-components-text"><span class="break-words">Old post about cloud migrations</span></div>
          <img class="update-components-image__image" src="/media.jpg" />
        </div>
      </body></html>
    `);

    const domDoc = doc as unknown as Document;
    expect(detectLinkedInHandleFromDom(domDoc, '/feed/')).toBe('efe-privacy');

    const parsed = parseVisibleLinkedInDom(domDoc, 'post');
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      id: urn,
      platform: 'linkedin',
      type: 'post',
      text: 'Old post about cloud migrations',
      createdAt: '2023-09-01T15:00:00.000Z',
      media: true,
      url: `https://www.linkedin.com/feed/update/${urn}/`,
    });
  });
});
