export type UiLang = 'en' | 'tr';

export interface UiDict {
  appName: string;
  tagline: string;
  localBadge: string;
  closePanel: string;
  closePanelTitle: string;
  warningTitle: string;
  warningBody: string;
  warningAccept: string;
  tabs: {
    scan: string;
    archive: string;
    review: string;
    viewer: string;
    settings: string;
  };
  platform: {
    label: string;
    xLive: string;
    igLive: string;
    redditLive: string;
    linkedinLive: string;
  };
  scan: {
    openHintX: string;
    openHintInstagram: string;
    openHintReddit: string;
    openHintLinkedIn: string;
    scanBtnX: string;
    scanBtnInstagram: string;
    scanBtnReddit: string;
    scanBtnLinkedIn: string;
    stopScanBtn: string;
    scanning: string;
    navigating: string;
    scanningCount: string;
    maxItems: string;
    maxItemsHelp: string;
    noItemsFound: string;
    igOpenChatHint: string;
    foundLabel: string;
    typesLabel: string;
    types: {
      post: string;
      reply: string;
      repost: string;
      quote: string;
      like: string;
      bookmark: string;
      comment: string;
      message: string;
    };
  };
  archive: {
    titleX: string;
    descX: string;
    pickFileX: string;
    titleInstagram: string;
    descInstagram: string;
    pickFileInstagram: string;
    titleReddit: string;
    descReddit: string;
    pickFileReddit: string;
    titleLinkedIn: string;
    descLinkedIn: string;
    pickFileLinkedIn: string;
    handleLabel: string;
    importedMsg: string;
    parseError: string;
  };
  filters: {
    presetLabel: string;
    customPreset: string;
    importPreset: string;
    exportPreset: string;
    olderThanDays: string;
    dateRangeLabel: string;
    fromDate: string;
    toDate: string;
    chip30d: string;
    chip6m: string;
    chip1y: string;
    clearDates: string;
    includeKw: string;
    excludeKw: string;
    regex: string;
    media: string;
    mediaAny: string;
    mediaWith: string;
    mediaWithout: string;
    onlyRisky: string;
    keepPinned: string;
    minLikes: string;
    keepTag: string;
  };
  review: {
    searchPlaceholder: string;
    selectedCount: string;
    matchedCount: string;
    protectedCount: string;
    selectAllFiltered: string;
    clearSelection: string;
    protectToggle: string;
    protectedBadge: string;
    backupFirst: string;
    exportJson: string;
    exportCsv: string;
    exportHtml: string;
    deleteBtn: string;
    countdownMsg: string;
    cancelCountdown: string;
    empty: string;
  };
  job: {
    running: string;
    paused: string;
    waiting: string;
    done: string;
    stopped: string;
    error: string;
    pause: string;
    resume: string;
    stop: string;
    resumeSaved: string;
    clearSaved: string;
    reportHtml: string;
    reportJson: string;
    supportBanner: string;
    supportCta: string;
    dismiss: string;
  };
  viewer: {
    title: string;
    empty: string;
    clearDb: string;
    exportOfflineHtml: string;
    itemsInDb: string;
  };
  settings: {
    speed: string;
    speedSafe: string;
    speedNormal: string;
    speedFast: string;
    dailyLimit: string;
    dailyLimitHelp: string;
    deletedToday: string;
    redditSection: string;
    redditPasses: string;
    redditPassesHelp: string;
    redditCustomText: string;
    redditCustomTextPlaceholder: string;
    redditEditOnly: string;
    language: string;
    privacyNote: string;
  };
  risk: {
    profanity: string;
    email: string;
    phone: string;
    iban: string;
    tckn: string;
    card: string;
    late_night: string;
    custom: string;
  };
  popup: {
    openPanel: string;
    status: string;
    activeTab: string;
    openX: string;
    githubLink: string;
    siteLink: string;
  };
}

