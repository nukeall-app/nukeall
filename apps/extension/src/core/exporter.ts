import type { ContentItem, JobState, ProgressEntry } from './types';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function csvCell(value: unknown): string {
  if (value == null) return '';
  let str = String(value);
  // Prevent CSV formula injection in spreadsheet apps when opening backups containing 3rd-party text.
  if (typeof value === 'string' && /^[\t\r\n ]*[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toJsonBackup(items: ContentItem[]): string {
  return JSON.stringify(
    {
      schema: 'nukeall-backup-v1',
      exportedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    null,
    2,
  );
}

export function toCsvBackup(items: ContentItem[]): string {
  const header = ['id', 'platform', 'type', 'createdAt', 'text', 'likes', 'reposts', 'media', 'pinned', 'url'].join(
    ',',
  );
  const rows = items.map((item) =>
    [
      csvCell(item.id),
      csvCell(item.platform),
      csvCell(item.type),
      csvCell(item.createdAt),
      csvCell(item.text),
      csvCell(item.metrics?.likes ?? 0),
      csvCell(item.metrics?.reposts ?? 0),
      csvCell(Boolean(item.media)),
      csvCell(Boolean(item.pinned)),
      csvCell(item.url),
    ].join(','),
  );
  // Prepend UTF-8 BOM so Excel parses Turkish characters cleanly.
  return `\uFEFF${[header, ...rows].join('\r\n')}`;
}

export function toOfflineHtmlArchive(
  items: ContentItem[],
  meta: { handle?: string; exportedAt: string },
): string {
  // Escape closing script tags and JS line/paragraph separators inside JSON payload safely
  const safeJson = JSON.stringify(items)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  const title = meta.handle ? `NukeAll Archive — @${escapeHtml(meta.handle)}` : 'NukeAll Offline Archive';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
  :root { color-scheme: dark; --bg:#09090b; --card:#18181b; --bd:#27272a; --fg:#f4f4f5; --muted:#a1a1aa; --acc:#f97316; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui,-apple-system,Segoe UI,Roboto,sans-serif; background:var(--bg); color:var(--fg); line-height:1.5; }
  .wrap { max-width: 880px; margin: 0 auto; padding: 24px 16px 64px; }
  header { border-bottom:1px solid var(--bd); padding-bottom:16px; margin-bottom:20px; }
  h1 { margin:0 0 6px; font-size:22px; }
  .meta { color:var(--muted); font-size:13px; }
  .bar { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px; }
  input, select { background:var(--card); border:1px solid var(--bd); color:var(--fg); padding:8px 12px; border-radius:8px; font-size:14px; }
  input { flex:1; min-width:200px; }
  .card { background:var(--card); border:1px solid var(--bd); border-radius:10px; padding:14px; margin-bottom:12px; }
  .head { display:flex; justify-content:space-between; gap:8px; font-size:12px; color:var(--muted); margin-bottom:6px; }
  .badge { background:#27272a; color:var(--acc); padding:2px 8px; border-radius:999px; font-weight:600; text-transform:uppercase; font-size:11px; }
  .txt { white-space:pre-wrap; word-break:break-word; margin:0 0 8px; font-size:14px; }
  a { color:var(--acc); text-decoration:none; }
  a:hover { text-decoration:underline; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>${title}</h1>
    <div class="meta">Exported: ${escapeHtml(meta.exportedAt)} · Total items: ${items.length} · 100% offline archive</div>
  </header>
  <div class="bar">
    <input id="q" type="search" placeholder="Search text..." aria-label="Search text" />
    <select id="type" aria-label="Filter by type">
      <option value="">All types</option>
      <option value="post">Post</option>
      <option value="reply">Reply</option>
      <option value="repost">Repost</option>
      <option value="quote">Quote</option>
      <option value="like">Like</option>
      <option value="comment">Comment</option>
      <option value="message">Message</option>
    </select>
    <span id="count" class="meta" style="align-self:center"></span>
  </div>
  <div id="list"></div>
</div>
<script>
const ITEMS = ${safeJson};
const list = document.getElementById('list');
const qEl = document.getElementById('q');
const typeEl = document.getElementById('type');
const countEl = document.getElementById('count');
function esc(s) {
  return String(s);
}
function render() {
  const q = qEl.value.trim().toLowerCase();
  const tp = typeEl.value;
  const filtered = ITEMS.filter(it => (!tp || it.type === tp) && (!q || (it.text||'').toLowerCase().includes(q)));
  countEl.textContent = filtered.length + ' / ' + ITEMS.length;
  list.replaceChildren();
  const frag = document.createDocumentFragment();
  for (const it of filtered.slice(0, 2000)) {
    const card = document.createElement('article');
    card.className = 'card';
    const head = document.createElement('div');
    head.className = 'head';
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = it.platform + ' · ' + it.type;
    const dt = document.createElement('span');
    dt.textContent = esc(it.createdAt);
    head.append(badge, dt);
    const p = document.createElement('p');
    p.className = 'txt';
    p.textContent = esc(it.text || '(no text)');
    const foot = document.createElement('div');
    foot.className = 'head';
    const likes = document.createElement('span');
    likes.textContent = 'Likes: ' + ((it.metrics && it.metrics.likes) || 0);
    foot.append(likes);
    if (it.url && /^https?:\/\//i.test(it.url)) {
      const a = document.createElement('a');
      a.href = it.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Source link';
      foot.append(a);
    }
    card.append(head, p, foot);
    frag.append(card);
  }
  list.append(frag);
}
qEl.addEventListener('input', render);
typeEl.addEventListener('change', render);
render();
</script>
</body>
</html>`;
}

export function toDeletionReportJson(
  job: JobState,
  log: ProgressEntry[],
  itemsById: Record<string, ContentItem>,
): string {
  return JSON.stringify(
    {
      schema: 'nukeall-report-v1',
      job,
      entries: log.map((entry) => {
        const item = itemsById[entry.id];
        return {
          ...entry,
          item: item
            ? {
                id: item.id,
                type: item.type,
                createdAt: item.createdAt,
                textPreview: item.text.slice(0, 140),
                url: item.url,
              }
            : undefined,
        };
      }),
    },
    null,
    2,
  );
}

export function toDeletionReportHtml(
  job: JobState,
  log: ProgressEntry[],
  itemsById: Record<string, ContentItem>,
): string {
  const rows = log
    .map((entry) => {
      const item = itemsById[entry.id];
      const status = entry.ok ? 'DELETED' : `FAILED: ${entry.error ?? 'unknown'}`;
      return `<tr>
        <td>${escapeHtml(entry.at)}</td>
        <td><code>${escapeHtml(entry.id)}</code></td>
        <td>${escapeHtml(item?.type ?? '-')}</td>
        <td>${escapeHtml((item?.text ?? '').slice(0, 120))}</td>
        <td class="${entry.ok ? 'ok' : 'err'}">${escapeHtml(status)}</td>
      </tr>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>NukeAll Deletion Report — ${escapeHtml(job.jobId)}</title>
<style>
  body { font-family: system-ui,-apple-system,sans-serif; background:#09090b; color:#f4f4f5; padding:24px; max-width:1000px; margin:0 auto; }
  h1 { margin:0 0 8px; }
  .summary { display:flex; gap:16px; flex-wrap:wrap; margin:16px 0 24px; padding:12px 16px; background:#18181b; border:1px solid #27272a; border-radius:10px; font-size:14px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th, td { text-align:left; padding:8px 10px; border-bottom:1px solid #27272a; vertical-align:top; }
  th { color:#a1a1aa; font-weight:600; }
  .ok { color:#4ade80; font-weight:600; }
  .err { color:#f87171; font-weight:600; }
</style>
</head>
<body>
  <h1>NukeAll Deletion Report</h1>
  <div class="summary">
    <span><strong>Job:</strong> ${escapeHtml(job.jobId)}</span>
    <span><strong>Platform:</strong> ${escapeHtml(job.platform)}</span>
    <span><strong>Status:</strong> ${escapeHtml(job.status)}</span>
    <span><strong>Deleted:</strong> ${job.done} / ${job.total}</span>
    <span><strong>Failed:</strong> ${job.failed}</span>
    <span><strong>Started:</strong> ${escapeHtml(job.startedAt)}</span>
    <span><strong>Finished:</strong> ${escapeHtml(job.finishedAt ?? '-')}</span>
  </div>
  <table>
    <thead><tr><th>Timestamp</th><th>ID</th><th>Type</th><th>Preview</th><th>Result</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}
