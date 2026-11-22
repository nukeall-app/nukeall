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
    eyebrow: 'Free & open source · 100% runs inside your browser',
    h1Lead: 'Wipe your social media',
    h1Tail: 'history in minutes.',
    sub: 'Bulk-delete your own old posts, comments, likes, reposts and sent DMs across X, Instagram, Reddit and LinkedIn. Never share your password or pay for subscriptions.',
    ctaFirefox: 'Add to Firefox',
    soon: 'coming soon',
    ctaChrome: 'Download for Chrome / Edge / Brave',
    ctaInstall: 'Install Free (1 min)',
    ctaVerify: 'Inspect Source Code',
    ctaGithub: 'Star on GitHub',
    note: 'Works on Firefox, Chrome, Edge and Brave. Everything stays strictly on your device.',
    trustPoints: ['No password or API keys', 'Zero servers & zero tracking', 'Review before anything deletes'],
  },
  platforms: {
    title: 'Supported platforms',
    live: 'Live',
    soon: 'Coming soon',
    soonList: 'Bluesky · Threads · Facebook · YouTube',
    guideLink: 'How it works',
    cards: [
      {
        key: 'guideTweets' as const,
        badge: 'X',
        color: 'bg-zinc-800 text-white border-zinc-700',
        name: 'X (Twitter)',
        desc: 'Bulk delete old tweets, replies, likes, reposts and bookmarks — even past timeline limits.',
      },
      {
        key: 'guideIgComments' as const,
        badge: 'IG',
        color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        name: 'Instagram',
        desc: 'Remove old comments, likes and posts, plus automatically unsend your own messages in DM chats.',
      },
      {
        key: 'guideReddit' as const,
        badge: 'R',
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        name: 'Reddit',
        desc: 'Automatically overwrite comments and posts with random text before deleting so old words stay gone.',
      },
      {
        key: 'guideLinkedin' as const,
        badge: 'in',
        color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        name: 'LinkedIn',
        desc: 'Pick a calendar date range and safely clean old posts, comments and reactions before a job move.',
      },
    ],
  },
  features: {
    title: 'Everything paid tools charge for — completely free',
    subtitle: 'Clear controls, full transparency and no hidden subscriptions.',
    items: [
      { icon: '∞', title: 'Unlimited & free forever', body: 'No 30-day limit, no daily quotas, no credits and no paid upgrades. Clean 50 or 500,000 items for $0.' },
      { icon: '📅', title: 'Date picker & approval screen', body: 'Pick any start/end date or one-click presets (>30 days, >6 months, >1 year). Nothing is deleted until you confirm.' },
      { icon: '🗄️', title: 'Clean years-old history', body: 'Import your official account data download from X, Instagram, Reddit or LinkedIn right inside your browser to reach past platform limits.' },
      { icon: '💬', title: 'Unsend Instagram DMs', body: 'Open any Instagram Direct conversation and let NukeAll retract only your own sent messages cleanly for both sides.' },
      { icon: '💼', title: 'LinkedIn post & activity cleaner', body: 'Select posts, comments or reactions and filter precisely by calendar date to keep recent work highlights while wiping older takes.' },
      { icon: '✍️', title: 'Overwrite Reddit before deleting', body: 'Automatically replaces your Reddit comment or post text 1–3 times with random or custom words before deletion.' },
      { icon: '🛡️', title: 'Protect important memories', body: 'Automatically keep pinned posts, popular posts above a chosen like threshold, or anything tagged with a keep keyword.' },
      { icon: '💾', title: 'Personal backup & summary', body: 'Optionally save a readable copy of selected posts (plus a single-file offline web page you can search anytime) before deleting.' },
      { icon: '🐢', title: 'Human-paced safety & auto-resume', body: 'Randomized delays and daily caps help protect your account; if a platform asks to slow down or your browser closes, progress resumes safely.' },
    ],
  },
  how: {
    title: 'How it works in 3 steps',
    steps: [
      { title: '1. Install in a minute', body: 'Add NukeAll to your browser and open X, Instagram, Reddit or LinkedIn in a normal signed-in tab — we never ask for your password.' },
      { title: '2. Scan & pick dates', body: 'Choose what you want to clean (or load your official account archive) and narrow the list by calendar date, words or likes.' },
      { title: '3. Confirm & clean safely', body: 'Download an optional backup, get a 10-second cancel countdown, and watch NukeAll delete at a safe human pace.' },
    ],
  },
  privacy: {
    title: 'Built so we can never see your data',
    body: 'Most online deleters ask for your login and run on their own servers. NukeAll has no servers at all — everything runs inside your browser tab.',
    points: [
      { title: 'Never asks for passwords', body: 'Works directly with your already signed-in browser tab. No password, no 2FA codes and no third-party app logins.' },
      { title: 'Nothing leaves your device', body: 'Scanning, filtering, backups and deletion history stay strictly on your own computer — never uploaded anywhere.' },
      { title: 'Locked to 4 social sites only', body: 'The browser itself blocks the extension from talking to any external tracker, ad network or unknown server.' },
      { title: '100% public & verifiable code', body: 'Every line of code is open on GitHub under the GPL-3.0 license so anyone can inspect or build it independently.' },
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
      'Open source (verifiable code)',
      'No password needed (runs in browser)',
      'Zero servers, zero tracking',
      'X (Twitter): Tweets, replies, likes, reposts & bookmarks',
      'Instagram: Comments, likes, posts & DM unsend',
      'Reddit: Overwrite text before deleting',
      'LinkedIn: Delete old posts by date range',
      'Delete years-old history (official archive support)',
      'Calendar date picker & one-by-one review',
      'Protect important posts (pinned / popular)',
      'Offline personal backup & deletion summary',
      'Resume automatically after interruption',
      'Turkish & English interface',
    ],
    notes: { paid: 'paid', xOnly: 'X only', cloud: 'cloud', gpl: 'GPL-3', free: 'free', xPaid: 'X only, paid' },
    alts: [
      { title: 'NukeAll vs Redact.dev', body: 'Redact.dev supports many platforms, but its free tier only covers the last 30 days and features like review mode and extended filters sit behind paid plans. NukeAll gives you date filtering, one-by-one review, Reddit overwriting and archive import across X, Instagram, Reddit and LinkedIn for free as open-source software.' },
      { title: 'NukeAll vs TweetDeleter / TweetEraser', body: 'Cloud services like TweetDeleter require a subscription and process your account through their servers, and only cover X. NukeAll is a free browser extension that never sends your data anywhere and also handles Instagram, Reddit and LinkedIn.' },
      { title: 'NukeAll vs Cyd', body: 'Cyd is a good open-source desktop app for X with a local archive. NukeAll brings a lightweight extension directly into your browser and adds Instagram (including DM unsend), Reddit overwriting and LinkedIn date filtering for free.' },
      { title: 'NukeAll vs Power Delete Suite / Shreddit', body: 'Reddit scripts are free but require setup or old interfaces and hit platform listing caps. NukeAll overwrites and deletes Reddit comments from a simple visual interface and supports importing your official Reddit data download.' },
    ],
  },
  faq: {
    h1: 'Frequently asked questions',
    homeTitle: 'FAQ',
    intro: 'Clear answers before you wipe your history.',
    more: 'All questions',
    items: [
      { q: 'Can my account get banned or restricted?', a: 'Social platforms limit rapid automated actions, so deleting too fast anywhere can trigger a temporary cooldown. NukeAll uses Safe human-paced delays, daily caps and automatic pauses by default to keep activity natural. Use at your own risk.' },
      { q: 'Where does my data go?', a: 'Nowhere. Everything — scanning, date filtering, backups and reports — stays strictly inside your own browser. There are no NukeAll servers or user accounts, and we never ask for your password.' },
      { q: 'Why is it free? Can I trust it?', a: 'NukeAll is 100% open-source (GPL-3.0) and funded by voluntary community donations — zero ads, zero data sales and zero paid plans. Anyone can read every line of code on GitHub.' },
      {
        q: 'How do I install it?',
        a: 'Download the browser zip package from our GitHub Releases page under Assets. For Chrome, Edge or Brave, unzip the Chrome folder and load it via your browser’s Extensions page (Developer mode → Load unpacked). NukeAll is not listed on Firefox Add-ons yet, so Firefox users can load the Firefox package directly via about:debugging.',
        href: 'https://nukeall.pages.dev/install/',
        linkLabel: 'Open the 1-minute install guide →',
      },
      { q: 'Is it legal? Does it break platform rules?', a: 'Deleting your own content is your right, and every platform lets you remove items manually. NukeAll simply automates the clicks inside your own signed-in tab at a safe speed. This is not legal advice.' },
      { q: 'Can it delete other people’s content?', a: 'No. NukeAll works strictly on your own posts, replies, comments, likes, reposts, bookmarks and sent DM messages. Nothing else is ever touched.' },
      { q: 'Can I delete posts from many years ago?', a: 'Yes. Platforms only show recent items live, so you can download your official data archive from X, Instagram, Reddit or LinkedIn and load it directly in NukeAll to delete older history too.' },
      { q: 'Is deletion reversible?', a: 'No — deletion is permanent. That is why NukeAll shows every item on a review screen first, offers an optional local backup download, and gives you a 10-second cancel countdown before starting.' },
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
      'Download the latest <code>nukeall-firefox.zip</code> file from GitHub Releases (under Assets).',
      'Type <code>about:debugging#/runtime/this-firefox</code> in the address bar.',
      'Click <strong>Load Temporary Add-on…</strong> and select the downloaded zip file (or <code>manifest.json</code> inside the unzipped folder).',
      'Temporary add-ons are removed when Firefox restarts — repeat these steps until the Firefox Add-ons listing goes live.',
    ],
    chromeTitle: 'Chrome, Edge & Brave',
    chromeSteps: [
      'Download <code>nukeall-chrome.zip</code> from the latest GitHub Release (under Assets).',
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
