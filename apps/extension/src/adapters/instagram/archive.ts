import type { ContentItem } from '../../core/types';
import { fixMetaEncoding, shortcodeToMediaId } from './parser';

type AnyObj = Record<string, any>;

function tsToIso(ts: unknown): string {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return new Date(0).toISOString();
  return new Date(n > 1e12 ? n : n * 1000).toISOString();
}

function extractShortcodeFromUrl(href?: string): string {
  if (!href) return '';
  const m = href.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m?.[1] ?? '';
}

/**
 * Parses official Instagram JSON data-export files:
 * - `post_comments_1.json` / `reels_comments.json`
 * - `liked_posts.json`
 * - `posts_1.json`
 * - `message_1.json` (Direct messages)
 */
export function parseInstagramArchiveJson(rawText: string): ContentItem[] {
  const parsed = JSON.parse(rawText) as AnyObj | AnyObj[];
  const out: ContentItem[] = [];

  // Case 0: Direct messages (message_1.json) -> { participants: [...], messages: [{ sender_name, timestamp_ms, content }] }
  if (!Array.isArray(parsed) && Array.isArray(parsed.messages)) {
    let idx = 0;
    for (const msg of parsed.messages as AnyObj[]) {
      idx++;
      const sender = fixMetaEncoding(String(msg.sender_name ?? ''));
      const content = fixMetaEncoding(
        String(msg.content ?? (Array.isArray(msg.photos) ? '[Photo]' : Array.isArray(msg.videos) ? '[Video]' : '[Message]')),
      );
      const ts = msg.timestamp_ms ?? msg.timestamp;
      out.push({
        id: `ig_dm_${ts ?? idx}_${idx}`,
        platform: 'instagram',
        type: 'message',
        text: content,
        createdAt: tsToIso(ts),
        url: 'https://www.instagram.com/direct/inbox/',
        source: sender || undefined,
        meta: { archiveOnly: true, sender: sender || undefined },
      });
    }
    return out;
  }

  // Case 1: liked_posts.json -> { likes_media_likes: [ { title, string_list_data: [{ href, value, timestamp }] } ] }
  if (!Array.isArray(parsed) && Array.isArray(parsed.likes_media_likes)) {
    let idx = 0;
    for (const entry of parsed.likes_media_likes as AnyObj[]) {
      const list = Array.isArray(entry.string_list_data) ? entry.string_list_data : [];
      for (const s of list) {
        idx++;
        const href = String(s.href ?? '');
        const code = extractShortcodeFromUrl(href);
        const mediaId = code ? shortcodeToMediaId(code) : '';
        const owner = fixMetaEncoding(String(entry.title ?? ''));
        out.push({
          id: mediaId || `ig_like_${s.timestamp ?? idx}_${idx}`,
          platform: 'instagram',
          type: 'like',
          text: owner ? `Liked post by @${owner}` : 'Liked post',
          createdAt: tsToIso(s.timestamp),
          url: href || 'https://www.instagram.com/your_activity/interactions/likes',
          media: true,
          meta: { mediaId: mediaId || undefined, code: code || undefined },
        });
      }
    }
    return out;
  }

  // Case 2: reels_comments.json -> { comments_reels_comments: [...] }
  const arr: AnyObj[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.comments_reels_comments)
      ? parsed.comments_reels_comments
      : Array.isArray(parsed.comments_media_comments)
        ? parsed.comments_media_comments
        : [];

  if (arr.length === 0) {
    throw new Error('Unrecognized Instagram JSON archive structure');
  }

  let idx = 0;
  for (const entry of arr) {
    idx++;
    // Comment format: { string_map_data: { Comment: { value }, "Media Owner": { value }, Time: { timestamp } } }
    if (entry.string_map_data && (entry.string_map_data.Comment || entry.string_map_data.Yorum)) {
      const map = entry.string_map_data;
      const commentVal = fixMetaEncoding(String(map.Comment?.value ?? map.Yorum?.value ?? ''));
      const owner = fixMetaEncoding(String(map['Media Owner']?.value ?? ''));
      const ts = map.Time?.timestamp ?? map.Zaman?.timestamp;
      out.push({
        id: `ig_comment_${ts ?? idx}_${idx}`,
        platform: 'instagram',
        type: 'comment',
        text: commentVal,
        createdAt: tsToIso(ts),
        url: 'https://www.instagram.com/your_activity/interactions/comments',
        source: owner ? `@${owner}` : undefined,
        meta: { archiveOnly: true, owner: owner || undefined },
      });
      continue;
    }

    // Post format (posts_1.json): { media: [ { title, creation_timestamp, uri } ] } or flat { title, creation_timestamp }
    const mediaList: AnyObj[] = Array.isArray(entry.media) ? entry.media : [entry];
    const first = mediaList[0];
    if (first && (typeof first.creation_timestamp === 'number' || typeof first.title === 'string')) {
      const ts = first.creation_timestamp ?? entry.creation_timestamp;
      const caption = fixMetaEncoding(String(entry.title ?? first.title ?? ''));
      out.push({
        id: `ig_post_${ts ?? idx}_${idx}`,
        platform: 'instagram',
        type: 'post',
        text: caption,
        createdAt: tsToIso(ts),
        url: 'https://www.instagram.com/your_activity/photos_and_videos/posts',
        media: true,
        meta: { archiveOnly: true },
      });
    }
  }

  return out;
}
