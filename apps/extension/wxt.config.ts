import { defineConfig } from 'wxt';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

// NukeAll: privacy by construction.
// - Only host permissions for supported platforms.
// - Extension pages may not connect anywhere except the extension itself.
export default defineConfig({
  srcDir: '.',
  outDir: '.output',
  vite: () => ({
    plugins: [preact(), tailwindcss()],
  }),
  manifest: ({ browser }) => ({
    name: '__MSG_extName__',
    short_name: 'NukeAll',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    homepage_url: 'https://nukeall.app',
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
    permissions: [
      'storage',
      'unlimitedStorage',
      'tabs',
      ...(browser === 'firefox' ? [] : ['sidePanel']),
    ],
    host_permissions: [
      '*://x.com/*',
      '*://twitter.com/*',
      '*://*.x.com/*',
      '*://*.twitter.com/*',
      '*://abs.twimg.com/*',
      '*://instagram.com/*',
      '*://*.instagram.com/*',
      '*://reddit.com/*',
      '*://*.reddit.com/*',
      '*://linkedin.com/*',
      '*://*.linkedin.com/*',
    ],
    action: {
      default_title: '__MSG_extName__',
    },
    content_security_policy: {
      extension_pages:
        "script-src 'self'; object-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'",
    },
    ...(browser === 'firefox'
      ? {
          sidebar_action: {
            default_title: 'NukeAll',
            default_panel: 'sidepanel.html',
            default_icon: {
              16: 'icon/16.png',
              32: 'icon/32.png',
            },
          },
          browser_specific_settings: {
            gecko: {
              id: 'nukeall@nukeall.app',
              strict_min_version: '142.0',
              data_collection_permissions: { required: ['none'] },
            },
          },
        }
      : {
          side_panel: {
            default_path: 'sidepanel.html',
          },
        }),
  }),
});
