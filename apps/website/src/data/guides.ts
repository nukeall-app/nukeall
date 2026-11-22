import { absUrl, path, t, type Lang, type PageKey } from '../i18n/routes';

export type GuideKey =
  | 'guideTweets'
  | 'guideIgComments'
  | 'guideIgDm'
  | 'guideReddit'
  | 'guideLinkedin';

export const GUIDE_KEYS: GuideKey[] = [
  'guideTweets',
  'guideIgComments',
  'guideIgDm',
  'guideReddit',
  'guideLinkedin',
];

export interface GuideStep {
  title: string;
  body: string;
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideLocaleContent {
  navLabel: string;
  eyebrow: string;
  h1: string;
  lead: string;
  highlights: { title: string; body: string }[];
  stepsTitle: string;
  steps: GuideStep[];
  tipTitle: string;
  tipBody: string;
  faqTitle: string;
  faqs: GuideFaq[];
  moreGuidesTitle: string;
}

export const guides: Record<GuideKey, Record<Lang, GuideLocaleContent>> = {
  guideTweets: {
    en: {
      navLabel: 'Delete All Tweets (X)',
      eyebrow: 'X (Twitter) Guide · 100% Local & Free',
      h1: 'How to Delete All Tweets, Replies & Likes for Free',
      lead:
        'Wipe your X (formerly Twitter) timeline, replies, reposts, likes and bookmarks directly inside your browser without 30-day paywalls, external servers or sharing API keys.',
      highlights: [
        {
          title: 'Bypass the 3,200 Limit',
          body: 'Live timelines cap around 3,200 posts. Upload tweets.js or like.js from your official X Data Archive inside your browser to delete years-old history.',
        },
        {
          title: 'Date Range & Keyword Filters',
          body: 'Select From / To dates, use one-click > 30d, > 6m or > 1y presets, or flag old profanity, phone numbers and IBANs locally before deleting.',
        },
        {
          title: 'Protect Important Posts',
          body: 'Automatically keep pinned tweets, high-engagement posts above a chosen like count, or any post tagged with #keep.',
        },
      ],
      stepsTitle: 'Step-by-step: Bulk delete X history',
      steps: [
        {
          title: 'Install NukeAll and open the side panel',
          body: 'Install NukeAll on Firefox, Chrome, Edge or Brave, open x.com in an active tab, and click the NukeAll icon to open the side panel.',
        },
        {
          title: 'Pick one content type and click Scan',
          body: 'Choose Replies, Posts, Reposts, Quotes, Likes or Bookmarks in the X (Twitter) tab and click Go to X & Scan. NukeAll automatically opens the right X page and reads GraphQL responses passively as it scrolls.',
        },
        {
          title: 'Or upload tweets.js / like.js for full history',
          body: 'Open the Archive Import tab and drop your official X tweets.js or like.js file. Parsing happens strictly in memory inside your browser — nothing is uploaded anywhere.',
        },
        {
          title: 'Filter by date, back up if desired, and delete',
          body: 'Narrow items in Review Grid by date picker or search, optionally download a single-file JSON/CSV/HTML backup, and start deletion with a 10-second cancel countdown and Safe speed throttling.',
        },
      ],
      tipTitle: 'Archive tip & account safety',
      tipBody:
        'Keep the default Safe speed (3–6s random delay) and daily limit enabled. If X temporarily rate-limits requests, NukeAll pauses automatically and resumes cleanly from its saved checkpoint.',
      faqTitle: 'X (Twitter) deletion FAQ',
      faqs: [
        {
          q: 'Is there any tweet count or 30-day paywall?',
          a: 'No. NukeAll is GPL-3.0-or-later open source software with zero paywalls, zero subscriptions and zero limits on how many tweets or likes you can delete.',
        },
        {
          q: 'Can NukeAll delete likes on X after X made likes private?',
          a: 'Yes. Because NukeAll runs inside your own logged-in browser session on x.com, it reads your own /likes tab passively and unlikes items without needing third-party OAuth tokens.',
        },
        {
          q: 'How do I delete tweets older than 3,200 posts?',
          a: 'Request your X archive from Settings → Your Account → Download an archive of your data, unzip it, and load data/tweets.js into NukeAll’s Archive Import tab.',
        },
      ],
      moreGuidesTitle: 'Other platform cleanup guides',
    },
    tr: {
      navLabel: 'Tüm Tweetleri Silme (X)',
      eyebrow: 'X (Twitter) Rehberi · %100 Yerel ve Ücretsiz',
      h1: 'Tüm Tweetleri, Yanıtları ve Beğenileri Ücretsiz Silme Rehberi',
      lead:
        'X (Twitter) zaman çizelgeni, yanıtlarını, repostlarını, beğenilerini ve yer imlerini ücretli 30 gün sınırına takılmadan ve şifreni üçüncü taraf sunuculara vermeden doğrudan tarayıcının içinde temizle.',
      highlights: [
        {
          title: '3.200 Tweet Sınırını Aş',
          body: 'Canlı zaman çizelgesi yaklaşık 3.200 öğeyle sınırlıdır. Resmi X arşivindeki tweets.js veya like.js dosyasını yükleyerek yıllar öncesini silebilirsin.',
        },
        {
          title: 'Tarih Seçici & Yerel Risk Taraması',
          body: 'Başlangıç/bitiş tarihi seç veya > 30 gün / > 6 ay / > 1 yıl butonlarını kullan; küfür, telefon, IBAN ve TCKN içeren eski gönderileri yerelde tespit et.',
        },
        {
          title: 'Önemli Gönderileri Koru',
          body: 'Sabitlenmiş tweetleri, belirlediğin beğeni sayısının üzerindeki gönderileri veya #keep kelimesi geçen içerikleri otomatik hariç tut.',
        },
      ],
      stepsTitle: 'Adım adım: X geçmişini toplu silme',
      steps: [
        {
          title: 'NukeAll eklentisini kur ve paneli aç',
          body: 'Firefox, Chrome, Edge veya Brave tarayıcına NukeAll’u kur, x.com sekmesini açık tut ve eklenti simgesinden yan paneli aç.',
        },
        {
          title: 'Tek içerik türü seçip Tara’ya bas',
          body: 'X (Twitter) sekmesinde Yanıtlar, Gönderiler, Repostlar, Alıntılar, Beğeniler veya Yer İmleri arasından birini seç ve X’te Otomatik Git & Tara butonuna tıkla.',
        },
        {
          title: 'Tüm arşiv için tweets.js / like.js yükle',
          body: 'Arşiv Yükle sekmesinden resmi X veri arşivindeki tweets.js veya like.js dosyasını seç. Dosya tamamen tarayıcının belleğinde işlenir, dışarı veri gönderilmez.',
        },
        {
          title: 'Tarihe göre filtrele, isteğe bağlı yedek al ve sil',
          body: 'İncele & Sil sekmesinde tarih seçiciyle aralığı daralt, dilersen JSON/CSV/Çevrimdışı HTML yedek indir ve 10 saniyelik geri sayım ile güvenli hızda silmeyi başlat.',
        },
      ],
      tipTitle: 'Arşiv ipucu ve hesap güvenliği',
      tipBody:
        'Varsayılan Güvenli hız (3–6 sn rastgele bekleme) ve günlük limit korumasını açık bırak. X geçici hız limiti uygularsa NukeAll otomatik bekleyip kaldığı noktadan devam eder.',
      faqTitle: 'X (Twitter) silme hakkında sık sorulanlar',
      faqs: [
        {
          q: 'Günlük tweet limiti veya abonelik ücreti var mı?',
          a: 'Hayır. NukeAll GPL-3.0-or-later açık kaynak lisanslıdır; ücretli sürüm, kredi veya yapay 30 gün kısıtı bulunmaz.',
        },
        {
          q: 'X beğenileri gizledikten sonra bile beğeniler silinebiliyor mu?',
          a: 'Evet. NukeAll üçüncü taraf sunucu yerine doğrudan tarayıcındaki açık x.com oturumunu kullandığı için kendi beğeniler sekmeni güvenle tarayıp geri alabilir.',
        },
        {
          q: '3.200’den fazla eski tweetimi nasıl silerim?',
          a: 'X Ayarlar → Hesabın → Verilerinin arşivini indir adımından arşivini al ve içindeki data/tweets.js dosyasını NukeAll Arşiv Yükle sekmesine yükle.',
        },
      ],
      moreGuidesTitle: 'Diğer platform temizleme rehberleri',
    },
  },
  guideIgComments: {
    en: {
      navLabel: 'Instagram Comments & Likes',
      eyebrow: 'Instagram Guide · Zero Password Sharing',
      h1: 'How to Bulk Delete Instagram Comments & Likes Safely',
      lead:
        'Clean up years of Instagram comments, likes and posts using your own logged-in browser session on instagram.com — never hand over your password or 2FA code to shady cleaner apps.',
      highlights: [
        {
          title: 'Never Give Your Password',
          body: 'Third-party mobile cleaner apps ask you to log in on their servers and routinely trigger account locks. NukeAll runs locally inside your existing browser tab.',
        },
        {
          title: 'Meta JSON Export + UTF-8 Fix',
          body: 'Import post_comments_1.json, reels_comments.json, liked_posts.json or posts_1.json — NukeAll automatically repairs Meta’s broken Latin-1 UTF-8 escaping.',
        },
        {
          title: 'Your Activity Automation',
          body: 'Automatically opens Instagram’s Your Activity sections (Comments, Likes, Posts), collects items passively, and cleans them using Instagram-safe delays.',
        },
      ],
      stepsTitle: 'Step-by-step: Clean Instagram comments & likes',
      steps: [
        {
          title: 'Open instagram.com and NukeAll',
          body: 'Sign in on instagram.com in your desktop browser, then open the NukeAll side panel and select Instagram from the platform bar.',
        },
        {
          title: 'Choose Comments, Likes or Posts and Scan',
          body: 'Pick one interaction type and press Go to Instagram & Scan. NukeAll navigates to your Your Activity view and captures items via Bloks/GraphQL + DOM readers.',
        },
        {
          title: 'Or load Meta’s JSON archive',
          body: 'If you downloaded your Instagram information in JSON format via Meta Accounts Center, upload post_comments_1.json or liked_posts.json in Archive Import to filter offline first.',
        },
        {
          title: 'Filter by keyword or date and delete safely',
          body: 'Review matched items, exclude any memories you want to keep, export an optional offline backup, and let NukeAll delete at Safe speed.',
        },
      ],
      tipTitle: 'Why Meta JSON looks garbled in other tools (and not here)',
      tipBody:
        'Meta exports non-ASCII characters (like Turkish letters ğ, ş, İ, ü, ö, ç) encoded as Latin-1 escape sequences. NukeAll decodes them back to proper UTF-8 bytes automatically so your keyword filters actually match.',
      faqTitle: 'Instagram bulk deletion FAQ',
      faqs: [
        {
          q: 'Will Instagram suspend my account for using NukeAll?',
          a: 'Any rapid automation can trigger rate-limit warnings ("Please wait a few minutes"). Keep Safe speed enabled (3–6s randomized delay) and set a conservative daily cap if cleaning thousands of items.',
        },
        {
          q: 'Can I also delete Instagram Direct chat messages?',
          a: 'Yes! Switch the Instagram type picker to Chat Messages (DM) — see our dedicated Instagram DM unsend guide for step-by-step instructions.',
        },
      ],
      moreGuidesTitle: 'Other platform cleanup guides',
    },
    tr: {
      navLabel: 'Instagram Yorum & Beğeni Silme',
      eyebrow: 'Instagram Rehberi · Şifresiz ve Güvenli',
      h1: 'Instagram Yorumlarını ve Beğenileri Toplu Silme Rehberi',
      lead:
        'Şifreni ve iki aşamalı doğrulama kodunu riskli mobil uygulamalara vermeden, doğrudan tarayıcındaki açık instagram.com oturumu üzerinden eski yorumlarını, beğenilerini ve gönderilerini toplu temizle.',
      highlights: [
        {
          title: 'Şifreni Kimseyle Paylaşma',
          body: 'Üçüncü taraf "cleaner" uygulamalar şifreni alıp hesap kilitlenmesine yol açar. NukeAll yalnızca senin açık tarayıcı sekmen içinde yerel olarak çalışır.',
        },
        {
          title: 'Türkçe Karakter Düzeltmeli JSON Desteği',
          body: 'Meta veri indirmesindeki post_comments_1.json veya liked_posts.json dosyalarındaki bozuk Türkçe karakterler (Ã§, ÅŸ, Ä±) otomatik onarılır.',
        },
        {
          title: 'Hareketlerin Otomasyonu',
          body: 'Instagram Hareketlerin (Yorumlar, Beğeniler, Gönderiler) sayfalarına otomatik gider ve güvenli bekleme aralıklarıyla temizler.',
        },
      ],
      stepsTitle: 'Adım adım: Instagram yorum ve beğenilerini silme',
      steps: [
        {
          title: 'instagram.com oturumunu ve paneli aç',
          body: 'Masaüstü tarayıcında instagram.com hesabına giriş yap, NukeAll yan panelini aç ve üst şeritten Instagram’ı seç.',
        },
        {
          title: 'Yorumlar, Beğeniler veya Gönderiler’i seçip tara',
          body: 'Tek bir tür seçip Instagram’a Git & Tara’ya bas. NukeAll Hareketlerin sayfasını açıp öğelerini pasif olarak toplar.',
        },
        {
          title: 'İstersen Meta JSON arşivini içe aktar',
          body: 'Meta Hesaplar Merkezi’nden JSON formatında veri indirdiysen post_comments_1.json dosyasını Arşiv Yükle sekmesine yükleyip tarih/kelime araması yapabilirsin.',
        },
        {
          title: 'Tarih veya kelime filtrele ve güvenli hızda sil',
          body: 'İncele ekranında silinecekleri onayla, istersen çevrimdışı yedek al ve Güvenli hızda silmeyi başlat.',
        },
      ],
      tipTitle: 'Meta JSON arşivlerindeki Türkçe karakter sorunu',
      tipBody:
        'Instagram veri indirmeleri Türkçe harfleri Latin-1 kaçış dizisi olarak kaydeder. NukeAll bunu tarayıcı içinde otomatik UTF-8’e geri çözdüğü için Türkçe anahtar kelime filtrelerin eksiksiz çalışır.',
      faqTitle: 'Instagram toplu silme SSS',
      faqs: [
        {
          q: 'Çok hızlı silersem Instagram engeller mi?',
          a: 'Evet, agresif istekler "Lütfen birkaç dakika bekle" uyarısı verebilir. Güvenli hız (3–6 sn rastgele gecikme) ve günlük limit ayarı seni korumak için varsayılan olarak açıktır.',
        },
        {
          q: 'Instagram DM sohbet mesajlarını da silebilir miyim?',
          a: 'Evet! Instagram türü olarak Sohbet Mesajları (DM) seçeneğini kullanabilir veya Instagram DM rehberimize göz atabilirsin.',
        },
      ],
      moreGuidesTitle: 'Diğer platform temizleme rehberleri',
    },
  },
  guideIgDm: {
    en: {
      navLabel: 'Unsend Instagram DMs',
      eyebrow: 'Instagram Direct Guide · Your Own Messages Only',
      h1: 'How to Unsend Your Instagram DM Messages Automatically',
      lead:
        'Want to remove your own messages inside a specific Instagram Direct chat thread — so they disappear for both sides — without clicking "Unsend" hundreds of times by hand?',
      highlights: [
        {
          title: 'Only Your Own Messages',
          body: 'NukeAll filters strictly to your outgoing message bubbles ("You sent") and leaves the other person’s messages untouched.',
        },
        {
          title: 'Removes for Everyone (Unsend)',
          body: 'Calls Instagram Direct’s unsend action cleanly, rather than merely hiding the conversation thread locally in your inbox.',
        },
        {
          title: 'Filter by Keyword or Date Before Unsend',
          body: 'Search specific words, phone numbers, or pick a date range inside Review Grid so you only unsend sensitive messages.',
        },
      ],
      stepsTitle: 'Step-by-step: Unsend Instagram DMs in a chat',
      steps: [
        {
          title: 'Open the target Instagram Direct thread',
          body: 'Select Instagram → Chat Messages (DM) in NukeAll. If you are not inside a chat yet, NukeAll opens instagram.com/direct/inbox/ automatically so you can click the conversation you want to clean.',
        },
        {
          title: 'Click Scan inside that open conversation',
          body: 'Once the URL looks like /direct/t/<thread-id>/, press Go to Instagram & Scan again. NukeAll scrolls upward through that chat to gather your outgoing messages.',
        },
        {
          title: 'Optionally review message_1.json archive',
          body: 'You can also import message_1.json from your Meta data export in the Archive tab to inspect old chat logs offline.',
        },
        {
          title: 'Confirm selection and unsend safely',
          body: 'Select the messages to retract, review in the grid, and start deletion. Keep Safe speed enabled to avoid Direct messaging cooldowns.',
        },
      ],
      tipTitle: 'Important note about Direct unsend',
      tipBody:
        'Keep the target chat tab open in the active window while scanning and deleting so Instagram’s DOM and session headers stay in sync.',
      faqTitle: 'Instagram DM cleanup FAQ',
      faqs: [
        {
          q: 'Does NukeAll touch messages sent by the other person?',
          a: 'No. Instagram only permits unsending your own outgoing messages, and NukeAll explicitly identifies only your own messages during scans.',
        },
        {
          q: 'Can deleting entire chats remove messages from the recipient’s inbox?',
          a: 'Deleting a conversation thread in Instagram only hides your local copy. To remove sent messages from the recipient’s side too, each message must be unsent — which is what NukeAll automates.',
        },
      ],
      moreGuidesTitle: 'Other platform cleanup guides',
    },
    tr: {
      navLabel: 'Instagram DM Mesaj Silme',
      eyebrow: 'Instagram Direct Rehberi · Karşı Taraftan da Kaldır',
      h1: 'Instagram DM Sohbet Mesajlarını Otomatik Geri Çekme (Unsend)',
      lead:
        'Belirli bir Instagram Direct sohbetinde yalnızca kendi gönderdiğin mesajları karşı taraftan da silinecek şekilde (gönderimi geri al) tek tek elle tıklamadan otomatik temizle.',
      highlights: [
        {
          title: 'Yalnızca Kendi Mesajların',
          body: 'NukeAll yalnızca senin giden mesaj balonlarını hedefler; karşı tarafın mesajlarına dokunmaz.',
        },
        {
          title: 'Sohbeti Gizlemek Yerine Gönderimi Geri Alır',
          body: 'Konuşmayı sadece kendi kutundan gizlemek yerine her mesajı karşı taraftan da kaldıracak şekilde geri alır (unsend).',
        },
        {
          title: 'Silmeden Önce Tarih & Kelime Filtrele',
          body: 'Sohbetteki belirli bir kelimeyi, telefon numarasını veya tarih aralığını filtreleyip sadece seçtiğin mesajları silebilirsin.',
        },
      ],
      stepsTitle: 'Adım adım: Instagram sohbetindeki mesajlarını silme',
      steps: [
        {
          title: 'Temizlemek istediğin DM sohbetini aç',
          body: 'NukeAll’da Instagram → Sohbet Mesajları (DM) seçeneğini işaretle. Henüz bir sohbet açık değilse NukeAll doğrudan Direct gelen kutusunu açar; temizlemek istediğin sohbete tıkla.',
        },
        {
          title: 'Sohbet açıkken Tara’ya bas',
          body: 'Adres /direct/t/<sohbet-id>/ biçimindeyken tekrar Instagram’a Git & Tara butonuna bas. NukeAll sohbette yukarı kaydırarak kendi gönderdiğin mesajları listeler.',
        },
        {
          title: 'İstersen message_1.json arşivini incele',
          body: 'Meta veri indirmendeki message_1.json dosyasını Arşiv Yükle sekmesinden içe aktarıp eski konuşmaları çevrimdışı da tarayabilirsin.',
        },
        {
          title: 'Seçimi kontrol et ve güvenli hızda geri al',
          body: 'İncele ekranında silinecek mesajları onayla ve işlemi başlat. Direct mesaj kısıtına takılmamak için Güvenli hızda kal.',
        },
      ],
      tipTitle: 'Sohbet silme vs. gönderimi geri alma farkı',
      tipBody:
        'Instagram’da sohbeti silmek sadece senin ekranından gizler, karşı tarafta mesajlar kalır. Mesajların karşıdan da kalkması için gönderimi geri almak (unsend) gerekir; NukeAll bu adımı otomatikleştirir.',
      faqTitle: 'Instagram DM silme SSS',
      faqs: [
        {
          q: 'Karşı tarafın attığı mesajlar da silinir mi?',
          a: 'Hayır, Instagram protokolü gereği yalnızca kendi gönderdiğin mesajların gönderimini geri alabilirsin; NukeAll sadece senin mesajlarını tarar.',
        },
        {
          q: 'Tarama sırasında sohbet sekmesi açık kalmalı mı?',
          a: 'Evet, Direct sohbeti dinamik yüklendiği için tarama ve silme boyunca ilgili instagram.com sekmesini açık tutmalısın.',
        },
      ],
      moreGuidesTitle: 'Diğer platform temizleme rehberleri',
    },
  },
  guideReddit: {
    en: {
      navLabel: 'Overwrite & Delete Reddit',
      eyebrow: 'Reddit Guide · 0–3 Pass Overwrite Before Delete',
      h1: 'How to Overwrite & Mass Delete Reddit Comments and Posts',
      lead:
        'Deleting a Reddit comment removes it from public threads, but third-party scrapers may cache the last version they saw. NukeAll edits your comments and posts with randomized or custom text before deleting.',
      highlights: [
        {
          title: '0–3 Pass Overwrite Protection',
          body: 'Configure 1 to 3 overwrite passes in Settings using random words each pass or your own custom placeholder message (plus an overwrite-only mode).',
        },
        {
          title: 'Bypass Reddit’s 1,000-Item Limit',
          body: 'Reddit profile feeds stop at ~1,000 items. Upload comments.csv or posts.csv from your official Reddit GDPR/data request to delete your entire history.',
        },
        {
          title: 'Keep Pinned, High-Karma or Saved Terms',
          body: 'Automatically spare posts above a minimum score threshold, pinned profile items, or keywords you specify.',
        },
      ],
      stepsTitle: 'Step-by-step: Overwrite and wipe Reddit history',
      steps: [
        {
          title: 'Configure overwrite passes in Settings',
          body: 'Open NukeAll Settings and set Reddit overwrite passes (recommended: 1 or 2 passes; up to 3 passes) and choose random text or custom replacement copy.',
        },
        {
          title: 'Select Reddit and scan Comments or Posts',
          body: 'Pick Reddit in the platform bar, choose Comments or Posts, and click Go to Reddit & Scan. NukeAll automatically resolves your session handle and loads history via JSON/DOM.',
        },
        {
          title: 'Or upload comments.csv / posts.csv',
          body: 'Got your Reddit data export ZIP? Load comments.csv or posts.csv under Archive Import to cover history past Reddit’s 1,000-listing cap.',
        },
        {
          title: 'Filter by date or subreddit and delete',
          body: 'Review matched items, pick a date range or minimum karma protection, optionally save an offline HTML copy, and start automated overwrite-then-delete.',
        },
      ],
      tipTitle: 'Why overwrite before deleting on Reddit?',
      tipBody:
        'When Reddit processes an edit before deletion, live caches update to the overwritten string while Reddit also deletes the final record. Unlike abandoned legacy userscripts, NukeAll works natively on both new www.reddit.com and old.reddit.com.',
      faqTitle: 'Reddit wipe FAQ',
      faqs: [
        {
          q: 'Does NukeAll work on modern Reddit (shreddit) as well as old.reddit.com?',
          a: 'Yes. NukeAll scans both the active www.reddit.com tab and uses a CORS-free background old.reddit.com JSON fallback so history loading stays reliable.',
        },
        {
          q: 'Can I overwrite comments without deleting them yet?',
          a: 'Yes — toggle "Overwrite only (do not delete yet)" in NukeAll Settings to scrub comment text in place first.',
        },
      ],
      moreGuidesTitle: 'Other platform cleanup guides',
    },
    tr: {
      navLabel: 'Reddit Yorum Üzerine Yaz & Sil',
      eyebrow: 'Reddit Rehberi · Silmeden Önce 0–3 Tur Üzerine Yazma',
      h1: 'Reddit Yorumlarını ve Gönderilerini Üzerine Yazarak Silme',
      lead:
        'Reddit’te bir yorumu doğrudan silmek genel akıştan kaldırır ancak arşiv botları son sürümü saklayabilir. NukeAll, her yorum veya gönderiyi silmeden önce rastgele ya da özel metinle üzerine yazarak düzenler.',
      highlights: [
        {
          title: '0–3 Tur Üzerine Yazma Koruması',
          body: 'Ayarlar’dan 1 ile 3 tur arasında rastgele kelimelerle veya özel metinle üzerine yazma seçebilirsin (hatta silmeden yalnızca düzenleme modu da vardır).',
        },
        {
          title: '1.000 Öğe Profil Sınırını Aş',
          body: 'Reddit profil listeleri yaklaşık 1.000 öğede durur. Resmi Reddit veri talebindeki comments.csv veya posts.csv dosyasını içe aktararak tüm geçmişini silebilirsin.',
        },
        {
          title: 'Yüksek Puanlı Gönderileri Koru',
          body: 'Belirlediğin skorun üzerindeki, sabitlenmiş veya özel anahtar kelime içeren yorum ve başlıkları otomatik hariç tut.',
        },
      ],
      stepsTitle: 'Adım adım: Reddit geçmişini üzerine yazıp silme',
      steps: [
        {
          title: 'Ayarlar’da üzerine yazma turunu belirle',
          body: 'NukeAll Ayarlar sekmesinden Reddit üzerine yazma turunu (önerilen: 1–2 tur) ve rastgele ya da özel metin seçeneğini ayarla.',
        },
        {
          title: 'Reddit’te Yorumlar veya Gönderiler’i tara',
          body: 'Üst çubuktan Reddit’i seç, Yorumlar veya Gönderiler türünü işaretle ve Reddit’e Git & Tara butonuna bas.',
        },
        {
          title: 'Eski geçmiş için comments.csv / posts.csv yükle',
          body: 'Reddit veri talebinden gelen comments.csv veya posts.csv dosyalarını Arşiv Yükle sekmesine bırak; tamamı tarayıcında okunur.',
        },
        {
          title: 'Tarih seç ve işlemi başlat',
          body: 'İncele ekranında tarih aralığını veya karma korumasını ayarla, istersen çevrimdışı HTML yedek indirip silmeyi başlat.',
        },
      ],
      tipTitle: 'Neden silmeden önce üzerine yazmalısın?',
      tipBody:
        'Silmeden önce yapılan düzenleme, indeks önbelleklerinin orijinal cümleni boşaltmasını sağlar. NukeAll hem yeni www.reddit.com arayüzünde hem de old.reddit.com uç noktalarında sorunsuz çalışır.',
      faqTitle: 'Reddit temizleme SSS',
      faqs: [
        {
          q: 'Yeni Reddit arayüzünde (shreddit) çalışıyor mu?',
          a: 'Evet. Hem modern www.reddit.com sekmesini tarar hem de gerekirse arka planda CORS engeli olmayan old.reddit.com JSON yedeğini kullanır.',
        },
        {
          q: 'Silmeden sadece yorum metinlerini temizleyebilir miyim?',
          a: 'Evet — Ayarlar bölümündeki "Sadece üzerine yaz (henüz silme)" seçeneğini açman yeterlidir.',
        },
      ],
      moreGuidesTitle: 'Diğer platform temizleme rehberleri',
    },
  },
  guideLinkedin: {
    en: {
      navLabel: 'Delete Old LinkedIn Posts',
      eyebrow: 'LinkedIn Guide · Exact Date Range Picker + Archive CSV',
      h1: 'How to Delete Old LinkedIn Posts & Comments by Date',
      lead:
        'Cleaning up old job updates, cringe hot takes or past reposts on LinkedIn before a career move? Filter your LinkedIn activity by exact calendar dates — or one click for > 6 months / > 1 year — and wipe old posts automatically.',
      highlights: [
        {
          title: 'Exact Snowflake Timestamp Decoding',
          body: 'LinkedIn shows vague labels like "2yr", but every activity URN encodes its millisecond timestamp in bits 22–63. NukeAll decodes exact calendar dates locally.',
        },
        {
          title: 'Calendar Date Picker & Quick Chips',
          body: 'Pick any From / To date in Review Grid or click > 30d, > 6m, or > 1y to isolate old LinkedIn posts while keeping recent portfolio updates intact.',
        },
        {
          title: 'Shares.csv & Comments.csv Import + Safe DOM Clicks',
          body: 'Upload your LinkedIn Data Export CSVs to find posts from years ago, or scan live activity using genuine DOM clicks that avoid raw Voyager API blocks.',
        },
      ],
      stepsTitle: 'Step-by-step: Wipe old LinkedIn posts by date',
      steps: [
        {
          title: 'Sign in on linkedin.com and pick LinkedIn',
          body: 'Open linkedin.com in a browser tab, launch the NukeAll side panel, and click LinkedIn in the platform bar.',
        },
        {
          title: 'Scan recent activity or import Shares.csv',
          body: 'Select Posts, Comments or Likes and click Go to LinkedIn & Scan — NukeAll automatically resolves your /in/handle/ and opens your recent-activity feed. For multi-year archives, upload Shares.csv or Comments.csv under Archive Import.',
        },
        {
          title: 'Choose your date cutoff (> 6m, > 1y, or custom dates)',
          body: 'In Review Grid, use the From / To date inputs or click > 30d, > 6m, or > 1y. NukeAll instantly updates the matched count and locks selection strictly to those date-filtered items.',
        },
        {
          title: 'Back up optionally and run Safe deletion',
          body: 'Save an offline JSON/CSV/HTML copy if you want records of old writing, then delete at Safe speed. NukeAll navigates to archived post URLs automatically when needed and pauses if LinkedIn shows a checkpoint.',
        },
      ],
      tipTitle: 'Why NukeAll uses real DOM interaction on LinkedIn',
      tipBody:
        'Direct third-party API scripts against LinkedIn’s Voyager endpoints frequently hit HTTP 999 or security challenges. By operating calmly inside your real browser tab with randomized delays and checking for checkpoints automatically, NukeAll keeps your profile safe.',
      faqTitle: 'LinkedIn post cleanup FAQ',
      faqs: [
        {
          q: 'How does NukeAll know the exact date when LinkedIn only displays "1y" or "3mo"?',
          a: 'NukeAll decodes the 64-bit Snowflake URN inside each post (BitInt >> 22) to obtain the exact UTC millisecond timestamp, and combines it with <time> attributes, relative labels, and Shares.csv export dates.',
        },
        {
          q: 'Can I keep recent posts from the past year and delete only older ones?',
          a: 'Yes. Set a "To date" (or click the "> 1y" chip right in Review Grid) so recent posts are filtered out and only posts older than one year remain selected for deletion.',
        },
      ],
      moreGuidesTitle: 'Other platform cleanup guides',
    },
    tr: {
      navLabel: 'LinkedIn Eski Gönderi Silme',
      eyebrow: 'LinkedIn Rehberi · Tarih Seçici + Arşiv CSV Desteği',
      h1: 'LinkedIn’deki Eski Gönderileri ve Yorumları Tarih Seçerek Silme',
      lead:
        'Yeni iş başvuruları veya kariyer değişikliği öncesinde yıllar önce paylaştığın LinkedIn gönderilerini, yeniden paylaşımlarını ve yorumlarını temizlemek mi istiyorsun? İncele ekranından istediğin tarihi seç ve eskileri güvenle sil.',
      highlights: [
        {
          title: 'Snowflake URN ile Kesin Tarih Çözümleme',
          body: 'LinkedIn arayüzde yalnızca "2 yıl" gösterse bile her aktivite kimliği gerçek milisaniye tarihini taşır. NukeAll bunu bit kaydırma ile yerelde çözer.',
        },
        {
          title: 'Tarih Seçici & Tek Tık Kısayollar',
          body: 'İncele ekranındaki Başlangıç / Bitiş takvimini kullan veya tek tıkla 30 g+, 6 ay+, 1 yıl+ butonlarına basarak yalnızca eski gönderileri seç.',
        },
        {
          title: 'Shares.csv İçe Aktarma & Güvenli DOM Otomasyonu',
          body: 'LinkedIn veri dışa aktarımındaki Shares.csv veya Comments.csv dosyalarını yükle ya da açık oturumunda güvenli DOM etkileşimiyle tara.',
        },
      ],
      stepsTitle: 'Adım adım: LinkedIn eski gönderilerini tarihle silme',
      steps: [
        {
          title: 'linkedin.com oturumunu aç ve LinkedIn’i seç',
          body: 'Tarayıcında linkedin.com açıkken NukeAll yan panelini aç ve üst şeritten LinkedIn platformunu seç.',
        },
        {
          title: 'Canlı aktiviteni tara veya Shares.csv yükle',
          body: 'Gönderiler, Yorumlar veya Beğeniler’i seçip LinkedIn’e Git & Tara butonuna bas. Çok eski yıllar için LinkedIn veri dışa aktarımından indirdiğin Shares.csv veya Comments.csv dosyasını Arşiv Yükle sekmesine bırak.',
        },
        {
          title: 'Tarih aralığını seç (Başlangıç / Bitiş veya 1 yıl+)',
          body: 'İncele & Sil sekmesinde Başlangıç/Bitiş tarihini gir ya da "1 yıl+" / "6 ay+" butonuna tıkla. Silme butonu yalnızca tarih filtresine uyan öğelere kilitlenir.',
        },
        {
          title: 'İstersen yedek al ve Güvenli hızda sil',
          body: 'Eski yazılarını saklamak istersen tek tıkla JSON/HTML yedeğini al, ardından Güvenli hızda silmeyi başlat. NukeAll arşivdeki eski gönderilere gerekirse tek tek gidip güvenli menü adımlarıyla siler.',
        },
      ],
      tipTitle: 'LinkedIn’de neden güvenli DOM otomasyonu kullanıyoruz?',
      tipBody:
        'Harici Voyager API istekleri LinkedIn tarafında sık sık HTTP 999 ve güvenlik doğrulamasına takılır. NukeAll gerçek sekme içinde insansı gecikmelerle menü tıklamalarını kullanır ve doğrulama ekranı görürse otomatik duraklar.',
      faqTitle: 'LinkedIn eski gönderi silme SSS',
      faqs: [
        {
          q: 'LinkedIn sadece "2 yıl" yazarken NukeAll tam tarihi nasıl biliyor?',
          a: 'Her LinkedIn gönderisinin URN kimliği içinde gömülü 64-bit Snowflake zaman damgası (BigInt >> 22) yerelde çözülür; ayrıca Shares.csv dosyasındaki kesin tarihler de doğrudan kullanılır.',
        },
        {
          q: 'Son 1 yıldaki gönderilerimi bırakıp sadece 1 yıldan eskileri silebilir miyim?',
          a: 'Evet. İncele ekranındaki "1 yıl+" hızlı filtresine basman veya Bitiş tarihi seçmen yeterli — yeni gönderilerin listeden çıkar ve silinmez.',
        },
      ],
      moreGuidesTitle: 'Diğer platform temizleme rehberleri',
    },
  },
};

export function buildGuideJsonLd(key: GuideKey, lang: Lang): Record<string, unknown>[] {
  const g = guides[key][lang];
  const d = t(lang);
  const pageMeta = d.meta[key as PageKey];
  const pageUrl = absUrl(path(key, lang));

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: g.h1,
    description: pageMeta.description,
    totalTime: 'PT5M',
    tool: [
      {
        '@type': 'HowToTool',
        name: 'NukeAll Browser Extension',
      },
    ],
    step: g.steps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.title,
      text: s.body,
      url: `${pageUrl}#step-${idx + 1}`,
    })),
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: g.faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return [howTo, faqPage];
}