export const enUi: UiDict = {
  appName: 'NukeAll',
  tagline: 'Local-only history cleaner',
  localBadge: '100% Local · Zero telemetry',
  closePanel: 'Close',
  closePanelTitle: 'Close NukeAll panel',
  warningTitle: 'Safety & platform notice',
  warningBody:
    'Only your own content is ever targeted. Platforms discourage fast automation — keep Safe speed enabled and export a manual backup before deleting if you want to keep a copy. Deletion is permanent.',
  warningAccept: 'I understand, continue',
  tabs: {
    scan: 'Scan',
    archive: 'Archive Import',
    review: 'Review Grid',
    viewer: 'Offline Archive',
    settings: 'Settings',
  },
  platform: {
    label: 'Platform',
    xLive: 'X (Twitter)',
    igLive: 'Instagram',
    redditLive: 'Reddit',
    linkedinLive: 'LinkedIn',
  },
  scan: {
    openHintX:
      'Pick one content type and click Scan — NukeAll automatically opens the right X page (Replies, Likes, Bookmarks) and scrolls for you.',
    openHintInstagram:
      'Pick one content type (Comments, Likes, Posts or Chat Messages DM) and click Scan — NukeAll automatically opens the right Instagram page and scans your own items.',
    openHintReddit:
      'Pick Comments or Posts and click Scan — NukeAll automatically opens your Reddit profile and loads your history via your active session.',
    openHintLinkedIn:
      'Pick Posts, Comments or Likes and click Scan — NukeAll automatically opens your LinkedIn activity stream and scans safely.',
    scanBtnX: 'Go to X & Scan',
    scanBtnInstagram: 'Go to Instagram & Scan',
    scanBtnReddit: 'Go to Reddit & Scan',
    scanBtnLinkedIn: 'Go to LinkedIn & Scan',
    stopScanBtn: 'Stop scan',
    scanning: 'Scanning…',
    navigating: 'Opening {url}…',
    scanningCount: 'Scanning… {n} items found',
    maxItems: 'Scan limit (0 = scan all)',
    maxItemsHelp: 'Max items to collect during this scan. Leave 0 to scroll until the end.',
    noItemsFound: 'No matching items found. Make sure you are logged into the selected platform.',
    igOpenChatHint: 'Instagram Direct opened. Click the chat you want to clean, then press Scan again.',
    foundLabel: 'Scanned items',
    typesLabel: 'Content type to scan (single pick)',
    types: {
      post: 'Posts',
      reply: 'Replies (Comments)',
      repost: 'Reposts',
      quote: 'Quotes',
      like: 'Likes',
      bookmark: 'Bookmarks',
      comment: 'Comments',
      message: 'Chat Messages (DM)',
    },
  },
  archive: {
    titleX: 'Import X Data Archive',
    descX: 'Upload tweets.js or like.js from your official X archive to delete history past the 3,200-tweet timeline limit. Parsed strictly inside your browser.',
    pickFileX: 'Choose tweets.js / like.js',
    titleInstagram: 'Import Instagram Data Archive (JSON)',
    descInstagram: 'Upload post_comments_1.json, reels_comments.json, liked_posts.json, posts_1.json or message_1.json from your Meta data download. Turkish UTF-8 characters are fixed automatically.',
    pickFileInstagram: 'Choose Instagram .json file',
    titleReddit: 'Import Reddit Data Archive (CSV)',
    descReddit: 'Upload comments.csv or posts.csv from your official Reddit data request to bypass the 1,000-item profile limit.',
    pickFileReddit: 'Choose comments.csv / posts.csv',
    titleLinkedIn: 'Import LinkedIn Data Archive (CSV)',
    descLinkedIn: 'Upload Shares.csv, Comments.csv or Reactions.csv from your official LinkedIn data export to filter and delete old posts by date.',
    pickFileLinkedIn: 'Choose Shares.csv / Comments.csv',
    handleLabel: 'Your X @handle (for links)',
    importedMsg: 'Imported items:',
    parseError: 'Could not parse archive file:',
  },
  filters: {
    presetLabel: 'Preset',
    customPreset: 'Custom filters',
    importPreset: 'Import JSON',
    exportPreset: 'Export JSON',
    olderThanDays: 'Older than (days)',
    dateRangeLabel: 'Date filter',
    fromDate: 'From date',
    toDate: 'To date',
    chip30d: '> 30d',
    chip6m: '> 6m',
    chip1y: '> 1y',
    clearDates: 'Clear',
    includeKw: 'Include keywords (comma)',
    excludeKw: 'Exclude keywords (comma)',
    regex: 'Regex filter',
    media: 'Media',
    mediaAny: 'Any',
    mediaWith: 'With media',
    mediaWithout: 'Text only',
    onlyRisky: 'Only flagged risky items',
    keepPinned: 'Keep pinned posts',
    minLikes: 'Keep if likes ≥',
    keepTag: 'Keep text containing',
  },
  review: {
    searchPlaceholder: 'Search scanned text…',
    selectedCount: 'Selected',
    matchedCount: 'Matched',
    protectedCount: 'Protected',
    selectAllFiltered: 'Select all matched',
    clearSelection: 'Clear selection',
    protectToggle: 'Protect',
    protectedBadge: 'Protected',
    backupFirst: 'Optional manual backup:',
    exportJson: 'JSON',
    exportCsv: 'CSV',
    exportHtml: 'Offline HTML',
    deleteBtn: 'Delete {n} items',
    countdownMsg: 'Deletion starting in {s}s…',
    cancelCountdown: 'Cancel now',
    empty: 'No items match the current filters. Scan a tab or import an archive first.',
  },
  job: {
    running: 'Deleting…',
    paused: 'Paused',
    waiting: 'Rate-limit pause (auto-resuming)…',
    done: 'Completed',
    stopped: 'Stopped',
    error: 'Error',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    resumeSaved: 'Resume unfinished run ({n} left)',
    clearSaved: 'Discard saved job',
    reportHtml: 'Deletion Report (HTML)',
    reportJson: 'Report (JSON)',
    supportBanner: '☕ NukeAll saved your history cleanly and cost $0. Support open-source maintenance?',
    supportCta: 'Sponsor on GitHub / Ko-fi',
    dismiss: 'Dismiss',
  },
  viewer: {
    title: 'Local IndexedDB Archive',
    empty: 'Local archive is empty. Scan your timeline or import tweets.js.',
    clearDb: 'Clear local archive',
    exportOfflineHtml: 'Export Offline HTML Archive',
    itemsInDb: 'Items cached locally:',
  },
  settings: {
    speed: 'Deletion speed',
    speedSafe: 'Safe (3–6s random delay · recommended)',
    speedNormal: 'Normal (1.5–3s)',
    speedFast: 'Fast (0.7–1.5s · higher rate-limit risk)',
    dailyLimit: 'Daily deletion limit (account safety)',
    dailyLimitHelp: 'Max items NukeAll will delete per 24h to avoid rate limits. Set 0 for unlimited.',
    deletedToday: 'Deleted today: {n}',
    redditSection: 'Reddit overwrite before delete',
    redditPasses: 'Overwrite passes (0–3)',
    redditPassesHelp: 'Edits each comment/post with random text before deleting to poison scrapers.',
    redditCustomText: 'Custom overwrite text (optional)',
    redditCustomTextPlaceholder: 'Leave empty for random words each pass',
    redditEditOnly: 'Overwrite only (do not delete yet)',
    language: 'Language',
    privacyNote: 'CSP enforces connect-src \'self\'. Network traffic only touches the active platform tab.',
  },
  risk: {
    profanity: 'Profanity',
    email: 'Email',
    phone: 'Phone',
    iban: 'IBAN',
    tckn: 'TC ID',
    card: 'Card',
    late_night: 'Late night',
    custom: 'Keyword',
  },
  popup: {
    openPanel: 'Open NukeAll Panel',
    status: 'Current run',
    activeTab: 'Active tab',
    openX: 'Open x.com',
    githubLink: 'GitHub',
    siteLink: 'nukeall.app',
  },
};

