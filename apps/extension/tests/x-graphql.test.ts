import { describe, expect, it } from 'vitest';
import {
  extractTimelineTweets,
  opFromUrl,
  planXScanSteps,
  rawToContentItems,
} from '../src/adapters/x/graphql';

describe('x graphql parser & scan planner', () => {
  it('extracts operation name from X GraphQL URLs', () => {
    expect(opFromUrl('https://x.com/i/api/graphql/abc123/UserTweetsAndReplies?variables=%7B%7D')).toBe(
      'UserTweetsAndReplies',
    );
    expect(opFromUrl('https://x.com/i/api/graphql/xyz/Likes?variables=%7B%7D')).toBe('Likes');
    expect(opFromUrl('https://x.com/home')).toBeNull();
  });

  it('extracts own replies inside conversation modules and skips other users parent tweets', () => {
    const mockResponse = {
      data: {
        user: {
          result: {
            timeline_v2: {
              timeline: {
                instructions: [
                  {
                    type: 'TimelineAddEntries',
                    entries: [
                      {
                        entryId: 'profile-conversation-1',
                        content: {
                          entryType: 'TimelineTimelineModule',
                          items: [
                            {
                              item: {
                                itemContent: {
                                  itemType: 'TimelineTweet',
                                  tweet_results: {
                                    result: {
                                      __typename: 'Tweet',
                                      rest_id: '500',
                                      core: {
                                        user_results: {
                                          result: {
                                            rest_id: '999',
                                            legacy: { screen_name: 'someone_else' },
                                          },
                                        },
                                      },
                                      legacy: {
                                        id_str: '500',
                                        user_id_str: '999',
                                        full_text: 'Original tweet by someone else',
                                        created_at: 'Thu Oct 10 10:00:00 +0000 2024',
                                        favorite_count: 10,
                                        retweet_count: 2,
                                      },
                                    },
                                  },
                                },
                              },
                            },
                            {
                              item: {
                                itemContent: {
                                  itemType: 'TimelineTweet',
                                  tweet_results: {
                                    result: {
                                      __typename: 'TweetWithVisibilityResults',
                                      tweet: {
                                        rest_id: '501',
                                        core: {
                                          user_results: {
                                            result: {
                                              rest_id: '123',
                                              core: { screen_name: 'efe' },
                                            },
                                          },
                                        },
                                        legacy: {
                                          id_str: '501',
                                          user_id_str: '123',
                                          full_text: '@someone_else My reply comment here',
                                          created_at: 'Thu Oct 10 10:05:00 +0000 2024',
                                          in_reply_to_status_id_str: '500',
                                          favorite_count: 1,
                                          retweet_count: 0,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    };

    const raws = extractTimelineTweets(mockResponse);
    expect(raws).toHaveLength(2);

    const mine = rawToContentItems(raws, 'tweets', { id: '', handle: 'efe' });
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({
      id: '501',
      type: 'reply',
      text: '@someone_else My reply comment here',
      url: 'https://x.com/efe/status/501',
    });
  });

  it('plans automatic X navigation URLs based on selected content types', () => {
    expect(planXScanSteps('@efe', ['reply'])).toEqual([
      { url: 'https://x.com/efe/with_replies', kind: 'tweets', types: ['reply'] },
    ]);

    expect(planXScanSteps('efe', ['post', 'repost'])).toEqual([
      { url: 'https://x.com/efe', kind: 'tweets', types: ['post', 'repost'] },
    ]);

    expect(planXScanSteps('efe', ['reply', 'like', 'bookmark'])).toEqual([
      { url: 'https://x.com/efe/with_replies', kind: 'tweets', types: ['reply'] },
      { url: 'https://x.com/efe/likes', kind: 'likes', types: ['like'] },
      { url: 'https://x.com/i/bookmarks', kind: 'bookmarks', types: ['bookmark'] },
    ]);
  });
});
