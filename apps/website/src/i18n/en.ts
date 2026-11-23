import type { PageKey } from './routes';

export interface FaqItem {
  q: string;
  a: string;
  href?: string;
  linkLabel?: string;
}

export interface PlatformDetailItem {
  id: string;
  badge: string;
  color: string;
  name: string;
  tagline: string;
  cleans: string[];
  bullets: string[];
  guideKey: PageKey;
  guideLabel: string;
  secondaryGuideKey?: PageKey;
  secondaryGuideLabel?: string;
}

export const en = {
  langName: 'English',
  ogLocale: 'en_US',
  meta: {
    home: {
      title: 'NukeAll — Delete All Tweets, Instagram Comments & Reddit Posts Free',
      description:
        'Free open-source browser extension to bulk delete all tweets, X likes, Instagram comments, posts & DMs, Reddit comments & posts, and old LinkedIn posts — 100% local, no password.',
    },
    install: {
      title: 'Install NukeAll — Firefox, Chrome, Edge & Brave Setup Guide',
      description:
        'Step-by-step guide to install the free NukeAll extension on Firefox, Chrome, Edge or Brave in 1 minute from GitHub Releases.',
    },
    faq: {
      title: 'NukeAll FAQ — Account Safety, Privacy & How Bulk Deleting Works',
      description:
        'Answers about deleting all tweets, Instagram comments, Reddit posts & likes safely: ban risk, safe speed limits, privacy and why it is free.',
    },
    compare: {
      title: 'Redact.dev Alternative — NukeAll vs Redact, Cyd, TweetDeleter & Shreddit',
      description:
        'Looking for a free Redact.dev or TweetDeleter alternative? Compare NukeAll, the open-source bulk deleter, with Redact, Cyd, TweetDeleter and Power Delete Suite.',
    },
    privacy: {
      title: 'Privacy Policy — NukeAll Collects Nothing',
      description:
        'The NukeAll extension collects no data: no servers, no telemetry, no account. Everything stays inside your own browser.',
    },
    sponsor: {
      title: 'Support NukeAll — Keep the Free Open Source Cleaner Alive',
      description:
        'NukeAll is free forever and built by one independent developer. Buy me a coffee to help cover domain costs, fix platform updates and keep it $0 for everyone.',
    },
    guideTweets: {
      title: 'Delete All Tweets & X Replies Free (2026) — NukeAll',
      description:
        'Bulk delete all your tweets, replies, likes, reposts and bookmarks on X (Twitter) free and unlimited — even past the 3,200 post limit, with zero password sharing.',
    },
    guideXLikes: {
      title: 'Delete All Likes on X (Twitter) Free (Bulk Unlike Tool) — NukeAll',
      description:
        'Automatically unlike all tweets and remove old X likes inside your own signed-in browser tab without paid subscriptions or API keys.',
    },
    guideIgComments: {
      title: 'Delete All Instagram Comments Free (Bulk, No Password) — NukeAll',
      description:
        'How to mass delete all Instagram comments and likes safely inside your browser without shady cleaner apps or sharing your password.',
    },
    guideIgLikes: {
      title: 'Mass Unlike Instagram Likes & Delete All Posts Free — NukeAll',
      description:
        'Unlike old Instagram photos and reels or bulk delete your own Instagram posts safely inside your browser — free, unlimited and zero login sharing.',
    },
    guideIgDm: {
      title: 'Unsend All Instagram DM Messages Automatically Free — NukeAll',
      description:
        'Automatically unsend your own sent messages in any Instagram Direct chat so they disappear for both sides — no account deletion required.',
    },
    guideReddit: {
      title: 'Delete All Reddit Comments Free (Overwrite & Mass Delete) — NukeAll',
      description:
        'Mass-delete all Reddit comments with 0–3 pass random or custom text overwriting before deletion — works past the 1,000-item limit.',
    },
    guideRedditPosts: {
      title: 'Delete All Reddit Posts Free (Overwrite & Wipe History) — NukeAll',
      description:
        'How to mass delete all Reddit posts and submissions safely with automatic text overwriting before deletion — unlimited, local and free.',
    },
    guideLinkedin: {
      title: 'Delete Old LinkedIn Posts & Activity by Date Free — NukeAll',
      description:
        'Filter and bulk delete old LinkedIn posts, comments and likes by exact calendar date before a job move — 100% inside your browser.',
    },
    guideSocialWipe: {
      title: 'Wipe Social Media History & Clean Digital Footprint Free — NukeAll',
      description:
        'How to wipe years of social media posts, comments, likes and DMs across X, Instagram, Reddit and LinkedIn for free without uploading your data.',
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
  platformDetails: {
    eyebrow: 'Platform by platform',
    title: 'What you can clean on each platform',
    subtitle:
      'Every cleanup runs directly inside your own signed-in browser tab — pick a platform, review your list first, and delete safely at your own pace.',
    cleansLabel: 'What gets cleaned',
    items: [
      {
        id: 'x',
        badge: 'X',
        color: 'bg-zinc-800 text-white border-zinc-700',
        name: 'X (Twitter)',
        tagline: 'Full timeline cleanup — from recent replies to tweets from years ago.',
        cleans: ['Tweets', 'Replies', 'Likes', 'Reposts', 'Bookmarks'],
        bullets: [
          'Bulk-delete your tweets, replies, likes, reposts and saved bookmarks — one content type at a time for reliability.',
          'Filter by calendar dates, keywords, media, or the offline EN + TR profanity filter before anything is touched.',
          'Automatically protect pinned posts, viral tweets above your chosen like count, or keep tags.',
          'Go past X’s timeline limit by importing your official X data download right inside your browser.',
        ],
        guideKey: 'guideTweets',
        guideLabel: 'Step-by-step X guide',
      },
      {
        id: 'instagram',
        badge: 'IG',
        color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        name: 'Instagram',
        tagline: 'Clean public activity and retract your own sent Direct messages.',
        cleans: ['Comments', 'Likes', 'Posts', 'Sent DMs (Unsend)'],
        bullets: [
          'Remove old comments, likes and posts automatically inside your signed-in Instagram tab without sharing your password.',
          'Open any Direct chat and automatically unsend only your own sent messages so they disappear for both sides.',
          'Preview every item on the review screen first and uncheck photos, comments or messages you want to keep.',
          'Import your official Instagram data download (with clean international & Turkish text support) to reach older history.',
        ],
        guideKey: 'guideIgComments',
        guideLabel: 'Comments & likes guide',
        secondaryGuideKey: 'guideIgDm',
        secondaryGuideLabel: 'DM unsend guide',
      },
      {
        id: 'reddit',
        badge: 'R',
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        name: 'Reddit',
        tagline: 'Overwrite old text before deleting so third-party archives stay empty.',
        cleans: ['Comments', 'Posts', 'Overwrite (1–3×)', 'Edit-Only Mode'],
        bullets: [
          'Overwrite every comment or text post 1–3 times with random or custom text before deleting so old words do not linger.',
          'Pick edit-only mode if you want to scramble old text while keeping threads intact, or overwrite + permanently delete.',
          'Filter by date, keywords, score or community, and automatically keep high-value posts untouched.',
          'Upload your official Reddit data download to wipe history older than Reddit’s live 1,000-item view limit.',
        ],
        guideKey: 'guideReddit',
        guideLabel: 'Step-by-step Reddit guide',
      },
      {
        id: 'linkedin',
        badge: 'in',
        color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        name: 'LinkedIn',
        tagline: 'Tidy up old posts and reactions by exact date before a career move.',
        cleans: ['Posts', 'Comments', 'Reactions & Likes', 'Calendar Date Picker'],
        bullets: [
          'Delete old posts, comments and likes while leaving recent career highlights completely untouched.',
          'Select exact From / To calendar dates or one-click age presets (> 30 days, > 6 months, > 1 year) right in the review screen.',
          'Save an optional readable backup on your computer before deleting any past work posts.',
          'Load your official LinkedIn data export to find and clean older shares, comments and reactions safely.',
        ],
        guideKey: 'guideLinkedin',
        guideLabel: 'Step-by-step LinkedIn guide',
      },
    ] as PlatformDetailItem[],
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
        href: 'https://nukeall.app/install/',
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
  homeSupport: {
    eyebrow: 'Built by one independent developer',
    title: 'Saved you $24/month? Keep NukeAll free with a coffee.',
    body: 'Other history-cleaning tools lock older posts behind $8–$24 monthly paywalls. NukeAll gives you everything unlimited and private for $0. Your support helps cover domain costs, fast fixes when platforms update, and new networks like Bluesky and Threads.',
    cta: 'Buy me a coffee',
    learnMore: 'See how your coffee helps',
  },
  sponsor: {
    eyebrow: 'Independent & community-funded',
    h1: 'Keep NukeAll free for everyone',
    intro: 'NukeAll is built by a single independent developer with zero ads, zero tracking, zero investor backing and zero paid subscriptions. When you clean years of posts without paying $8–$24/month elsewhere, buying a coffee directly keeps this project alive and maintained.',
    savingsNote: '100% of contributions go to maintenance, domain costs (`nukeall.app`) and new platform adapters.',
    bmcBtn: 'Buy me a coffee on Buy Me a Coffee',
    tiersTitle: 'Pick a coffee',
    tiersSubtitle: 'Every amount makes a real difference — one-time or monthly, no account required.',
    tiers: [
      {
        price: 5,
        name: '1 Coffee · Quick Thank You',
        perks: 'Helps keep nukeall.app online and says thanks for saving your timeline and privacy.',
        cta: 'Buy 1 coffee',
        featured: false,
        badge: '',
      },
      {
        price: 15,
        name: '3 Coffees · Keep Selectors Working',
        perks: 'Funds the hours needed whenever X, Instagram, Reddit or LinkedIn change their layouts and break buttons.',
        cta: 'Buy 3 coffees',
        featured: true,
        badge: 'Most helpful',
      },
      {
        price: 25,
        name: '5 Coffees · Build What’s Next',
        perks: 'Accelerates new platform support (Bluesky, Threads, Facebook, YouTube) and browser store reviews.',
        cta: 'Buy 5 coffees',
        featured: false,
        badge: '',
      },
    ],
    impactTitle: 'Where every coffee goes',
    impactItems: [
      { icon: '🛠️', title: 'Fast fixes when sites change', body: 'Social networks update their pages weekly. Support buys time to ship working fixes right away.' },
      { icon: '🌐', title: 'Domain & store fees', body: 'Covers the annual nukeall.app domain and official Chrome Web Store / browser extension publishing fees.' },
      { icon: '🚀', title: 'New platforms for free', body: 'Helps add Bluesky, Threads, Facebook and YouTube without ever putting features behind a paywall.' },
    ],
    wallTitle: 'Supporter wall',
    wallEmpty: 'Be the first supporter — your name can appear here.',
    otherTitle: 'Other free ways to help',
    other: [
      'Star the repository on GitHub.',
      'Report broken buttons when a platform changes its interface.',
      'Translate NukeAll into your language.',
      'Share NukeAll with a friend who wants a clean slate.',
    ],
    note: 'Opens buymeacoffee.com/inf0s33k directly — zero embedded widgets or third-party trackers on nukeall.app.',
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
      { title: 'Donations', body: ['Support buttons link directly to Buy Me a Coffee (buymeacoffee.com/inf0s33k). Buy Me a Coffee has its own privacy policy; no payment details ever touch nukeall.app.'] },
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