export const trUi: UiDict = {
  appName: 'NukeAll',
  tagline: 'Tamamen yerel geçmiş temizleyici',
  localBadge: '%100 Yerel · Sıfır telemetri',
  closePanel: 'Kapat',
  closePanelTitle: 'NukeAll panelini kapat',
  warningTitle: 'Güvenlik ve platform uyarısı',
  warningBody:
    'Yalnızca kendi içeriklerin hedeflenir. Platformlar hızlı otomasyonu kısıtlayabilir — Güvenli hızda kal. Yedek saklamak istersen silmeden önce İncele ekranından elle indirebilirsin. Silme işlemi geri alınamaz.',
  warningAccept: 'Anladım, devam et',
  tabs: {
    scan: 'Tara',
    archive: 'Arşiv Yükle',
    review: 'İncele & Sil',
    viewer: 'Yerel Arşiv',
    settings: 'Ayarlar',
  },
  platform: {
    label: 'Platform',
    xLive: 'X (Twitter)',
    igLive: 'Instagram',
    redditLive: 'Reddit',
    linkedinLive: 'LinkedIn',
  },
  scan: {
    openHintX:
      'Tek bir içerik türü seç ve Tara’ya bas — NukeAll x.com’da ilgili sayfaya (Yanıtlar, Beğeniler, Yer İmleri) otomatik gidip kaydırarak tarar.',
    openHintInstagram:
      'Tek bir içerik türü seç (Yorumlar, Beğeniler, Gönderiler veya Sohbet Mesajları DM) ve Tara’ya bas — NukeAll Instagram’da ilgili sayfaya otomatik gider.',
    openHintReddit:
      'Yorumlar veya Gönderiler’i seçip Tara’ya bas — NukeAll Reddit profilini açıp açık oturumundan geçmişini çeker.',
    openHintLinkedIn:
      'Gönderiler, Yorumlar veya Beğeniler’i seçip Tara’ya bas — NukeAll LinkedIn aktivite sayfana otomatik gidip güvenle tarar.',
    scanBtnX: 'X’te Otomatik Git & Tara',
    scanBtnInstagram: 'Instagram’a Git & Tara',
    scanBtnReddit: 'Reddit’e Git & Tara',
    scanBtnLinkedIn: 'LinkedIn’e Git & Tara',
    stopScanBtn: 'Taramayı Durdur',
    scanning: 'Taranıyor…',
    navigating: 'Sayfaya gidiliyor: {url}',
    scanningCount: 'Taranıyor… {n} öğe bulundu',
    maxItems: 'Tarama limiti (0 = tümünü tara)',
    maxItemsHelp: 'Bu taramada en fazla kaç öğe toplansın? 0 bırakırsan zaman çizelgesinin sonuna kadar tarar.',
    noItemsFound: 'Seçili türde öğe bulunamadı. İlgili platformda oturum açık olduğundan emin ol.',
    igOpenChatHint: 'Instagram DM açıldı! Mesajlarını silmek istediğin sohbeti aç ve tekrar Tara’ya bas.',
    foundLabel: 'Taranan öğe',
    typesLabel: 'Taranacak içerik türü (tek seçim)',
    types: {
      post: 'Gönderiler',
      reply: 'Yanıtlar (Yorumlar)',
      repost: 'Repostlar',
      quote: 'Alıntılar',
      like: 'Beğeniler',
      bookmark: 'Yer imleri',
      comment: 'Yorumlar',
      message: 'Sohbet Mesajları (DM)',
    },
  },
  archive: {
    titleX: 'X Veri Arşivi İçe Aktar',
    descX: '3.200 tweet sınırını aşmak için resmi X arşivindeki tweets.js veya like.js dosyasını yükle. Dosya yalnızca tarayıcının içinde işlenir.',
    pickFileX: 'tweets.js / like.js seç',
    titleInstagram: 'Instagram Veri Arşivi İçe Aktar (JSON)',
    descInstagram: 'Meta veri indirmesindeki post_comments_1.json, reels_comments.json, liked_posts.json, posts_1.json veya message_1.json dosyasını yükle. Türkçe karakter bozulmaları otomatik düzeltilir.',
    pickFileInstagram: 'Instagram .json dosyası seç',
    titleReddit: 'Reddit Veri Arşivi İçe Aktar (CSV)',
    descReddit: '1.000 öğe profil sınırını aşmak için resmi Reddit veri talebindeki comments.csv veya posts.csv dosyasını yükle.',
    pickFileReddit: 'comments.csv / posts.csv seç',
    titleLinkedIn: 'LinkedIn Veri Arşivi İçe Aktar (CSV)',
    descLinkedIn: 'Resmi LinkedIn veri dışa aktarımındaki Shares.csv, Comments.csv veya Reactions.csv dosyasını yükle; tarih seçip eski gönderilerini sil.',
    pickFileLinkedIn: 'Shares.csv / Comments.csv seç',
    handleLabel: 'X @kullanıcıAdın (linkler için)',
    importedMsg: 'İçe aktarılan öğe:',
    parseError: 'Arşiv dosyası okunamadı:',
  },
  filters: {
    presetLabel: 'Hazır profil',
    customPreset: 'Özel filtreler',
    importPreset: 'JSON Yükle',
    exportPreset: 'JSON Kaydet',
    olderThanDays: 'Şundan eski (gün)',
    dateRangeLabel: 'Tarih filtresi',
    fromDate: 'Başlangıç tarihi',
    toDate: 'Bitiş tarihi',
    chip30d: '30 g+',
    chip6m: '6 ay+',
    chip1y: '1 yıl+',
    clearDates: 'Sıfırla',
    includeKw: 'İçeren kelimeler (virgüllü)',
    excludeKw: 'Hariç tutulanlar (virgüllü)',
    regex: 'Regex filtresi',
    media: 'Medya',
    mediaAny: 'Hepsi',
    mediaWith: 'Medyalı',
    mediaWithout: 'Sadece metin',
    onlyRisky: 'Sadece riskli işaretlenenler',
    keepPinned: 'Sabitlenenleri koru',
    minLikes: 'Beğenisi ≥ ise koru',
    keepTag: 'Bu kelime varsa koru',
  },
  review: {
    searchPlaceholder: 'Taranan metinlerde ara…',
    selectedCount: 'Seçili',
    matchedCount: 'Eşleşen',
    protectedCount: 'Korunan',
    selectAllFiltered: 'Eşleşenlerin tümünü seç',
    clearSelection: 'Seçimi temizle',
    protectToggle: 'Koru',
    protectedBadge: 'Korunuyor',
    backupFirst: 'İsteğe bağlı manuel yedek:',
    exportJson: 'JSON',
    exportCsv: 'CSV',
    exportHtml: 'Çevrimdışı HTML',
    deleteBtn: '{n} öğeyi sil',
    countdownMsg: 'Silme işlemi {s} sn içinde başlıyor…',
    cancelCountdown: 'İptal et',
    empty: 'Bu filtrelere uyan öğe yok. Önce bir tarama yap veya arşiv yükle.',
  },
  job: {
    running: 'Siliniyor…',
    paused: 'Duraklatıldı',
    waiting: 'Hız limiti beklemesi (otomatik devam edecek)…',
    done: 'Tamamlandı',
    stopped: 'Durduruldu',
    error: 'Hata',
    pause: 'Duraklat',
    resume: 'Devam et',
    stop: 'Durdur',
    resumeSaved: 'Yarım kalan görevi sürdür ({n} kaldı)',
    clearSaved: 'Kayıtlı görevi temizle',
    reportHtml: 'Silme Raporu (HTML)',
    reportJson: 'Rapor (JSON)',
    supportBanner: '☕ NukeAll geçmişini ücretsiz temizledi. Açık kaynak geliştirmeyi desteklemek ister misin?',
    supportCta: 'GitHub / Ko-fi ile Destek Ol',
    dismiss: 'Kapat',
  },
  viewer: {
    title: 'Yerel IndexedDB Arşivi',
    empty: 'Yerel arşiv boş. Zaman çizelgeni tara veya tweets.js yükle.',
    clearDb: 'Yerel arşivi temizle',
    exportOfflineHtml: 'Çevrimdışı HTML Arşivi İndir',
    itemsInDb: 'Yerelde saklanan öğe:',
  },
  settings: {
    speed: 'Silme hızı',
    speedSafe: 'Güvenli (3–6 sn rastgele gecikme · önerilen)',
    speedNormal: 'Normal (1.5–3 sn)',
    speedFast: 'Hızlı (0.7–1.5 sn · yüksek kısıtlama riski)',
    dailyLimit: 'Günlük silme limiti (hesap koruması)',
    dailyLimitHelp: 'X kısıtlamasını önlemek için 24 saatte silinecek en fazla öğe sayısı. 0 = limitsiz.',
    deletedToday: 'Bugün silinen: {n}',
    redditSection: 'Reddit: silmeden önce üzerine yazma',
    redditPasses: 'Üzerine yazma turu (0–3)',
    redditPassesHelp: 'Arşiv sitelerini temizlemek için yorum/gönderiyi silmeden önce rastgele metinle düzenler.',
    redditCustomText: 'Özel üzerine yazma metni (isteğe bağlı)',
    redditCustomTextPlaceholder: 'Boş bırakırsan her turda rastgele kelimeler yazar',
    redditEditOnly: 'Sadece üzerine yaz (henüz silme)',
    language: 'Dil',
    privacyNote: 'CSP connect-src \'self\' kuralı aktiftir. Ağ istekleri yalnızca açık platform sekmesine gider.',
  },
  risk: {
    profanity: 'Küfür',
    email: 'E-posta',
    phone: 'Telefon',
    iban: 'IBAN',
    tckn: 'TC Kimlik',
    card: 'Kart No',
    late_night: 'Gece saati',
    custom: 'Kelime',
  },
  popup: {
    openPanel: 'NukeAll Panelini Aç',
    status: 'Aktif işlem',
    activeTab: 'Açık sekme',
    openX: 'x.com aç',
    githubLink: 'GitHub',
    siteLink: 'nukeall.app',
  },
};

export function resolveUiLang(pref: 'auto' | 'en' | 'tr'): UiLang {
  if (pref === 'en' || pref === 'tr') return pref;
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('tr')) {
    return 'tr';
  }
  return 'en';
}

export function getUiDict(lang: UiLang): UiDict {
  return lang === 'tr' ? trUi : enUi;
}
