(() => {
  const banner = document.getElementById('lang-banner');
  if (!banner) return;
  try {
    if (localStorage.getItem('nukeall_lang_banner_dismissed') === '1') return;
    const pref = (navigator.language || '').toLowerCase();
    const htmlLang = document.documentElement.lang;
    if (htmlLang === 'en' && pref.startsWith('tr')) {
      banner.classList.remove('hidden');
    } else if (htmlLang === 'tr' && !pref.startsWith('tr') && pref.startsWith('en')) {
      banner.classList.remove('hidden');
    }
    const dismiss = document.getElementById('lang-banner-dismiss');
    if (dismiss) {
      dismiss.addEventListener('click', () => {
        banner.classList.add('hidden');
        try {
          localStorage.setItem('nukeall_lang_banner_dismissed', '1');
        } catch {
          // ignore storage errors
        }
      });
    }
  } catch {
    // ignore
  }
})();
