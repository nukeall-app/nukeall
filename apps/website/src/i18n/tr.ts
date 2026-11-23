import type { Dict, FaqItem } from './en';

export const tr: Dict = {
  langName: 'Türkçe',
  ogLocale: 'tr_TR',
  meta: {
    home: {
      title: 'NukeAll — Tüm Tweetleri, Instagram, Reddit ve LinkedIn Geçmişini Ücretsiz Sil (Açık Kaynak)',
      description:
        'X (Twitter) tüm tweetleri silme, Instagram yorum ve DM temizleme, Reddit yorum üzerine yazıp silme ve eski LinkedIn gönderilerini tarih seçerek silme eklentisi. %100 yerel, sınırsız, sunucusuz.',
    },
    install: {
      title: 'NukeAll Kurulum — Firefox, Chrome, Edge ve Brave Adım Adım Kurulum Rehberi',
      description:
        'Ücretsiz tweet silme eklentisi NukeAll’u Firefox Add-ons (veya about:debugging) ile Chrome, Edge ve Brave tarayıcılarına kurma rehberi.',
    },
    faq: {
      title: 'NukeAll SSS — Hesap Güvenliği, Gizlilik ve Toplu Silme Nasıl Çalışır?',
      description:
        'Tüm tweetleri silme, Instagram yorumları toplu silme ve Reddit yorum temizliği hakkında sorular: ban riski, güvenli hız, veriler nereye gider ve neden ücretsiz?',
    },
    compare: {
      title: 'Ücretsiz Redact.dev Alternatifi — NukeAll vs Redact, Cyd, TweetDeleter ve Power Delete Suite',
      description:
        'Ücretsiz Redact.dev veya TweetDeleter alternatifi mi arıyorsun? Açık kaynak NukeAll ile Redact, Cyd, TweetDeleter ve Power Delete Suite karşılaştırması.',
    },
    privacy: {
      title: 'Gizlilik Politikası — NukeAll Hiçbir Veri Toplamaz',
      description:
        'NukeAll tarayıcı eklentisi sunucu, hesap veya telemetri kullanmaz. Tanıtım sitesi yalnızca çerezsiz Cloudflare Web Analytics kullanır.',
    },
    sponsor: {
      title: 'NukeAll’a Destek Ol — Ücretsiz ve Açık Kaynak Sosyal Medya Temizleyici',
      description:
        'NukeAll sonsuza kadar ücretsizdir ve topluluk bağışlarıyla yaşar. GitHub Sponsors veya Ko-fi üzerinden geliştirme sürecine destek olabilirsin.',
    },
    guideTweets: {
      title: 'Tüm Tweetleri ve X Yanıtlarını Ücretsiz Silme Rehberi (2026) — NukeAll',
      description:
        'X (Twitter) üzerindeki tüm tweet, yanıt, beğeni, repost ve yer imlerini nasıl toplu silersin? 3.200 tweet sınırını tweets.js arşivi ile aş, şifreni paylaşma.',
    },
    guideIgComments: {
      title: 'Instagram Yorumlarını ve Beğenileri Toplu Silme (Şifresiz) — NukeAll',
      description:
        'Şifreni üçüncü taraf uygulamalara vermeden tarayıcının içinde eski Instagram yorumlarını, beğenilerini ve gönderilerini Türkçe karakter düzeltmeli JSON desteğiyle sil.',
    },
    guideIgDm: {
      title: 'Instagram DM Mesajlarını Otomatik Geri Çekme ve Silme — NukeAll',
      description:
        'Instagram Direct sohbetlerinde yalnızca kendi gönderdiğin mesajları karşı taraftan da kaldırmak için otomatik gönderimi geri al (unsend) — %100 yerel.',
    },
    guideReddit: {
      title: 'Reddit Yorumlarını ve Gönderilerini Üzerine Yazıp Silme — NukeAll',
      description:
        'Arşiv botlarına karşı Reddit yorum ve gönderilerini silmeden önce 0–3 tur rastgele veya özel metinle üzerine yaz, comments.csv arşiviyle tüm geçmişini temizle.',
    },
    guideLinkedin: {
      title: 'LinkedIn Eski Gönderileri Tarih Seçerek Toplu Silme — NukeAll',
      description:
        'LinkedIn üzerindeki eski gönderi, yorum ve tepkilerini tarih aralığına göre (> 30 gün, > 6 ay, > 1 yıl) filtrele veya Shares.csv arşiviyle tarayıcında güvenle sil.',
    },
    notFound: {
      title: 'Sayfa bulunamadı — NukeAll',
      description: 'Aradığın sayfa mevcut değil. Ücretsiz ve açık kaynak sosyal medya temizleyici NukeAll ana sayfasına dön.',
    },
  },
  nav: {
    skip: 'İçeriğe geç',
    home: 'Ana Sayfa',
    features: 'Özellikler',
    compare: 'Karşılaştır',
    faq: 'SSS',
    install: 'Kurulum',
    sponsor: 'Destek Ol',
    privacy: 'Gizlilik',
    github: 'GitHub',
    menu: 'Menü',
    primary: 'Ana gezinme',
    switchLabel: 'Dil',
  },
  hero: {
    eyebrow: 'Ücretsiz ve açık kaynak · Tamamen tarayıcında çalışır',
    h1Lead: 'Sosyal medya geçmişini',
    h1Tail: 'dakikalar içinde temizle.',
    sub: 'X, Instagram, Reddit ve LinkedIn’deki eski gönderi, yorum, beğeni, repost ve sohbet mesajlarını tek yerden güvenle sil. Şifre gerekmez, abonelik yok — verilerin tarayıcından dışarı çıkmaz.',
    ctaFirefox: 'Firefox’a Ekle',
    soon: 'yakında',
    ctaChrome: 'Chrome / Edge / Brave için İndir',
    ctaInstall: 'Ücretsiz Kur (1 dk)',
    ctaVerify: 'Kaynak Kodunu İncele',
    ctaGithub: 'GitHub’da İncele',
    note: 'Firefox, Chrome, Edge ve Brave ile uyumlu. Verilerin yalnızca kendi cihazında kalır.',
    trustPoints: ['Şifre veya API anahtarı istemez', 'Sunucu yok, takip yok', 'Onaylamadan hiçbir şey silinmez'],
  },
  platforms: {
    title: 'Desteklenen platformlar',
    live: 'Hazır',
    soon: 'Yakında',
    soonList: 'Bluesky · Threads · Facebook · YouTube',
    guideLink: 'Nasıl çalışır?',
    cards: [
      {
        key: 'guideTweets' as const,
        badge: 'X',
        color: 'bg-zinc-800 text-white border-zinc-700',
        name: 'X (Twitter)',
        desc: 'Eski tweetlerini, yanıtlarını, beğenilerini, repostlarını ve yer imlerini toplu sil.',
      },
      {
        key: 'guideIgComments' as const,
        badge: 'IG',
        color: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        name: 'Instagram',
        desc: 'Eski yorumlarını, beğenilerini ve gönderilerini sil; DM sohbetlerinde kendi mesajlarını karşıdan da geri al.',
      },
      {
        key: 'guideReddit' as const,
        badge: 'R',
        color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        name: 'Reddit',
        desc: 'Silmeden önce yorum ve gönderilerini rastgele metinle değiştirerek arama arşivlerinde bile iz bırakma.',
      },
      {
        key: 'guideLinkedin' as const,
        badge: 'in',
        color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        name: 'LinkedIn',
        desc: 'İş başvuruları öncesi eski gönderi, yorum ve tepkilerini takvimden tarih seçerek kolayca temizle.',
      },
    ],
  },
  features: {
    title: 'Ücretli araçların sunduğu her şey — tamamen ücretsiz',
    subtitle: 'Karmaşık teknik ayarlar olmadan herkesin güvenle kullanabileceği sade arayüz.',
    items: [
      { icon: '∞', title: 'Sınırsız ve tamamen ücretsiz', body: '30 gün sınırı, günlük kota, kredi veya ücretli paket yok. İster 50 ister 500.000 içerik temizle.' },
      { icon: '📅', title: 'Tarih seçici ve onay ekranı', body: 'Takvimden istediğin tarih aralığını veya tek tıkla 30 gün / 6 ay / 1 yıl öncesini seç. Onay vermeden tek bir içerik silinmez.' },
      { icon: '🗄️', title: 'Yıllar öncesine kadar temizlik', body: 'Platformların gizlediği çok eski geçmişi silmek için X, Instagram, Reddit veya LinkedIn’den indirdiğin resmi veri arşivini doğrudan içeri aktar.' },
      { icon: '💬', title: 'Instagram DM’lerini karşıdan da sil', body: 'İstediğin sohbeti aç ve NukeAll ile yalnızca kendi gönderdiğin mesajların gönderimini otomatik geri al.' },
      { icon: '💼', title: 'LinkedIn tarih aralıklı temizlik', body: 'Yeni paylaşımlarına dokunmadan sadece seçtiğin tarihten önceki eski LinkedIn gönderilerini ve yorumlarını güvenle sil.' },
      { icon: '✍️', title: 'Reddit’te iz bırakmadan silme', body: 'Reddit yorumlarını silmeden önce 1–3 kez rastgele ya da belirlediğin bir metinle değiştirir; arşiv sitelerinde eski cümlelerin kalmaz.' },
      { icon: '🛡️', title: 'Önemli anılarını koru', body: 'Sabitlenen gönderileri, yüksek beğeni alan paylaşımları veya koruma kelimesi eklediğin içerikleri silme listesinden otomatik hariç tut.' },
      { icon: '💾', title: 'Kişisel yedek ve silme özeti', body: 'Silmeden önce istersen bilgisayarında aranabilir kişisel bir yedek kopya ve işlem sonunda temizlik özeti sakla.' },
      { icon: '🐢', title: 'Hesap dostu hız ve kaldığı yerden devam', body: 'İnsansı bekleme süreleri ve günlük limit hesabını korur; tarayıcı kapansa bile kaldığın yerden güvenle devam edersin.' },
    ],
  },
  how: {
    title: '3 adımda nasıl çalışır?',
    steps: [
      { title: '1. Tarayıcına ekle', body: 'Eklentiyi 1 dakikada kur; X, Instagram, Reddit veya LinkedIn hesabının açık olduğu sekmeye geç. Asla şifre istemeyiz.' },
      { title: '2. Tara ve tarih seç', body: 'Temizlemek istediğin türü seç (veya resmi veri arşivini yükle), takvim ve kelime filtreleriyle silinecekleri daralt.' },
      { title: '3. Onayla ve temizle', body: 'İstersen tek tıkla yedeğini indir; 10 saniyelik iptal süresinin ardından NukeAll seçtiklerini güvenli hızda temizlesin.' },
    ],
  },
  privacy: {
    title: 'Verini göremeyiz — çünkü hiçbir sunucumuz yok',
    body: 'Pek çok temizlik aracı şifreni ister ve hesabını kendi sunucularında işler. NukeAll tamamen kendi tarayıcının içinde çalışır.',
    points: [
      { title: 'Şifreni asla istemez', body: 'Doğrudan tarayıcındaki açık oturumla çalışır; şifre, doğrulama kodu veya hesap bağlantısı gerekmez.' },
      { title: 'Verilerin cihazından çıkmaz', body: 'Tarama, filtreleme ve aldığın yedekler yalnızca kendi bilgisayarında işlenir; hiçbir sunucuya gönderilmez.' },
      { title: 'Yalnızca 4 sosyal ağa izinli', body: 'Tarayıcı güvenliği gereği eklenti desteklenen 4 platform dışında hiçbir reklam, analiz veya dış siteyle iletişim kuramaz.' },
      { title: 'Herkese açık kaynak kodu', body: 'Tüm kod GitHub’da GPL-3.0 lisansıyla açıktır. Dileyen herkes her satırı inceleyip kendisi derleyebilir.' },
    ],
    cta: 'Gizlilik politikasını oku',
  },
  compareSection: {
    title: 'Rakiplerle karşılaştırma',
    subtitle: 'Ücretsiz, sınırsız, açık kaynak ve çok platformlu — başka araçlarda aynı anda bulamazsın.',
    cta: 'Tüm karşılaştırmayı gör',
  },
  compare: {
    h1: 'Ücretsiz ve açık kaynak Redact.dev alternatifi',
    intro:
      'NukeAll; Redact.dev, TweetDeleter, Cyd ve Power Delete Suite araçlarına ücretsiz ve açık kaynak bir alternatiftir. Tüm tweetleri silme, Instagram yorumları toplu silme ve Reddit temizliği için özellik karşılaştırması aşağıdadır.',
    asOf: 'Kasım 2026 itibarıyla herkese açık bilgilere dayanmaktadır.',
    disclaimer: 'Güncel olmayan bir bilgi görürsen GitHub üzerinden issue açabilirsin. Tüm ticari markalar ilgili sahiplerine aittir.',
    featureCol: 'Özellik',
    caption: 'Sosyal medya silme araçları özellik karşılaştırması',
    legend: '✅ var · ⚠️ kısmi / sınırlı · ❌ yok · ? belirsiz · – geçerli değil',
    pricing: 'Fiyat',
    prices: ['Ücretsiz', 'Ücretsiz: son 30 gün; $8–15/ay', 'Sınırlı ücretsiz; Premium $3/ay', '$6–24/ay', 'Ücretsiz'],
    rows: [
      'Ücretsiz ve sınırsız',
      'Açık kaynak (denetlenebilir kod)',
      'Şifre istemez (tarayıcı eklentisi)',
      'Sunucusuz ve takipsiz',
      'X (Twitter): Tweet, yanıt, beğeni, repost ve yer imi',
      'Instagram: Yorum, beğeni, gönderi ve DM geri çekme',
      'Reddit: Üzerine yazarak iz bırakmadan silme',
      'LinkedIn: Tarih seçerek eski gönderi silme',
      'Yıllar öncesini silme (Resmi veri arşivi desteği)',
      'Takvim tarih seçici ve tek tek onay ekranı',
      'Önemli gönderileri koruma (sabitlenen / popüler)',
      'Çevrimdışı kişisel yedek ve silme özeti',
      'Tarayıcı kapansa bile kaldığı yerden devam',
      'Türkçe ve İngilizce arayüz',
    ],
    notes: { paid: 'ücretli', xOnly: 'sadece X', cloud: 'bulut', gpl: 'GPL-3', free: 'ücretsiz', xPaid: 'sadece X, ücretli' },
    alts: [
      { title: 'NukeAll vs Redact.dev', body: 'Redact.dev pek çok platformu destekler ancak ücretsiz sürümü yalnızca son 30 günü siler; inceleme modu ve gelişmiş filtreler ücretli paketlerdedir. NukeAll tarih seçicisini, tek tek onay ekranını, Reddit üzerine yazmayı ve resmi veri arşivi desteğini tamamen ücretsiz ve açık kaynak sunar.' },
      { title: 'NukeAll vs TweetDeleter / TweetEraser', body: 'TweetDeleter gibi bulut servisler aylık abonelik ister, hesabınızı kendi sunucuları üzerinden işler ve yalnızca X ile sınırlıdır. NukeAll verini hiçbir yere göndermeyen ücretsiz bir tarayıcı eklentisidir; ayrıca Instagram, Reddit ve LinkedIn’i de destekler.' },
      { title: 'NukeAll vs Cyd', body: 'Cyd, X için yerel arşivi bulunan iyi bir açık kaynak masaüstü uygulamasıdır. NukeAll kurulumsuz bir eklenti olarak doğrudan tarayıcında çalışır; Instagram (DM geri çekme dahil), Reddit üzerine yazma ve LinkedIn tarih filtresini ücretsiz sunar.' },
      { title: 'NukeAll vs Power Delete Suite / Shreddit', body: 'Reddit scriptleri ücretsizdir ancak teknik kurulum veya eski arayüz ister ve liste sınırlarına takılır. NukeAll sade bir ekrandan yorumların üzerine yazıp siler ve resmi Reddit veri indirmesiyle tüm geçmişini temizler.' },
    ],
  },
  faq: {
    h1: 'Sıkça sorulan sorular',
    homeTitle: 'SSS',
    intro: 'Geçmişini temizlemeden önce merak edebileceğin her şey.',
    more: 'Tüm sorular',
    items: [
      { q: 'Hesabım banlanır veya kısıtlanır mı?', a: 'Sosyal medya siteleri çok hızlı otomatik işlemleri kısıtlayabilir. NukeAll varsayılan olarak insansı bekleme süreleri, günlük güvenlik limiti ve uyarı algıladığında otomatik duraklama kullanır. Varsayılan Güvenli hızda kullanırsan normal kullanım sınırlarında kalırsın. Kullanım kendi sorumluluğundadır.' },
      { q: 'Verilerim nereye gidiyor?', a: 'Hiçbir yere. Tarama, tarih filtreleme, yedekler ve özet dosyalar tamamen kendi tarayıcının içinde işlenir. NukeAll’un hiçbir sunucusu yoktur ve hiçbir zaman şifreni istemez.' },
      { q: 'Neden ücretsiz? Güvenebilir miyim?', a: 'NukeAll gönüllü bağışlarla ayakta duran %100 açık kaynak (GPL-3.0) bir yazılımdır. Reklam, veri satışı veya ücretli sürüm yoktur. İsteyen herkes kaynak kodun her satırını GitHub’da inceleyebilir.' },
      {
        q: 'Nasıl kurarım?',
        a: 'GitHub Releases sayfasındaki Assets bölümünden tarayıcına uygun zip paketini indir. Chrome, Edge veya Brave için Chrome paketini klasöre çıkar, tarayıcının Uzantılar sayfasından Geliştirici Modunu açıp “Paketlenmemiş öğe yükle” ile klasörü seç. Eklenti Firefox Add-ons mağazasında henüz yayınlanmadığı için Firefox kullanıcıları indirilen paketi about:debugging üzerinden tek adımda yükleyebilir.',
        href: 'https://nukeall.app/tr/kurulum/',
        linkLabel: 'Adım adım kurulum rehberine git (https://nukeall.app/tr/kurulum/) →',
      },
      { q: 'Yasal mı? Platform kurallarına uygun mu?', a: 'Kendi paylaşımlarını silmek senin hakkındır ve her platform bunu elle yapmana izin verir. NukeAll yalnızca kendi açık oturumunda tek tek tıklama zahmetini güvenli bir hızda otomatikleştirir. Bu bilgi hukuki tavsiye değildir.' },
      { q: 'Başkalarının içeriklerini silebilir mi?', a: 'Hayır. NukeAll yalnızca kendi hesabına ait gönderi, yanıt, yorum, beğeni, repost, yer imi ve giden DM mesajlarını temizler. Başkalarının içeriklerine asla dokunmaz.' },
      { q: 'Yıllar önceki çok eski paylaşımlarımı silebilir miyim?', a: 'Evet. Platformlar zaman çizelgesinde son birkaç bin içeriği gösterdiği için X, Instagram, Reddit veya LinkedIn’den indireceğin resmi veri arşivini NukeAll’a yükleyerek yıllar önceki geçmişini de temizleyebilirsin.' },
      { q: 'Silme işlemi geri alınabilir mi?', a: 'Hayır — silme işlemi kalıcıdır. Bu yüzden NukeAll her şeyi önce onay ekranında gösterir, istersen tek tıkla kişisel yedeğini indirmeni sağlar ve başlatmadan önce 10 saniyelik iptal süresi verir.' },
    ] as FaqItem[],
  },
  install: {
    h1: 'NukeAll Kurulumu',
    intro: 'NukeAll; Firefox, Chrome, Edge ve Brave üzerinde çalışır. Aşağıdan tarayıcını seç — kurulum yaklaşık bir dakika sürer.',
    firefoxTitle: 'Firefox',
    amoTitle: 'Seçenek B — Firefox Add-ons (mağaza yayını açılınca)',
    amoSteps: [
      '<strong>addons.mozilla.org</strong> üzerindeki NukeAll sayfasını aç.',
      '<strong>Firefox’a Ekle</strong> butonuna bas ve izinleri onayla (yalnızca x.com, twitter.com, instagram.com, reddit.com ve linkedin.com).',
      'NukeAll’u araç çubuğuna sabitle veya yan panelden aç.',
    ],
    amoSoon: 'Eklenti henüz Firefox Add-ons mağazasında yayınlanmadı. Şimdilik hemen aşağıdaki GitHub Releases adımlarıyla kurabilirsin.',
    tempTitle: 'GitHub Releases ile Kurulum (about:debugging)',
    tempSteps: [
      'GitHub Releases’daki (Assets altında) en güncel <code>nukeall-firefox.zip</code> dosyasını indir.',
      'Adres çubuğuna <code>about:debugging#/runtime/this-firefox</code> yaz.',
      '<strong>Geçici Eklenti Yükle…</strong> butonuna tıkla ve indirdiğin zip dosyasını (veya açtığın klasördeki <code>manifest.json</code> dosyasını) seç.',
      'Geçici eklentiler Firefox kapanınca kaldırılır — Add-ons mağaza yayını açılana kadar açılışta bu adımla kolayca yükleyebilirsin.',
    ],
    chromeTitle: 'Chrome, Edge ve Brave',
    chromeSteps: [
      'En güncel GitHub Release’den (Assets altında) <code>nukeall-chrome.zip</code> dosyasını indir.',
      'Silmeyeceğin kalıcı bir klasöre çıkar.',
      '<code>chrome://extensions</code> — veya <code>edge://extensions</code> / <code>brave://extensions</code> sayfasını aç.',
      '<strong>Geliştirici modu</strong> anahtarını aç (sağ üstte veya Edge’de sol altta).',
      '<strong>Paketlenmemiş öğe yükle</strong> (Load unpacked) butonuna bas ve çıkardığın klasörü seç.',
      'NukeAll’u sabitle ve simgeye tıklayıp yan paneli aç.',
    ],
    devNote: 'Chromium başlangıçta “geliştirici modu uzantıları” uyarısı gösterebilir. Chrome Web Mağazası dışından kurulan açık kaynak eklentiler için bu normaldir.',
    afterTitle: 'Kurulumdan sonra',
    afterSteps: [
      'x.com, instagram.com, reddit.com veya linkedin.com adresine gir ve normal şekilde oturum aç.',
      'NukeAll’u aç ve içerik türünü seç → tarih/kelime ile filtrele → incele ve sil.',
      'Büyük temizliklerde varsayılan Güvenli hız ayarını koru.',
    ],
    download: 'GitHub Releases’dan İndir',
    openAmo: 'Firefox Add-ons’ı Aç',
  },
  sponsor: {
    h1: 'NukeAll’a Destek Ol',
    intro: 'NukeAll reklamsız, takipsiz ve ücretli paketsiz olarak sonsuza kadar ücretsizdir. Sosyal ağlar arayüzlerini sürekli değiştiriyor — bağışların eklentinin güncel ve çalışır kalması için harcanan zamanı karşılar.',
    ghBtn: 'GitHub Sponsors ile Destek Ol',
    kofiBtn: 'Ko-fi üzerinden Bağış Yap',
    tiersTitle: 'Destek Kademeleri',
    perMonth: '/ay',
    tiers: [
      { price: 3, name: 'Kahve', perks: 'İçten teşekkürümüz ve sunucu masrafsız geliştirmeye katkı.' },
      { price: 10, name: 'Destekçi', perks: 'Sponsor duvarında ismin yer alır.' },
      { price: 50, name: 'Şampiyon', perks: 'Sponsor duvarında ve README’de isim + bağlantı.' },
      { price: 250, name: 'Koruyucu', perks: 'Web sitesi ve README’de logo + platform bozulmalarında öncelik.' },
    ],
    wallTitle: 'Sponsor Duvarı',
    wallEmpty: 'İlk destekçi sen ol — ismin burada görünebilir.',
    otherTitle: 'Destek olmanın diğer yolları',
    other: [
      'GitHub’da depoyu yıldızla.',
      'Bir platform arayüz değiştirdiğinde bozulan seçiciyi bildir.',
      'NukeAll’u yeni bir dile çevirmeye yardım et.',
      'Dijital geçmişini temizlemek isteyen bir arkadaşına öner.',
    ],
    note: 'Bağlantılar doğrudan GitHub Sponsors veya Ko-fi sayfasına gider — sitemizde gömülü widget veya izleyici yoktur.',
  },
  privacyPage: {
    h1: 'Gizlilik Politikası',
    updated: 'Son güncelleme: Kasım 2026',
    sections: [
      { title: 'Özet', body: ['NukeAll eklentisi hiçbir kişisel veri toplamaz. Sunucu, üyelik, analitik ve telemetri yoktur. Bu web sitesi yalnızca çerezsiz Cloudflare Web Analytics kullanır.'] },
      { title: 'Tarayıcı Eklentisi', body: [
        'Tüm işlemler — tarama, tarih filtreleme, yedekler, çevrimdışı arşiv ve silme raporları — tamamen kendi tarayıcının içinde çalışır. Veriler yalnızca tarayıcının yerel depolama alanında ve IndexedDB’de tutulur, bize gönderilmez.',
        'Eklenti yalnızca temizlemeyi seçtiğin platformlarla (x.com, twitter.com, instagram.com, reddit.com, linkedin.com) açık oturumun üzerinden iletişim kurar.',
        'Content-Security-Policy ayarı ağ bağlantılarını kısıtlar; uzaktan kod, CDN, analitik veya çökme raporu içermez. GPL-3.0 kaynak kodunu inceleyerek doğrulayabilirsin.',
        'Eklentiyi kaldırdığında yerel verileri silinir. İndirdiğin yedekler ve raporlar cihazında kendi kontrolünde kalır.',
      ] },
      { title: 'Bu Web Sitesi', body: [
        'nukeall.app Cloudflare Pages üzerinde barındırılan statik bir sitedir. Fontlar ve varlıklar doğrudan kendi alan adımızdan sunulur; üçüncü taraf reklam, widget veya gömülü script yoktur.',
        'Ziyaret istatistikleri için çerez ve parmak izi kullanmayan Cloudflare Web Analytics kullanıyoruz; yalnızca toplam sayfa görüntülenme ve yönlendiren bilgisi sağlar.',
        'Dil öneri bandını kapatırsan bu tercih yalnızca tarayıcının localStorage alanında saklanır.',
        'Barındırma sağlayıcısı Cloudflare, güvenlik ve teslimat amacıyla teknik istek verilerini (IP adresi gibi) işleyebilir.',
      ] },
      { title: 'Bağışlar', body: ['Sponsor butonları GitHub Sponsors ve Ko-fi’ye yönlendirir. Bu servislerin kendi gizlilik politikaları geçerlidir.'] },
      { title: 'İletişim', body: ['Soruların için GitHub deposunda issue açabilirsin.'] },
    ],
  },
  ctaBand: {
    title: 'Temiz bir başlangıca hazır mısın?',
    body: 'Ücretsiz, sınırsız ve gizli. Bir dakikadan kısa sürede kur.',
  },
  footer: {
    tagline: 'Ücretsiz ve açık kaynak sosyal medya geçmişi temizleyici.',
    license: 'GPL-3.0-or-later lisansı ile lisanslıdır.',
    disclaimer: 'X Corp, Meta, Reddit veya LinkedIn ile hiçbir resmi bağı yoktur. Tüm markalar ilgili sahiplerine aittir.',
    source: 'Kaynak kod',
    guides: 'Rehberler',
    product: 'Ürün',
    project: 'Proje',
    language: 'Dil',
  },
  banner: {
    text: 'This page is also available in English.',
    action: 'Switch to English',
    dismiss: 'Kapat',
  },
  notFound: {
    h1: 'Burada hiçbir şey yok — belki çoktan silinmiştir.',
    body: 'Aradığın sayfa mevcut değil.',
    home: 'Ana sayfaya dön',
  },
};
