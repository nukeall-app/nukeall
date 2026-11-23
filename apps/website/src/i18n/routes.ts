import { en } from './en';
import { tr } from './tr';
import { SITE_URL } from '../config';

export const locales = ['en', 'tr'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';

export type PageKey =
  | 'home'
  | 'install'
  | 'faq'
  | 'compare'
  | 'privacy'
  | 'sponsor'
  | 'guideTweets'
  | 'guideXLikes'
  | 'guideIgComments'
  | 'guideIgLikes'
  | 'guideIgDm'
  | 'guideReddit'
  | 'guideRedditPosts'
  | 'guideLinkedin'
  | 'guideSocialWipe'
  | 'notFound';

/** Page equivalents across languages — used for hreflang and the language switcher. */
export const routes: Record<PageKey, Record<Lang, string>> = {
  home: { en: '/', tr: '/tr/' },
  install: { en: '/install/', tr: '/tr/kurulum/' },
  faq: { en: '/faq/', tr: '/tr/sss/' },
  compare: { en: '/compare/', tr: '/tr/karsilastirma/' },
  privacy: { en: '/privacy/', tr: '/tr/gizlilik/' },
  sponsor: { en: '/sponsor/', tr: '/tr/destek/' },
  guideTweets: { en: '/delete-all-tweets/', tr: '/tr/tum-tweetleri-silme/' },
  guideXLikes: { en: '/delete-all-x-likes/', tr: '/tr/twitter-tum-begenileri-silme/' },
  guideIgComments: { en: '/delete-instagram-comments/', tr: '/tr/instagram-yorumlari-toplu-silme/' },
  guideIgLikes: { en: '/delete-instagram-likes/', tr: '/tr/instagram-tum-begenileri-silme/' },
  guideIgDm: { en: '/delete-instagram-dm/', tr: '/tr/instagram-dm-mesaj-silme/' },
  guideReddit: { en: '/delete-reddit-comments/', tr: '/tr/reddit-yorum-silme/' },
  guideRedditPosts: { en: '/delete-all-reddit-posts/', tr: '/tr/reddit-tum-postlari-silme/' },
  guideLinkedin: { en: '/delete-linkedin-posts/', tr: '/tr/linkedin-eski-gonderi-silme/' },
  guideSocialWipe: { en: '/wipe-social-media-history/', tr: '/tr/sosyal-medya-gecmisi-silme/' },
  notFound: { en: '/404', tr: '/404' },
};

export const dicts = { en, tr } as const;

export function t(lang: Lang) {
  return dicts[lang];
}

export function path(page: PageKey, lang: Lang): string {
  return routes[page][lang];
}

export function absUrl(p: string): string {
  return new URL(p, SITE_URL).href;
}
