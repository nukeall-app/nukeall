// Parses X (Twitter) web-client GraphQL timeline responses that the page itself
// already downloads while the user scrolls. No extra network requests are made.
import type { ContentItem, ContentType } from '../../core/types';

export type XTimelineKind = 'tweets' | 'likes' | 'bookmarks';

export const OP_KIND: Record<string, XTimelineKind> = {
  UserTweets: 'tweets',
  UserTweetsAndReplies: 'tweets',
  Likes: 'likes',
  Bookmarks: 'bookmarks',
};

export interface RawXTweet {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  authorHandle: string;
  replyTo?: string;
  retweetOf?: string;
  isQuote: boolean;
  likes: number;
  reposts: number;
  media: boolean;
  pinned: boolean;
  lang?: string;
  source?: string;
}

export function opFromUrl(url: string): string | null {
  const m = url.match(/\/i\/api\/graphql\/[^/]+\/([A-Za-z]+)/);
  return m?.[1] ?? null;
}

type AnyObj = Record<string, any>;

function unwrap(result: AnyObj | undefined | null): AnyObj | null {
  if (!result || typeof result !== 'object') return null;
  if (result.__typename === 'TweetWithVisibilityResults' && result.tweet) return result.tweet;
  if (!result.legacy && result.tweet) return result.tweet;
  return result;
}

function toIso(raw?: string): string {
  if (!raw) return new Date(0).toISOString();
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? new Date(0).toISOString() : new Date(ms).toISOString();
}

function parseTweetResult(itemContent: AnyObj): RawXTweet | null {
  const r = unwrap(itemContent.tweet_results?.result);
  const legacy = r?.legacy;
  if (!r || !legacy) return null;
  const id = String(r.rest_id ?? legacy.id_str ?? '');
  if (!id) return null;
  const user = unwrap(r.core?.user_results?.result);
  const authorHandle = String(user?.core?.screen_name ?? user?.legacy?.screen_name ?? '');
  const authorId = String(legacy.user_id_str ?? user?.rest_id ?? '');
  const text = String(r.note_tweet?.note_tweet_results?.result?.text ?? legacy.full_text ?? '');
  const retweeted = unwrap(legacy.retweeted_status_result?.result);
  return {
    id,
    text,
    createdAt: toIso(legacy.created_at),
    authorId,
    authorHandle,
    replyTo: legacy.in_reply_to_status_id_str || undefined,
    retweetOf: retweeted?.rest_id ? String(retweeted.rest_id) : undefined,
    isQuote: Boolean(legacy.is_quote_status),
    likes: Number(legacy.favorite_count ?? 0) || 0,
    reposts: Number(legacy.retweet_count ?? 0) || 0,
    media: Boolean(legacy.extended_entities?.media?.length || legacy.entities?.media?.length),
    pinned: itemContent.socialContext?.contextType === 'Pin',
    lang: legacy.lang,
    source: typeof r.source === 'string' ? r.source.replace(/<[^>]+>/g, '').trim() || undefined : undefined,
  };
}

/** Extracts only top-level timeline tweets (not nested quoted/retweeted tweets). */
export function extractTimelineTweets(json: unknown): RawXTweet[] {
  const out: RawXTweet[] = [];
  const seen = new Set<string>();
  const visit = (node: unknown, depth: number) => {
    if (!node || typeof node !== 'object' || depth > 60) return;
    if (Array.isArray(node)) {
      for (const n of node) visit(n, depth + 1);
      return;
    }
    const obj = node as AnyObj;
    if (obj.itemType === 'TimelineTweet' && obj.tweet_results) {
      const t = parseTweetResult(obj);
      if (t && !seen.has(t.id)) {
        seen.add(t.id);
        out.push(t);
      }
      return;
    }
    for (const v of Object.values(obj)) visit(v, depth + 1);
  };
  visit(json, 0);
  return out;
}

export interface XMe {
  id: string;
  handle: string;
}

function isMine(t: RawXTweet, me: XMe): boolean {
  if (me.id && t.authorId) return t.authorId === me.id;
  if (me.handle && t.authorHandle) return t.authorHandle.toLowerCase() === me.handle.toLowerCase();
  return false;
}

export function classifyOwnTweet(t: RawXTweet): ContentType {
  if (t.retweetOf) return 'repost';
  if (t.replyTo) return 'reply';
  if (t.isQuote) return 'quote';
  return 'post';
}

export function rawToContentItems(raws: RawXTweet[], kind: XTimelineKind, me: XMe): ContentItem[] {
  const out: ContentItem[] = [];
  for (const t of raws) {
    let type: ContentType;
    if (kind === 'likes') type = 'like';
    else if (kind === 'bookmarks') type = 'bookmark';
    else {
      // Profile timelines also contain other people's parent tweets of a conversation: skip them.
      if (!isMine(t, me)) continue;
      type = classifyOwnTweet(t);
    }
    out.push({
      id: t.id,
      platform: 'x',
      type,
      text: t.text,
      createdAt: t.createdAt,
      url: `https://x.com/${t.authorHandle || 'i'}/status/${t.id}`,
      metrics: { likes: t.likes, reposts: t.reposts },
      media: t.media,
      pinned: kind === 'tweets' ? t.pinned : false,
      lang: t.lang,
      source: t.source,
      targetId: t.retweetOf,
    });
  }
  return out;
}

export interface XScanStep {
  url: string;
  kind: XTimelineKind;
  types: ContentType[];
}

/**
 * Plans which X pages to visit based on the content types the user selected.
 * E.g. selecting Replies navigates to /<handle>/with_replies automatically.
 */
export function planXScanSteps(handle: string, selectedTypes: ContentType[]): XScanStep[] {
  const clean = handle.replace(/^@/, '').trim();
  const steps: XScanStep[] = [];
  const tweetTypes = selectedTypes.filter(
    (t) => t === 'post' || t === 'reply' || t === 'repost' || t === 'quote',
  );
  if (tweetTypes.length > 0 && clean) {
    const needsReplies = tweetTypes.includes('reply');
    steps.push({
      url: needsReplies ? `https://x.com/${clean}/with_replies` : `https://x.com/${clean}`,
      kind: 'tweets',
      types: tweetTypes,
    });
  }
  if (selectedTypes.includes('like') && clean) {
    steps.push({
      url: `https://x.com/${clean}/likes`,
      kind: 'likes',
      types: ['like'],
    });
  }
  if (selectedTypes.includes('bookmark')) {
    steps.push({
      url: 'https://x.com/i/bookmarks',
      kind: 'bookmarks',
      types: ['bookmark'],
    });
  }
  return steps;
}
