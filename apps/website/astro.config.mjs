import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const ROUTE_PAIRS = [
  { en: 'https://nukeall.app/', tr: 'https://nukeall.app/tr/' },
  { en: 'https://nukeall.app/install/', tr: 'https://nukeall.app/tr/kurulum/' },
  { en: 'https://nukeall.app/faq/', tr: 'https://nukeall.app/tr/sss/' },
  { en: 'https://nukeall.app/compare/', tr: 'https://nukeall.app/tr/karsilastirma/' },
  { en: 'https://nukeall.app/privacy/', tr: 'https://nukeall.app/tr/gizlilik/' },
  { en: 'https://nukeall.app/sponsor/', tr: 'https://nukeall.app/tr/destek/' },
  { en: 'https://nukeall.app/delete-all-tweets/', tr: 'https://nukeall.app/tr/tum-tweetleri-silme/' },
  { en: 'https://nukeall.app/delete-instagram-comments/', tr: 'https://nukeall.app/tr/instagram-yorumlari-toplu-silme/' },
  { en: 'https://nukeall.app/delete-instagram-dm/', tr: 'https://nukeall.app/tr/instagram-dm-mesaj-silme/' },
  { en: 'https://nukeall.app/delete-reddit-comments/', tr: 'https://nukeall.app/tr/reddit-yorum-silme/' },
  { en: 'https://nukeall.app/delete-linkedin-posts/', tr: 'https://nukeall.app/tr/linkedin-eski-gonderi-silme/' },
];

export default defineConfig({
  site: 'https://nukeall.app',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          tr: 'tr',
        },
      },
      filter: (page) => !page.endsWith('/404/'),
      serialize(item) {
        const pair = ROUTE_PAIRS.find((p) => p.en === item.url || p.tr === item.url);
        if (pair) {
          item.links = [
            { lang: 'en', url: pair.en },
            { lang: 'tr', url: pair.tr },
            { lang: 'x-default', url: pair.en },
          ];
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
