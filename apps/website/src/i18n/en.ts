export interface FaqItem {
  q: string;
  a: string;
  href?: string;
  linkLabel?: string;
}

export const en = {
  langName: 'English',
  ogLocale: 'en_US',
  meta: {
    home: {
      title: 'NukeAll — Delete All Tweets, Instagram, Reddit & LinkedIn History Free (Open Source)',
      description:
        'Free, open-source browser extension to bulk delete all your tweets, likes, Instagram comments & DMs, Reddit comments and old LinkedIn posts. Unlimited, 100% local — a private Redact.dev alternative.',
    },
    install: {
      title: 'Install NukeAll — Firefox, Chrome, Edge & Brave Setup Guide',
      description:
        'Step-by-step guide to install the free NukeAll extension on Firefox (Add-ons or about:debugging) and Chrome, Edge or Brave (load unpacked from GitHub Releases).',
    },
    faq: {
      title: 'NukeAll FAQ — Account Safety, Privacy & How Bulk Deleting Works',
      description:
        'Answers about deleting all tweets for free, bulk deleting Instagram comments and Reddit comments safely: ban risk, safe speed limits, where your data goes and why it is free.',
    },
    compare: {
      title: 'Redact.dev Alternative — NukeAll vs Redact, Cyd, TweetDeleter & Power Delete Suite',
      description:
        'Looking for a free Redact.dev or TweetDeleter alternative? Compare NukeAll, the open source tweet deleter, with Redact, Cyd, TweetDeleter and Power Delete Suite.',
    },
    privacy: {
      title: 'Privacy Policy — NukeAll Collects Nothing',
      description:
        'The NukeAll extension collects no data: no servers, no telemetry, no account. The website only uses cookieless Cloudflare Web Analytics.',
    },
    sponsor: {
      title: 'Sponsor NukeAll — Keep the Free Open Source Tweet Deleter Alive',
      description:
        'NukeAll is free forever and funded by users. Support development via GitHub Sponsors or Ko-fi — every tier helps keep the bulk deleter maintained.',
    },
    guideTweets: {
      title: 'How to Delete All Tweets & X Replies for Free (2026) — NukeAll',
      description:
        'Step-by-step guide to bulk delete all tweets, replies, likes, reposts and bookmarks on X (Twitter) — including tweets.js archive import past the 3,200 limit.',
    },
    guideIgComments: {
      title: 'Bulk Delete Instagram Comments & Likes Without Giving Your Password — NukeAll',
      description:
        'Delete old Instagram comments, likes and posts safely inside your browser via Your Activity or JSON export (with UTF-8 encoding fix) — zero credential sharing.',
    },
    guideIgDm: {
      title: 'Unsend Your Instagram Direct Messages (DM) Automatically — NukeAll',
      description:
        'Clean up your own sent messages in any Instagram Direct chat automatically without deleting your entire account or using risky third-party apps.',
    },
    guideReddit: {
      title: 'Overwrite & Delete All Reddit Comments and Posts Safely — NukeAll',
      description:
        'Mass-delete your Reddit comments and submissions with 0–3 pass random or custom text overwriting before deletion + comments.csv archive import.',
    },
    guideLinkedin: {
      title: 'Delete Old LinkedIn Posts & Activity by Date Range — NukeAll',
      description:
        'Filter and bulk delete old LinkedIn posts, comments and reactions by exact date range using Snowflake URN timestamps or Shares.csv archive import — 100% locally.',
    },
    notFound: {
      title: 'Page not found — NukeAll',
      description: 'This page does not exist. Head back to NukeAll, the free open source social media history wiper.',
    },
  },
  nav: {
    skip: 'Skip to content',
    home: 'Home',
    features: 'Features',
    compare: 'Compare',
    faq: 'FAQ',
    install: 'Install',
    sponsor: 'Sponsor',
    privacy: 'Privacy',
    github: 'GitHub',
    menu: 'Menu',
    primary: 'Primary navigation',
    switchLabel: 'Language',
  },
  hero: {
    eyebrow: 'Free & open source · GPL-3.0',
    h1Lead: 'Wipe your social media history.',
    h1Tail: 'Free. Open source. Nothing leaves your browser.',
    sub: 'NukeAll bulk-deletes your own posts, replies, comments, likes, reposts and DMs on X (Twitter), Instagram, Reddit and LinkedIn — unlimited, date-filtered and reviewed before anything is touched. No server, no account, no telemetry.',
    ctaFirefox: 'Add to Firefox',
    soon: 'coming soon',
    ctaChrome: 'Download for Chrome / Edge / Brave',
    ctaGithub: 'Star on GitHub',
    note: 'Works in Firefox, Chrome, Edge and Brave. Your data never leaves your device.',
  },
  platforms: {
    title: 'Platforms',
    live: 'Supported',
    soon: 'Coming soon',
  },
  features: {
    title: 'Everything paid tools charge for — free',
    subtitle: 'Built to beat subscription deleters on features, not just on price.',
    items: [
      { icon: '∞', title: 'Unlimited & free', body: 'No 30-day window, no daily caps, no credits, no paywalled tiers. Delete 50 or 500,000 items.' },
      { icon: '🗄️', title: 'Multi-platform archives', body: 'Import X tweets.js/like.js, Instagram JSON, Reddit CSV, or LinkedIn Shares.csv / Comments.csv to delete past timeline limits.' },
      { icon: '📅', title: 'Date picker & review grid', body: 'Pick exact From / To calendar dates or quick > 30d / > 6m / > 1y filters. Nothing is deleted until you confirm “Delete N items”.' },
      { icon: '💬', title: 'Instagram DMs & UTF-8 JSON fix', body: 'Unsend only your own outgoing messages inside any Instagram Direct chat and auto-repair broken UTF-8 encoding in Meta JSON exports.' },
      { icon: '💼', title: 'LinkedIn Snowflake timestamps', body: 'Decode exact post creation timestamps directly from 64-bit Snowflake URNs and filter old LinkedIn activity safely.' },
      { icon: '✍️', title: 'Reddit multi-pass overwrite', body: 'Overwrites comments and text posts 0–3 passes with random or custom text before deleting (plus edit-only mode).' },
      { icon: '💾', title: 'Backup + deletion report', body: 'Optional one-click local backup (JSON/CSV/HTML) before deleting and a downloadable HTML/JSON report of what was deleted and when.' },
      { icon: '📦', title: 'Offline HTML archive', body: 'Export a single searchable HTML file of your history that opens without internet.' },
      { icon: '⏯️', title: 'Resume anywhere', body: 'Progress is checkpointed. Browser crashed or closed? Pick up exactly where you left off.' },
      { icon: '🎛️', title: 'Presets & protection rules', body: '“Before a job search”, “Full reset”, “Only likes”… Keep pinned or popular posts and #keep tags, share presets as JSON.' },
      { icon: '🐢', title: 'Safe speed limits', body: 'Safe / Normal / Fast modes, random delays, automatic back-off on rate limits and a daily safety cap.' },
      { icon: '🌍', title: 'English & Türkçe', body: 'Full interface in English and Turkish, dark & light themes, keyboard-friendly and accessible.' },
    ],
  },
  how: {
    title: 'How it works',
    steps: [
      { title: 'Install & pick a platform', body: 'Add the extension, open X, Instagram, Reddit or LinkedIn while logged in, and choose one content type or a preset.' },
      { title: 'Scan & filter by date', body: 'NukeAll scans your live activity (or imports your official archive) and lets you filter by calendar date, keywords, or regex.' },
      { title: 'Back up & nuke', body: 'Download an optional local backup if you want one, get a 10-second cancel window, then deletion runs at a safe pace with a report at the end.' },
    ],
  },
  privacy: {
    title: 'Private by architecture, not by promise',
    body: 'NukeAll runs entirely inside your browser using your existing session. There is no NukeAll server to send data to — so nothing can be leaked, sold or subpoenaed.',
    points: [
      { title: 'Zero servers', body: 'The extension only talks to x.com, instagram.com, reddit.com and linkedin.com. No backend, no account, no OAuth.' },
      { title: 'Zero telemetry', body: 'No analytics, no crash reporting, no remote code. A CI check fails the build if any unknown URL appears in the code.' },
      { title: 'CSP-enforced', body: 'The extension’s Content-Security-Policy is connect-src \'self\' — the browser itself blocks any other connection.' },
      { title: 'Auditable', body: 'Every line is GPL-3.0 source on GitHub. Build it yourself and verify.' },
    ],
    cta: 'Read the privacy policy',
  },
  compareSection: {
    title: 'How NukeAll compares',
    subtitle: 'Free, unlimited, open source and multi-platform — pick any two elsewhere.',
    cta: 'See the full comparison',
  },
  compare: {
    h1: 'The free, open source Redact.dev alternative',
    intro:
      'NukeAll is a free alternative to Redact.dev, TweetDeleter, Cyd and Power Delete Suite. Here is how the tools stack up on the features that matter when you want to delete all tweets, Instagram comments or Reddit comments.',
    asOf: 'As of November 2026, based on publicly available information.',
    disclaimer: 'Spotted something out of date? Open an issue on GitHub and we will correct it. All trademarks belong to their respective owners.',
    featureCol: 'Feature',
    caption: 'Feature comparison of social media deletion tools',
    legend: '✅ yes · ⚠️ partial / limited · ❌ no · ? unknown · – not applicable',
    pricing: 'Price',
    prices: ['Free', 'Free tier: last 30 days; $8–15/mo', 'Limited free; Premium $3/mo', '$6–24/mo', 'Free'],
    rows: [
      'Free & unlimited',
      'Open source',
      'No install (browser extension)',
      'Zero servers, zero telemetry',
      'X + Instagram + Reddit + LinkedIn in one tool',
      'X: Tweets, replies, likes, reposts, bookmarks + tweets.js',
      'Instagram: Comments, likes, posts, DM unsend + UTF-8 JSON',
      'Reddit: 0–3 pass overwrite + comments.csv / posts.csv',
      'LinkedIn: Date picker (>30d / >6m / >1y), Snowflake + Shares.csv',
      'Archive mode (beyond platform limits)',
      'Review grid & calendar date picker',
      'Offline HTML archive viewer',
      'Protection rules (keep pinned / popular / #keep)',
      'Resume after crash',
      'Shareable presets (JSON)',
      'Deletion report (local proof file)',
      'Turkish interface',
    ],
    notes: { paid: 'paid', xOnly: 'X only', cloud: 'cloud', gpl: 'GPL-3', free: 'free', xPaid: 'X only, paid' },
    alts: [
      { title: 'NukeAll vs Redact.dev', body: 'Redact.dev supports many platforms, but its free tier only covers the last 30 days and features like review mode and extended filters sit behind paid plans. NukeAll gives you the review grid, date picker, Reddit overwriting and archive import across X, Instagram, Reddit and LinkedIn for free as open-source browser code.' },
      { title: 'NukeAll vs TweetDeleter / TweetEraser', body: 'Cloud services like TweetDeleter require a subscription and process your account through their servers, and only cover X. NukeAll is a free tweet deleter that never sends your data anywhere and also handles Instagram, Reddit and LinkedIn.' },
      { title: 'NukeAll vs Cyd', body: 'Cyd is a great open-source desktop app for X with a local archive. NukeAll brings a similar offline archive into a lightweight browser extension and adds Instagram (including DM unsend), Reddit overwriting and LinkedIn date filtering for free.' },
      { title: 'NukeAll vs Power Delete Suite / Shreddit', body: 'Reddit scripts are free but need Python, API keys or old interfaces and hit the 1,000-item limit. NukeAll overwrites (0–3 passes) and deletes Reddit comments from a modern UI and can import comments.csv / posts.csv to go further.' },
    ],
  },
  faq: {
    h1: 'Frequently asked questions',
    homeTitle: 'FAQ',
    intro: 'Everything you need to know before you wipe your history.',
    more: 'All questions',
    items: [
      { q: 'Can my account get banned or restricted?', a: 'X, Meta and LinkedIn restrict rapid automated activity, so very fast bulk actions can trigger a temporary limit. NukeAll defaults to Safe speed with random delays, automatic back-off when the platform says “slow down”, and a daily safety cap. Keep the defaults and runs stay well within normal usage patterns. Use at your own risk.' },
      { q: 'Where does my data go?', a: 'Nowhere. Everything — scanning, date filtering, backups and reports — happens inside your browser. The extension only connects to the platform you are cleaning (x.com, instagram.com, reddit.com, linkedin.com) using your existing login. There is no NukeAll server.' },
      { q: 'Why is it free? What is the catch?', a: 'There is no catch. NukeAll is GPL-3.0 open source software funded by voluntary donations. No ads, no data sales, no premium tier.' },
      {
        q: 'How do I install it?',
        a: 'Download the zip package for your browser from GitHub Releases (github.com/nukeall-app/nukeall/releases/latest). For Chrome, Edge or Brave, unzip *-chrome.zip, open chrome://extensions (or edge://extensions / brave://extensions), turn on Developer mode, and click “Load unpacked”. NukeAll is not published on Firefox Add-ons yet — Firefox users can download *-firefox.zip from GitHub Releases and load it via about:debugging#/runtime/this-firefox.',
        href: 'https://nukeall.pages.dev/install/',
        linkLabel: 'Open step-by-step install guide →',
      },
      { q: 'Is it legal? Does it break the platforms’ terms?', a: 'Deleting your own content is your right, and every platform lets you do it manually. NukeAll just automates clicks you could make yourself, from your own browser session. Platforms discourage automation in their terms, which is why NukeAll is deliberately slow by default. This is not legal advice.' },
      { q: 'Can it delete other people’s content?', a: 'No. NukeAll only works on content from the account you are logged into — your posts, replies, comments, likes, reposts and bookmarks. Anything that touches other people (mass reporting, follower tools) is deliberately out of scope.' },
      { q: 'Can I get around the 3,200 tweet limit?', a: 'Yes. Upload tweets.js / like.js from your X data export (or your Instagram JSON / Reddit CSV export) and NukeAll can delete items the timeline no longer shows.' },
      { q: 'Is deletion reversible?', a: 'No — deletion is permanent. That is why the review grid is on by default, one-click manual local backups are right next to the delete button, and you get a 10-second cancel window before each run.' },
    ] as FaqItem[],
  },
  install: {
    h1: 'Install NukeAll',
    intro: 'NukeAll runs in Firefox, Chrome, Edge and Brave. Pick your browser below — it takes about a minute.',
    firefoxTitle: 'Firefox',
    amoTitle: 'Option A — Firefox Add-ons (recommended once live)',
    amoSteps: [
      'Open the NukeAll page on <strong>addons.mozilla.org</strong>.',
      'Click <strong>Add to Firefox</strong> and confirm the permissions (only x.com, twitter.com, instagram.com, reddit.com and linkedin.com).',
      'Pin NukeAll from the extensions menu, or open the sidebar from the toolbar icon.',
    ],
    amoSoon: 'NukeAll is not published on Firefox Add-ons yet. Download the Firefox zip from GitHub Releases and use Option B below.',
    tempTitle: 'Option B — Install from GitHub Releases (about:debugging)',
    tempSteps: [
      'Download the latest <code>nukeallextension-*-firefox.zip</code> file from GitHub Releases (under Assets).',
      'Type <code>about:debugging#/runtime/this-firefox</code> in the address bar.',
      'Click <strong>Load Temporary Add-on…</strong> and select the downloaded zip file (or <code>manifest.json</code> inside the unzipped folder).',
      'Temporary add-ons are removed when Firefox restarts — repeat these steps until the Firefox Add-ons listing goes live.',
    ],
    chromeTitle: 'Chrome, Edge & Brave',
    chromeSteps: [
      'Download <code>nukeallextension-*-chrome.zip</code> from the latest GitHub Release (under Assets).',
      'Unzip it to a folder you will keep (do not delete it afterwards).',
      'Open <code>chrome://extensions</code> — or <code>edge://extensions</code> / <code>brave://extensions</code>.',
      'Turn on <strong>Developer mode</strong> (toggle in the top-right, or bottom-left in Edge).',
      'Click <strong>Load unpacked</strong> and select the unzipped folder.',
      'Pin NukeAll and open the side panel from the toolbar icon.',
    ],
    devNote: 'Chromium may show a “developer mode extensions” notice at startup. That is normal for extensions installed outside the Chrome Web Store.',
    afterTitle: 'After installing',
    afterSteps: [
      'Open x.com, instagram.com, reddit.com or linkedin.com and log in as usual.',
      'Open NukeAll and pick one content type → filter by date/keywords → review & delete.',
      'Keep the default Safe speed for large clean-ups.',
    ],
    download: 'Download from GitHub Releases',
    openAmo: 'Open Firefox Add-ons',
  },
  sponsor: {
    h1: 'Sponsor NukeAll',
    intro: 'NukeAll is free forever, with no ads, no tracking and no premium tier. Platforms change their interfaces constantly — sponsorships pay for the time it takes to keep the extension working.',
    ghBtn: 'Sponsor on GitHub',
    kofiBtn: 'Support on Ko-fi',
    tiersTitle: 'Tiers',
    perMonth: '/month',
    tiers: [
      { price: 3, name: 'Coffee', perks: 'Our thanks and a warm feeling. Keeps the lights on.' },
      { price: 10, name: 'Supporter', perks: 'Your name on the sponsor wall.' },
      { price: 50, name: 'Champion', perks: 'Name + link on the sponsor wall and in the README.' },
      { price: 250, name: 'Guardian', perks: 'Logo on the website and README, plus priority on platform-breakage issues.' },
    ],
    wallTitle: 'Sponsor wall',
    wallEmpty: 'Be the first sponsor — your name could be here.',
    otherTitle: 'Other ways to help',
    other: [
      'Star the repository on GitHub.',
      'Report broken selectors when a platform changes its interface.',
      'Translate NukeAll into your language.',
      'Tell a friend who needs a clean slate.',
    ],
    note: 'Links open GitHub Sponsors or Ko-fi directly — no embedded widgets or trackers on this site.',
  },
  privacyPage: {
    h1: 'Privacy policy',
    updated: 'Last updated: November 2026',
    sections: [
      { title: 'Summary', body: ['The NukeAll extension collects no personal data. There are no NukeAll servers, no accounts, no analytics and no telemetry. This website uses cookieless Cloudflare Web Analytics only.'] },
      { title: 'The extension', body: [
        'All processing — scanning, date filtering, backups, archives and deletion reports — happens locally in your browser. Data is stored in your browser’s extension storage and IndexedDB and never transmitted to us.',
        'The extension only communicates with the platforms you choose to clean (x.com, twitter.com, instagram.com, reddit.com, linkedin.com), using your existing logged-in session, to list and delete your own content.',
        'Its Content-Security-Policy restricts network connections, and it contains no remote code, CDNs, analytics or crash reporting. You can verify this in the GPL-3.0 source code.',
        'Uninstalling the extension removes its stored data. Backups and reports you downloaded remain on your device under your control.',
      ] },
      { title: 'This website', body: [
        'nukeall.app is a static site hosted on Cloudflare Pages. Fonts and assets are self-hosted; there are no third-party embeds, ads or social widgets.',
        'We use Cloudflare Web Analytics, which does not use cookies or local storage for tracking and does not fingerprint visitors. It provides aggregate statistics such as page views and referrers.',
        'If you dismiss the language suggestion banner, that choice is stored in your browser’s localStorage only.',
        'Cloudflare, as hosting provider, may process technical request data (such as IP address) for security and delivery purposes.',
      ] },
      { title: 'Donations', body: ['Sponsor links go to GitHub Sponsors and Ko-fi. Those services have their own privacy policies; we only receive what they share with recipients.'] },
      { title: 'Contact', body: ['Questions? Open an issue on GitHub.'] },
    ],
  },
  ctaBand: {
    title: 'Ready for a clean slate?',
    body: 'Free, unlimited and private. Install in under a minute.',
  },
  footer: {
    tagline: 'Free & open-source social media history wiper.',
    license: 'Licensed under GPL-3.0-or-later.',
    disclaimer: 'Not affiliated with X Corp, Meta, Reddit or LinkedIn. All trademarks belong to their respective owners.',
    source: 'Source code',
    guides: 'Guides',
    product: 'Product',
    project: 'Project',
    language: 'Language',
  },
  banner: {
    text: 'Bu sayfanın Türkçe sürümü mevcut.',
    action: 'Türkçe’ye geç',
    dismiss: 'Kapat',
  },
  notFound: {
    h1: 'Nothing here — it may already be nuked.',
    body: 'The page you are looking for does not exist.',
    home: 'Back to home',
  },
};

export type Dict = typeof en;
