import { describe, expect, it } from 'vitest';
import { parseXArchiveText } from '../src/adapters/x/archive';

describe('parseXArchiveText', () => {
  it('parses window.YTD.tweets.part0 tweets, replies and reposts', () => {
    const sample = `window.YTD.tweets.part0 = [
      {
        "tweet": {
          "id_str": "1001",
          "full_text": "Original post with photo",
          "created_at": "Wed Oct 10 20:19:24 +0000 2018",
          "favorite_count": "12",
          "retweet_count": "3",
          "lang": "en",
          "source": "<a href=\\"https://mobile.twitter.com\\">Twitter Web App</a>",
          "extended_entities": { "media": [{}] }
        }
      },
      {
        "tweet": {
          "id_str": "1002",
          "full_text": "@someone Replying here",
          "created_at": "Thu Oct 11 10:00:00 +0000 2018",
          "in_reply_to_status_id_str": "999"
        }
      },
      {
        "tweet": {
          "id_str": "1003",
          "full_text": "RT @other: Great point",
          "created_at": "Fri Oct 12 10:00:00 +0000 2018"
        }
      }
    ];`;

    const items = parseXArchiveText(sample, '@alice');
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      id: '1001',
      platform: 'x',
      type: 'post',
      media: true,
      source: 'Twitter Web App',
      metrics: { likes: 12, reposts: 3 },
      url: 'https://x.com/alice/status/1001',
    });
    expect(items[1]?.type).toBe('reply');
    expect(items[2]?.type).toBe('repost');
  });

  it('parses window.YTD.like.part0 items', () => {
    const sample = `window.YTD.like.part0 = [
      {
        "like": {
          "tweetId": "55555",
          "fullText": "Liked tweet body",
          "expandedUrl": "https://twitter.com/i/web/status/55555"
        }
      }
    ]`;
    const items = parseXArchiveText(sample);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: '55555',
      type: 'like',
      text: 'Liked tweet body',
      url: 'https://twitter.com/i/web/status/55555',
    });
  });
});
