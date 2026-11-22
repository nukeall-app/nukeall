import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { clearItems, getAllItems, putItems, removeItems } from '../src/core/archive-db';
import {
  toCsvBackup,
  toDeletionReportHtml,
  toDeletionReportJson,
  toJsonBackup,
  toOfflineHtmlArchive,
} from '../src/core/exporter';
import type { ContentItem, JobState, ProgressEntry } from '../src/core/types';

const SAMPLE_ITEMS: ContentItem[] = [
  {
    id: '1',
    platform: 'x',
    type: 'post',
    text: 'Merhaba, "dünya"!\nSatır 2 <script>alert(1)</script>',
    createdAt: '2025-04-01T10:00:00.000Z',
    url: 'https://x.com/u/status/1',
    metrics: { likes: 4, reposts: 1 },
    media: false,
    pinned: false,
  },
];

describe('exporter & archive-db', () => {
  it('produces valid JSON and RFC 4180 CSV with UTF-8 BOM', () => {
    const json = JSON.parse(toJsonBackup(SAMPLE_ITEMS));
    expect(json.schema).toBe('nukeall-backup-v1');
    expect(json.count).toBe(1);

    const csv = toCsvBackup(SAMPLE_ITEMS);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Merhaba, ""dünya""!\nSatır 2 <script>alert(1)</script>"');
  });

  it('neutralizes CSV formula injection payloads while preserving numeric metrics', () => {
    const formulaItems: ContentItem[] = [
      { ...SAMPLE_ITEMS[0]!, id: 'f1', text: '=HYPERLINK("https://evil.test","click")' },
      { ...SAMPLE_ITEMS[0]!, id: 'f2', text: '+1+1' },
      { ...SAMPLE_ITEMS[0]!, id: 'f3', text: '-2+3' },
      { ...SAMPLE_ITEMS[0]!, id: 'f4', text: '@SUM(A1:A2)' },
      { ...SAMPLE_ITEMS[0]!, id: 'f5', text: '\t=CMD' },
    ];
    const csv = toCsvBackup(formulaItems);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("'+1+1");
    expect(csv).toContain("'-2+3");
    expect(csv).toContain("'@SUM(A1:A2)");
    expect(csv).toContain("'\t=CMD");
    expect(csv).toContain(',4,1,false,false,');
  });

  it('escapes script closing tags inside offline HTML archive', () => {
    const evil: ContentItem[] = [{ ...SAMPLE_ITEMS[0]!, text: '</script><script>alert(9)</script>' }];
    const html = toOfflineHtmlArchive(evil, { handle: 'alice', exportedAt: '2026-11-18' });
    expect(html).toContain('NukeAll Archive — @alice');
    expect(html).not.toContain('</script><script>alert(9)</script>');
    expect(html).toContain('\\u003c/script>');
  });

  it('generates HTML and JSON deletion reports', () => {
    const job: JobState = {
      jobId: 'job_1',
      platform: 'x',
      status: 'done',
      total: 1,
      done: 1,
      failed: 0,
      startedAt: '2026-11-18T10:00:00Z',
      finishedAt: '2026-11-18T10:01:00Z',
    };
    const log: ProgressEntry[] = [{ id: '1', ok: true, at: '2026-11-18T10:00:30Z' }];
    const html = toDeletionReportHtml(job, log, { '1': SAMPLE_ITEMS[0]! });
    expect(html).toContain('DELETED');
    expect(html).toContain('job_1');

    const rep = JSON.parse(toDeletionReportJson(job, log, { '1': SAMPLE_ITEMS[0]! }));
    expect(rep.schema).toBe('nukeall-report-v1');
    expect(rep.entries[0].item.id).toBe('1');
  });

  it('stores, queries and removes items in IndexedDB', async () => {
    await clearItems();
    await putItems(SAMPLE_ITEMS);
    const loaded = await getAllItems('x');
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe('1');

    await removeItems('x', ['1']);
    expect(await getAllItems('x')).toHaveLength(0);
  });
});
