import type { ContentItem, ContentType } from '../../core/types';

export interface InstagramScanStep {
  url: string;
  type: 'comment' | 'like' | 'post' | 'message';
}

export function planInstagramScanSteps(selectedTypes: ContentType[]): InstagramScanStep[] {
  const steps: InstagramScanStep[] = [];
  if (selectedTypes.includes('comment')) {
    steps.push({
      url: 'https://www.instagram.com/your_activity/interactions/comments',
      type: 'comment',
    });
  }
  if (selectedTypes.includes('like')) {
    steps.push({
      url: 'https://www.instagram.com/your_activity/interactions/likes',
      type: 'like',
    });
  }
  if (selectedTypes.includes('post')) {
    steps.push({
      url: 'https://www.instagram.com/your_activity/photos_and_videos/posts',
      type: 'post',
    });
  }
  if (selectedTypes.includes('message')) {
    steps.push({
      url: 'https://www.instagram.com/direct/inbox/',
      type: 'message',
    });
  }
  return steps;
}

const IG_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * Converts an Instagram post/reel shortcode (from /p/<code>/ or /reel/<code>/)
 * into its numeric Instagram media ID using BigInt base-64 decoding.
 */
export function shortcodeToMediaId(shortcode: string): string {
  const clean = shortcode.trim().split('/')[0] ?? '';
  if (!clean || clean.length > 20) return '';
  let id = 0n;
  for (const ch of clean) {
    const idx = IG_ALPHABET.indexOf(ch);
    if (idx === -1) return '';
    id = id * 64n + BigInt(idx);
  }
  return id > 0n ? id.toString() : '';
}

/**
 * Meta's official JSON data downloads store UTF-8 bytes as Latin-1 escaped strings
 * (e.g. "T\u00c3\u00bcrk\u00c3\u00a7e"). This restores proper UTF-8 characters.
 */
export function fixMetaEncoding(input: string): string {
  if (!input || !/[\u0080-\u00ff]/.test(input)) return input;
  try {
    const bytes = new Uint8Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const code = input.charCodeAt(i);
      if (code > 255) return input; // already proper Unicode
      bytes[i] = code;
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return input;
  }
}

export interface CapturedIgItem {
  id: string;
  mediaId?: string;
  threadId?: string;
  itemId?: string;
  code?: string;
  type: 'comment' | 'like' | 'post' | 'message';
  text: string;
  createdAt: string;
  likes?: number;
}

function tsToIso(ts: unknown): string {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return new Date(0).toISOString();
  // Instagram timestamps may be in microseconds (1e15+), milliseconds (1e12+), or seconds
  const ms = n > 1e15 ? Math.floor(n / 1000) : n > 1e12 ? n : n * 1000;
  return new Date(ms).toISOString();
}

type AnyObj = Record<string, any>;

/**
 * Recursively extracts comment/media/direct-message objects from Instagram
 * web/GraphQL/Bloks/Direct responses captured passively while the user scrolls.
 */
