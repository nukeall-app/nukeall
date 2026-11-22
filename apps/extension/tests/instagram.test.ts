import { describe, expect, it, vi } from 'vitest';
import { deleteInstagramItem } from '../src/adapters/instagram/api';
import { parseInstagramArchiveJson } from '../src/adapters/instagram/archive';
import {
  extractCapturedIgItems,
  fixMetaEncoding,
  planInstagramScanSteps,
  shortcodeToMediaId,
} from '../src/adapters/instagram/parser';

describe('instagram adapter', () => {
  it('plans Your Activity navigation URLs per content type', () => {
    expect(planInstagramScanSteps(['comment'])).toEqual([
      { url: 'https://www.instagram.com/your_activity/interactions/comments', type: 'comment' },
    ]);
    expect(planInstagramScanSteps(['like'])).toEqual([
      { url: 'https://www.instagram.com/your_activity/interactions/likes', type: 'like' },
    ]);
    expect(planInstagramScanSteps(['post'])).toEqual([
      { url: 'https://www.instagram.com/your_activity/photos_and_videos/posts', type: 'post' },
    ]);
    expect(planInstagramScanSteps(['message'])).toEqual([
      { url: 'https://www.instagram.com/direct/inbox/', type: 'message' },
    ]);
  });

  it('decodes Instagram shortcodes into numeric media IDs', () => {
    // Known conversion: "B" -> 1, "BA" -> 64
    expect(shortcodeToMediaId('B')).toBe('1');
    expect(shortcodeToMediaId('BA')).toBe('64');
    // Standard 11-char shortcode
    expect(/^\d+$/.test(shortcodeToMediaId('CxYz123AbCd'))).toBe(true);
    expect(shortcodeToMediaId('invalid$code')).toBe('');
  });

  it('fixes Meta Latin-1 mojibake into proper UTF-8 Turkish text', () => {
    const garbled = 'T\u00c3\u00bcrk\u00c3\u00a7e \u00c5\u009feyler \u00c4\u00b1\u00c4\u009f\u00c3\u00bc\u00c3\u00b6';
    expect(fixMetaEncoding(garbled)).toBe('Türkçe şeyler ığüö');
    expect(fixMetaEncoding('Normal ASCII text')).toBe('Normal ASCII text');
  });

  it('extracts comments and media from captured Instagram payloads', () => {
    const commentPayload = {
      data: {
        items: [
          {
            comment_id: '17999111222333',
            media_id: '33000111222_999',
            text: 'Nice photo!',
            created_at_utc: 1700000000,
          },
        ],
      },
    };
    const comments = extractCapturedIgItems(commentPayload, 'comment');
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      id: '17999111222333',
      mediaId: '33000111222',
      type: 'comment',
      text: 'Nice photo!',
    });

    const likePayload = {
      items: [
        {
          pk: '33111222333',
          code: 'CxYz123AbCd',
          taken_at: 1700001000,
          like_count: 88,
          caption: { text: 'Sunset' },
        },
      ],
    };
    const likes = extractCapturedIgItems(likePayload, 'like');
    expect(likes).toHaveLength(1);
    expect(likes[0]).toMatchObject({
      id: '33111222333',
      code: 'CxYz123AbCd',
      type: 'like',
      text: 'Sunset',
    });
  });

  it('parses Instagram official JSON data exports (comments, likes, posts)', () => {
    const commentsJson = JSON.stringify([
      {
        string_map_data: {
          Comment: { value: 'Harika olmu\u00c5\u009f!' },
          'Media Owner': { value: 'friend_user' },
          Time: { timestamp: 1700000000 },
        },
      },
    ]);
    const comments = parseInstagramArchiveJson(commentsJson);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      platform: 'instagram',
      type: 'comment',
      text: 'Harika olmuş!',
      source: '@friend_user',
    });

    const likesJson = JSON.stringify({
      likes_media_likes: [
        {
          title: 'creator_acc',
          string_list_data: [
            { href: 'https://www.instagram.com/p/BA/', value: '👍', timestamp: 1700000100 },
          ],
        },
      ],
    });
    const likes = parseInstagramArchiveJson(likesJson);
    expect(likes).toHaveLength(1);
    expect(likes[0]).toMatchObject({
      id: '64',
      type: 'like',
      meta: { mediaId: '64', code: 'BA' },
    });

    const dmExport = JSON.stringify({
      participants: [{ name: 'Alice' }, { name: 'Bob' }],
      messages: [
        {
          sender_name: 'Alice',
          timestamp_ms: 1700000200000,
          content: 'Merhaba g\u00c3\u00bcnayd\u00c4\u00b1n!',
        },
      ],
    });
    const dms = parseInstagramArchiveJson(dmExport);
    expect(dms).toHaveLength(1);
    expect(dms[0]).toMatchObject({
      platform: 'instagram',
      type: 'message',
      text: 'Merhaba günaydın!',
      source: 'Alice',
    });
  });

  it('extracts ONLY the logged-in user direct messages from captured direct_v2 payloads', () => {
    const dmPayload = {
      thread: {
        thread_id: '340282366841710300949128',
        items: [
          {
            item_id: '31313131313131',
            user_id: '111222333',
            timestamp: '1700000000000000',
            text: 'My own sent DM',
          },
          {
            item_id: '41414141414141',
            user_id: '999888777',
            timestamp: '1700000005000000',
            text: 'Other person message — must be ignored',
          },
        ],
      },
    };

    const msgs = extractCapturedIgItems(dmPayload, 'message', '111222333');
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toMatchObject({
      id: '31313131313131',
      itemId: '31313131313131',
      threadId: '340282366841710300949128',
      type: 'message',
      text: 'My own sent DM',
    });
  });

  it('rejects non-numeric path-traversal IDs in Instagram API deletion', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('document', { cookie: 'csrftoken=tok123' });
    vi.stubGlobal('location', { origin: 'https://www.instagram.com', pathname: '/direct/inbox/' });

    try {
      const evilLike = await deleteInstagramItem({
        id: '123',
        platform: 'instagram',
        type: 'like',
        text: 'bad',
        createdAt: '2026-01-01T00:00:00.000Z',
        url: 'https://www.instagram.com/',
        meta: { mediaId: '../../accounts/logout' },
      });
      expect(evilLike.ok).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();

      const evilDm = await deleteInstagramItem({
        id: '456',
        platform: 'instagram',
        type: 'message',
        text: 'bad dm',
        createdAt: '2026-01-01T00:00:00.000Z',
        url: 'https://www.instagram.com/direct/inbox/',
        meta: { threadId: '../accounts/logout', itemId: '456' },
      });
      expect(evilDm.ok).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    }
  });
});
