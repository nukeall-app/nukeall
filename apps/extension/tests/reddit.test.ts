import { parseHTML } from 'linkedom';
import { describe, expect, it } from 'vitest';
import {
  detectRedditHandleFromPath,
  generateOverwriteText,
  parseRedditListingChildren,
  parseVisibleRedditDom,
  planRedditScanSteps,
} from '../src/adapters/reddit/api';
import { parseRedditCsvArchive } from '../src/adapters/reddit/archive';

describe('reddit adapter', () => {
  it('plans automatic Reddit profile navigation steps', () => {
    expect(planRedditScanSteps('u/demo_user', ['comment'])).toEqual([
      { url: 'https://www.reddit.com/user/demo_user/comments/', type: 'comment' },
    ]);
    expect(planRedditScanSteps('demo_user', ['post'])).toEqual([
      { url: 'https://www.reddit.com/user/demo_user/submitted/', type: 'post' },
    ]);
  });

  it('parses Reddit listing JSON for comments and posts', () => {
    const comments = parseRedditListingChildren(
      [
        {
          kind: 't1',
          data: {
            id: 'abc123',
            name: 't1_abc123',
            body: 'My Reddit comment',
            created_utc: 1700000000,
            score: 14,
            permalink: '/r/privacy/comments/xyz/title/abc123/',
            subreddit_name_prefixed: 'r/privacy',
          },
        },
      ],
      'comment',
    );
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      id: 't1_abc123',
      platform: 'reddit',
      type: 'comment',
      text: 'My Reddit comment',
      source: 'r/privacy',
      metrics: { likes: 14, score: 14 },
      url: 'https://www.reddit.com/r/privacy/comments/xyz/title/abc123/',
    });

    const posts = parseRedditListingChildren(
      [
        {
          kind: 't3',
          data: {
            id: 'post99',
            name: 't3_post99',
            title: 'Post title',
            selftext: 'Post body',
            created_utc: 1700000500,
            score: 42,
            permalink: '/r/turkey/comments/post99/post_title/',
            subreddit: 'turkey',
            is_self: true,
            pinned: true,
          },
        },
      ],
      'post',
    );
    expect(posts[0]).toMatchObject({
      id: 't3_post99',
      type: 'post',
      text: 'Post title\n\nPost body',
      source: 'r/turkey',
      pinned: true,
    });
  });

  it('parses Reddit comments.csv and posts.csv data exports with multiline quotes', () => {
    const commentsCsv = [
      'id,permalink,date,ip,subreddit,gildings,link,parent,body,media',
      'c1a2b,https://www.reddit.com/r/privacy/comments/1/x/c1a2b/,2024-03-10 12:30:00 UTC,,privacy,0,t3_1,t3_1,"Line 1\nLine ""2"", here",',
    ].join('\n');

    const comments = parseRedditCsvArchive(commentsCsv);
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({
      id: 't1_c1a2b',
      platform: 'reddit',
      type: 'comment',
      text: 'Line 1\nLine "2", here',
      source: 'r/privacy',
    });

    const postsCsv = [
      'id,permalink,date,ip,subreddit,gildings,title,url,body',
      'p9z8,https://www.reddit.com/r/linux/comments/p9z8/hello/,2024-04-01 09:00:00 UTC,,linux,0,Hello Linux,,Body text',
    ].join('\n');
    const posts = parseRedditCsvArchive(postsCsv);
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({
      id: 't3_p9z8',
      type: 'post',
      text: 'Hello Linux\n\nBody text',
      source: 'r/linux',
    });
  });

  it('generates distinct random overwrite strings per pass', () => {
    const a = generateOverwriteText(0);
    const b = generateOverwriteText(1);
    expect(a).toContain('[1]');
    expect(b).toContain('[2]');
    expect(a).not.toBe(b);
  });

  it('detects handle from user profile paths and parses Shreddit & Old Reddit DOM', () => {
    expect(detectRedditHandleFromPath('/user/demo_user/comments/')).toBe('demo_user');
    expect(detectRedditHandleFromPath('/u/alice/submitted/')).toBe('alice');
    expect(detectRedditHandleFromPath('/user/me/')).toBe('');

    const shredditHtml = parseHTML(`<!doctype html><html><body>
      <shreddit-profile-comment
        comment-id="t1_c111"
        author="demo_user"
        subreddit-prefixed-name="r/privacy"
        score="7"
        created-timestamp="2025-02-01T12:00:00Z"
        permalink="/r/privacy/comments/abc/post/c111/"
      >
        <div id="t1_c111-comment-rtjson-content">Shreddit comment body</div>
      </shreddit-profile-comment>
      <shreddit-profile-comment comment-id="t1_other" author="someone_else">
        <div slot="comment">Not mine</div>
      </shreddit-profile-comment>
      <shreddit-post
        id="t3_p222"
        author="demo_user"
        post-title="My Shreddit Post"
        subreddit-prefixed-name="r/turkey"
        score="19"
        created-timestamp="2025-03-01T10:00:00Z"
        permalink="/r/turkey/comments/p222/my_shreddit_post/"
      >
        <div slot="text-body">Post details here</div>
      </shreddit-post>
    </body></html>`);

    const shredditComments = parseVisibleRedditDom(
      'comment',
      'demo_user',
      shredditHtml.document as unknown as Document,
    );
    expect(shredditComments).toHaveLength(1);
    expect(shredditComments[0]).toMatchObject({
      id: 't1_c111',
      type: 'comment',
      text: 'Shreddit comment body',
      source: 'r/privacy',
      metrics: { likes: 7, score: 7 },
    });

    const shredditPosts = parseVisibleRedditDom(
      'post',
      'demo_user',
      shredditHtml.document as unknown as Document,
    );
    expect(shredditPosts).toHaveLength(1);
    expect(shredditPosts[0]).toMatchObject({
      id: 't3_p222',
      type: 'post',
      text: 'My Shreddit Post\n\nPost details here',
      source: 'r/turkey',
    });

    const oldHtml = parseHTML(`<!doctype html><html><body>
      <div class="thing comment" data-fullname="t1_old9" data-author="demo_user" data-subreddit="linux">
        <a class="bylink" href="/r/linux/comments/x/y/old9/">permalink</a>
        <div class="usertext-body"><div class="md">Old reddit comment</div></div>
      </div>
      <div class="thing link self" data-fullname="t3_oldp1" data-author="demo_user" data-subreddit="selfhosted" data-permalink="/r/selfhosted/comments/oldp1/hi/">
        <a class="title">Old reddit post</a>
      </div>
    </body></html>`);

    expect(
      parseVisibleRedditDom('comment', 'demo_user', oldHtml.document as unknown as Document),
    ).toMatchObject([{ id: 't1_old9', text: 'Old reddit comment', source: 'r/linux' }]);
    expect(
      parseVisibleRedditDom('post', 'demo_user', oldHtml.document as unknown as Document),
    ).toMatchObject([{ id: 't3_oldp1', text: 'Old reddit post', source: 'r/selfhosted' }]);
  });
});