export function extractCapturedIgItems(
  json: unknown,
  hintType: 'comment' | 'like' | 'post' | 'message',
  ownerUserId?: string,
): CapturedIgItem[] {
  const out: CapturedIgItem[] = [];
  const seen = new Set<string>();

  const add = (item: CapturedIgItem) => {
    const key = `${item.type}:${item.id}`;
    if (!item.id || seen.has(key)) return;
    seen.add(key);
    out.push(item);
  };

  const visit = (node: unknown, depth: number, inheritedThreadId?: string) => {
    if (!node || depth > 40) return;
    if (typeof node === 'string') {
      // Bloks responses embed comment/media IDs inside payload strings
      if (hintType === 'comment' && node.includes('comment_id') && node.includes('media_id')) {
        const re = /"comment_id"\s*:\s*"?(\d+)"?[^}]{0,300}"media_id"\s*:\s*"?(\d+)"?/g;
        for (const m of node.matchAll(re)) {
          if (m[1] && m[2]) {
            add({
              id: m[1],
              mediaId: m[2],
              type: 'comment',
              text: '',
              createdAt: new Date(0).toISOString(),
            });
          }
        }
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const el of node) visit(el, depth + 1, inheritedThreadId);
      return;
    }
    if (typeof node !== 'object') return;

    const obj = node as AnyObj;
    const threadId =
      typeof obj.thread_id === 'string' && obj.thread_id
        ? obj.thread_id
        : typeof obj.thread_v2_id === 'string' && obj.thread_v2_id
          ? obj.thread_v2_id
          : inheritedThreadId;

    // Direct Message item shape: { item_id, user_id, timestamp, text / item_type }
    if (hintType === 'message' && obj.item_id && obj.user_id != null) {
      const senderId = String(obj.user_id);
      if (ownerUserId && senderId === ownerUserId) {
        const rawItemId = String(obj.item_id);
        const msgText =
          typeof obj.text === 'string' && obj.text.trim()
            ? obj.text.trim()
            : typeof obj.link?.text === 'string'
              ? obj.link.text
              : typeof obj.item_type === 'string'
                ? `[${obj.item_type}]`
                : '[Message]';
        add({
          id: rawItemId,
          itemId: rawItemId,
          threadId,
          type: 'message',
          text: msgText,
          createdAt: tsToIso(obj.timestamp ?? obj.timestamp_ms),
        });
      }
    }

    // Comment shape: { pk / comment_id, text, media_id, created_at }
    const commentId = obj.comment_id ?? (hintType === 'comment' && typeof obj.text === 'string' ? obj.pk : undefined);
    const mediaId = obj.media_id ?? obj.media?.pk ?? obj.media?.id;
    if (commentId && /^\d+$/.test(String(commentId)) && (hintType === 'comment' || obj.comment_id)) {
      const cleanMediaId = mediaId ? String(mediaId).split('_')[0] : undefined;
      add({
        id: String(commentId),
        mediaId: cleanMediaId,
        code: typeof obj.media?.code === 'string' ? obj.media.code : undefined,
        type: 'comment',
        text: typeof obj.text === 'string' ? obj.text : '',
        createdAt: tsToIso(obj.created_at_utc ?? obj.created_at),
        likes: Number(obj.comment_like_count ?? 0) || 0,
      });
    }

    // Media shape (posts or likes): { pk / id, code, taken_at, caption }
    if ((hintType === 'post' || hintType === 'like') && (obj.code || obj.shortcode) && (obj.pk || obj.id)) {
      const rawId = String(obj.pk ?? obj.id).split('_')[0] ?? '';
      if (/^\d+$/.test(rawId)) {
        const code = String(obj.code ?? obj.shortcode ?? '');
        const caption =
          typeof obj.caption?.text === 'string'
            ? obj.caption.text
            : typeof obj.edge_media_to_caption?.edges?.[0]?.node?.text === 'string'
              ? obj.edge_media_to_caption.edges[0].node.text
              : '';
        add({
          id: rawId,
          mediaId: rawId,
          code,
          type: hintType,
          text: caption,
          createdAt: tsToIso(obj.taken_at ?? obj.taken_at_timestamp),
          likes: Number(obj.like_count ?? obj.edge_liked_by?.count ?? 0) || 0,
        });
      }
    }

    for (const v of Object.values(obj)) visit(v, depth + 1, threadId);
  };

  visit(json, 0);
  return out;
}

export function capturedToContentItems(items: CapturedIgItem[]): ContentItem[] {
  return items.map((it) => ({
    id: it.id,
    platform: 'instagram',
    type: it.type,
    text: it.text,
    createdAt: it.createdAt,
    url:
      it.type === 'message'
        ? it.threadId
          ? `https://www.instagram.com/direct/t/${it.threadId}/`
          : 'https://www.instagram.com/direct/inbox/'
        : it.code
          ? `https://www.instagram.com/p/${it.code}/`
          : 'https://www.instagram.com/your_activity/',
    metrics: { likes: it.likes ?? 0 },
    media: it.type === 'post' || it.type === 'like',
    meta: {
      mediaId: it.mediaId,
      threadId: it.threadId,
      itemId: it.itemId,
      code: it.code,
    },
  }));
}
