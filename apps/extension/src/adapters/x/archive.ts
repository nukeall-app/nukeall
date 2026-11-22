import type { ContentItem, ContentType } from '../../core/types';

interface RawTweetWrapper {
  tweet?: RawTweet;
}

interface RawTweet {
  id_str?: string;
  id?: string;
  full_text?: string;
  text?: string;
  created_at?: string;
  favorite_count?: string | number;
  retweet_count?: string | number;
  in_reply_to_status_id_str?: string | null;
  in_reply_to_status_id?: string | null;
  is_quote_status?: boolean;
  lang?: string;
  source?: string;
  entities?: { media?: unknown[] };
  extended_entities?: { media?: unknown[] };
}

interface RawLikeWrapper {
  like?: RawLike;
}

interface RawLike {
  tweetId?: string;
  fullText?: string;
  expandedUrl?: string;
}

function toIsoDate(raw?: string): string {
  if (!raw) return new Date(0).toISOString();
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? new Date(0).toISOString() : new Date(ms).toISOString();
}

function stripSourceTag(src?: string): string | undefined {
  if (!src) return undefined;
  return src.replace(/<[^>]+>/g, '').trim() || undefined;
}

function classifyTweet(t: RawTweet): ContentType {
  const txt = t.full_text ?? t.text ?? '';
  if (txt.startsWith('RT @')) return 'repost';
  if (t.in_reply_to_status_id_str || t.in_reply_to_status_id) return 'reply';
  if (t.is_quote_status) return 'quote';
  return 'post';
}

export function parseXArchiveText(rawText: string, defaultHandle = 'i'): ContentItem[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  // Strip `window.YTD.<kind>.partN = ` prefix if present
  const eqIdx = trimmed.indexOf('=');
  const looksLikeYtd = /^window\.YTD\./.test(trimmed) && eqIdx !== -1;
  const jsonPart = looksLikeYtd ? trimmed.slice(eqIdx + 1).trim().replace(/;$/, '') : trimmed;

  const parsed = JSON.parse(jsonPart) as Array<RawTweetWrapper & RawLikeWrapper & RawTweet>;
  if (!Array.isArray(parsed)) {
    throw new Error('Expected an array inside X archive file');
  }

  const handleClean = defaultHandle.replace(/^@/, '') || 'i';
  const out: ContentItem[] = [];

  for (const entry of parsed) {
    if (entry && entry.like && entry.like.tweetId) {
      const lk = entry.like;
      out.push({
        id: String(lk.tweetId),
        platform: 'x',
        type: 'like',
        text: lk.fullText ?? '',
        createdAt: new Date(0).toISOString(),
        url: lk.expandedUrl || `https://x.com/i/web/status/${lk.tweetId}`,
      });
      continue;
    }

    const tw: RawTweet | undefined = entry?.tweet ?? (entry?.id_str || entry?.id ? entry : undefined);
    if (!tw) continue;
    const id = String(tw.id_str ?? tw.id ?? '');
    if (!id) continue;

    const text = tw.full_text ?? tw.text ?? '';
    const likes = Number(tw.favorite_count ?? 0);
    const reposts = Number(tw.retweet_count ?? 0);
    const hasMedia = Boolean(
      (tw.extended_entities?.media && tw.extended_entities.media.length > 0) ||
        (tw.entities?.media && tw.entities.media.length > 0),
    );

    out.push({
      id,
      platform: 'x',
      type: classifyTweet(tw),
      text,
      createdAt: toIsoDate(tw.created_at),
      url: `https://x.com/${handleClean}/status/${id}`,
      metrics: {
        likes: Number.isFinite(likes) ? likes : 0,
        reposts: Number.isFinite(reposts) ? reposts : 0,
      },
      media: hasMedia,
      lang: tw.lang,
      source: stripSourceTag(tw.source),
    });
  }

  return out;
}
