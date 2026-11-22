import type { Dict } from './en';

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
    eyebrow: 'Ücretsiz ve açık kaynak · GPL-3.0',
    h1Lead: 'Sosyal medya geçmişini sil.',
    h1Tail: 'Ücretsiz. Açık kaynak. Hiçbir veri tarayıcından çıkmaz.',
    sub: 'NukeAll; X (Twitter), Instagram ve Reddit’teki kendi gönderi, yanıt, yorum, beğeni ve repostlarını toplu olarak siler — sınırsız, filtreli ve onaylı. Sunucu yok, hesap yok, takip yok.',
    ctaFirefox: 'Firefox’a Ekle',
    soon: 'yakında',
    ctaChrome: 'Chrome / Edge / Brave için İndir',
    ctaGithub: 'GitHub’da Yıldızla',
    note: 'Firefox, Chrome, Edge ve Brave üzerinde çalışır. Verilerin cihazından dışarı çıkmaz.',
  },
  platforms: {
    title: 'Platformlar',
    live: 'Destekleniyor',
    soon: 'Yakında',
  },
  features: {
    title: 'Ücretli araçların sattığı her şey — ücretsiz',
    subtitle: 'Sadece fiyatta değil, özelliklerde de abonelikli silme araçlarını geçmek için tasarlandı.',
    items: [
      { icon: '∞', title: 'Sınırsız ve ücretsiz', body: '30 gün kısıtı yok, günlük silme limiti yok, kredi yok, ücretli paket yok. İster 50 ister 500.000 içerik sil.' },
      { icon: '🗄️', title: 'Arşiv modu', body: 'X, Instagram veya Reddit veri arşivini yükle; 3.200 tweet ve 1.000 öğe platform sınırlarının ötesine geç.' },
      { icon: '🔍', title: 'İnceleme ızgarası', body: 'İçerikleri tek tek ara, sırala ve seç. “N öğeyi sil” onayını verene kadar tek bir gönderi bile silinmez.' },
      { icon: '⚠️', title: 'Yerel risk taraması', body: 'Küfür (EN + TR kelime listeleri), telefon, e-posta, IBAN, TC kimlik numarası ve kart numarasını çevrimdışı tespit eder.' },
      { icon: '⏳', title: 'Geçici mod (Disappearing)', body: '“30 günden eski her şeyi her gün sil” gibi otomatik kurallar. Ücretli ek paket değil, tamamen ücretsiz.' },
      { icon: '✍️', title: 'Reddit çok geçişli üzerine yazma', body: 'Yorumları silmeden önce 1–3 tur rastgele ya da özel metinle değiştirir; hemen veya N gün sonra siler.' },
      { icon: '💾', title: 'Yedek + silme raporu', body: 'Silmeden önce tek tıkla manuel yerel yedek (JSON/CSV/HTML) ve neyin ne zaman silindiğini belgeleyen silme raporu.' },
      { icon: '📦', title: 'Çevrimdışı HTML arşiv', body: 'İnternet olmadan açılabilen, içinde arama ve filtre yapılabilen tek dosya kişisel HTML arşivi dışa aktar.' },
      { icon: '⏯️', title: 'Kaldığın yerden devam', body: 'İlerleme sürekli kaydedilir. Tarayıcı kapansa bile açtığında tam kaldığın yerden devam edebilirsin.' },
      { icon: '🎛️', title: 'Hazır profiller ve koruma', body: '“İş başvurusu öncesi”, “Tam sıfırlama”, “Sadece beğeniler”… Sabitlenen veya popüler gönderileri koru, profili JSON paylaş.' },
      { icon: '🐢', title: 'Güvenli hız sınırları', body: 'Güvenli / Normal / Hızlı modlar, rastgele gecikme, rate-limit algılayınca otomatik bekleme ve günlük güvenli limit.' },
      { icon: '🌍', title: 'Türkçe ve İngilizce', body: 'Tam Türkçe ve İngilizce arayüz, karanlık ve aydınlık tema, klavye dostu ve erişilebilir tasarım.' },
    ],
  },
  how: {
    title: 'Nasıl çalışır?',
    steps: [
      { title: 'Kur ve platformu seç', body: 'Eklentiyi tarayıcına ekle, X, Instagram veya Reddit oturumunu aç ve hazır bir profil veya kendi filtrelerini seç.' },
      { title: 'Tara ve incele', body: 'NukeAll zaman çizelgeni (veya veri arşivini) tarar, riskli içerikleri işaretler ve hepsini inceleme tablosunda gösterir.' },
      { title: 'Yedekle ve sil', body: 'İstersen tek tıkla yerel yedeğini indir, 10 saniyelik iptal süresi verilir ve ardından güvenli hızda silme işlemi raporla tamamlanır.' },
    ],
  },
  privacy: {
    title: 'Sözle değil, mimariyle gizlilik',
    body: 'NukeAll tamamen tarayıcının içinde, mevcut oturumunla çalışır. Verinin gideceği bir NukeAll sunucusu yoktur — bu yüzden sızdırılamaz veya satılamaz.',
    points: [
      { title: 'Sıfır sunucu', body: 'Eklenti yalnızca x.com, instagram.com ve reddit.com ile konuşur. Arka uç yok, üyelik yok, OAuth yok.' },
      { title: 'Sıfır telemetri', body: 'Analitik, hata raporu veya uzaktan kod yok. Bilinmeyen bir URL koda sızarsa CI otomatik testi build’i kırar.' },
      { title: 'CSP ile kilitli', body: 'Eklenti güvenlik politikası connect-src \'self\' kuralı taşır; tarayıcı başka bağlantıları doğrudan engeller.' },
      { title: 'Denetlenebilir kod', body: 'Her satır GitHub’da GPL-3.0 lisansıyla açık. Kendi bilgisayarında derleyip doğrulayabilirsin.' },
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
      'Açık kaynak',
      'Kurulumsuz (tarayıcı eklentisi)',
      'Sıfır sunucu, sıfır telemetri',
      'X + Instagram + Reddit tek araçta',
      'Arşiv modu (platform sınırlarını aşar)',
      'İnceleme ızgarası (tek tek seç/çıkar)',
      'Çevrimdışı HTML arşiv görüntüleyici',
      'Yerel risk taraması (küfür, kişisel veri)',
      'Geçici mod (N günden eskiyi otomatik sil)',
      'Reddit çok geçişli üzerine yazma + gecikmeli silme',
      'Koruma kuralları (sabitlenen / popüler)',
      'Çökme sonrası kaldığı yerden devam',
      'Paylaşılabilir hazır ayarlar (JSON)',
      'Silme raporu (yerel kanıt dosyası)',
      'Türkçe arayüz',
    ],
    notes: { paid: 'ücretli', xOnly: 'sadece X', cloud: 'bulut', gpl: 'GPL-3', free: 'ücretsiz', xPaid: 'sadece X, ücretli' },
    alts: [
      { title: 'NukeAll vs Redact.dev', body: 'Redact.dev pek çok platformu destekler ancak ücretsiz sürümü yalnızca son 30 günü siler; yapay zekâ içerik filtresi ve inceleme modu gibi özellikler ücretli paketlerdedir. NukeAll inceleme ızgarasını, risk taramasını ve geçici modu tamamen ücretsiz ve açık kaynak sunar.' },
      { title: 'NukeAll vs TweetDeleter / TweetEraser', body: 'TweetDeleter gibi bulut servisler aylık abonelik ister, hesabınızı kendi sunucuları üzerinden işler ve yalnızca X ile sınırlıdır. NukeAll verini hiçbir yere göndermeyen ücretsiz bir tweet silme eklentisidir ve Instagram ile Reddit’i de destekler.' },
      { title: 'NukeAll vs Cyd', body: 'Cyd, X için yerel arşivi bulunan iyi bir açık kaynak masaüstü uygulamasıdır. NukeAll benzer çevrimdışı arşivi hafif bir tarayıcı eklentisine taşır, Instagram ile Reddit ekler ve gelişmiş silme kurallarını ücretsiz sunar.' },
      { title: 'NukeAll vs Power Delete Suite / Shreddit', body: 'Reddit scriptleri ücretsizdir ancak Python, API anahtarı veya eski arayüz ister ve 1.000 öğe sınırına takılır. NukeAll modern bir arayüzden yorumların üzerine yazar ve Reddit veri arşiviyle bu sınırı aşar.' },
    ],
  },
  faq: {
    h1: 'Sıkça sorulan sorular',
    homeTitle: 'SSS',
    intro: 'Geçmişini silmeden önce bilmen gereken her şey.',
    more: 'Tüm sorular',
    items: [
      { q: 'Hesabım banlanır veya kısıtlanır mı?', a: 'X ve Meta otomasyonu kurallarında kısıtlar; çok hızlı toplu işlemler geçici kısıtlamaya yol açabilir. NukeAll varsayılan olarak Güvenli hız, rastgele gecikmeler, platform uyarısında otomatik bekleme ve günlük güvenlik limiti kullanır. Varsayılan ayarları korursan normal kullanım sınırlarında kalırsın. Kullanım kendi sorumluluğundadır.' },
      { q: 'Verilerim nereye gidiyor?', a: 'Hiçbir yere. Tarama, risk analizi, yedekler ve silme raporları tamamen kendi tarayıcının içinde gerçekleşir. Eklenti yalnızca temizlediğin platforma (x.com, instagram.com, reddit.com) açık oturumun üzerinden bağlanır. NukeAll sunucusu yoktur.' },
      { q: 'Neden ücretsiz? Altında başka bir şey var mı?', a: 'Hayır, hiçbir gizli çıkar yok. NukeAll GPL-3.0 lisanslı açık kaynak yazılımdır ve GitHub Sponsors ile Ko-fi üzerinden gönüllü bağışlarla yaşar. Reklam, veri satışı veya ücretli abonelik yoktur.' },
      { q: 'Chrome, Edge veya Brave’e nasıl kurarım?', a: 'GitHub Releases sayfasından Chromium zip dosyasını indir ve klasöre çıkar. chrome://extensions (veya edge://extensions / brave://extensions) adresini aç, Geliştirici Modunu aktifleştir, “Paketlenmemiş öğe yükle”ye basıp çıkardığın klasörü seç. Firefox kullanıcıları Firefox Add-ons üzerinden tek tıkla kurabilir.' },
      { q: 'Yasal mı? Platform kurallarına aykırı mı?', a: 'Kendi içeriğini silmek senin hakkındır ve her platform bunu elle yapmana izin verir. NukeAll sadece kendi tarayıcı oturumundan yapacağın tıklamaları otomatikleştirir. Platformlar kullanım koşullarında otomasyonu hoş görmediği için NukeAll bilerek yavaş çalışır. Bu bilgi hukuki tavsiye değildir.' },
      { q: 'Başkalarının içeriklerini silebilir mi?', a: 'Hayır. NukeAll yalnızca oturum açtığın hesabın kendi gönderi, yanıt, yorum, beğeni, repost ve yer imlerini hedefler. Başkalarına dokunan (toplu şikâyet, takipçi aracı gibi) hiçbir özellik eklentide yer almaz.' },
      { q: 'X’teki 3.200 tweet sınırını aşabilir miyim?', a: 'Evet. Resmi X veri arşivindeki tweets.js / like.js dosyasını (veya Instagram JSON / Reddit CSV arşivini) yükleyerek zaman çizelgesinde görünmeyen yıllar öncesindeki içerikleri de silebilirsin.' },
      { q: 'Silme işlemi geri alınabilir mi?', a: 'Hayır — silme kalıcıdır. Bu yüzden inceleme ekranı varsayılan olarak açıktır, silmeden önce istersen tek tıkla yerel yedek indirebilirsin ve işlem başlamadan önce 10 saniyelik iptal süresi verilir.' },
    ],
  },
  install: {
    h1: 'NukeAll Kurulumu',
    intro: 'NukeAll; Firefox, Chrome, Edge ve Brave üzerinde çalışır. Aşağıdan tarayıcını seç — kurulum yaklaşık bir dakika sürer.',
    firefoxTitle: 'Firefox',
    amoTitle: 'Seçenek A — Firefox Add-ons (önerilen)',
    amoSteps: [
      '<strong>addons.mozilla.org</strong> üzerindeki NukeAll sayfasını aç.',
      '<strong>Firefox’a Ekle</strong> butonuna bas ve izinleri onayla (yalnızca x.com, twitter.com, instagram.com ve reddit.com).',
      'NukeAll’u araç çubuğuna sabitle veya yan panelden aç.',
    ],
    amoSoon: 'Firefox Add-ons mağaza kaydı çok yakında yayında olacak. O zamana kadar Seçenek B’yi kullanabilirsin.',
    tempTitle: 'Seçenek B — Geçici kurulum (about:debugging)',
    tempSteps: [
      'GitHub Releases’dan en güncel <code>nukeall-firefox.zip</code> (veya <code>.xpi</code>) dosyasını indir.',
      'Adres çubuğuna <code>about:debugging#/runtime/this-firefox</code> yaz.',
      '<strong>Geçici Eklenti Yükle…</strong> butonuna tıkla ve indirdiğin dosyayı (veya açtığın klasördeki <code>manifest.json</code> dosyasını) seç.',
      'Geçici eklentiler Firefox kapanınca kaldırılır — Add-ons yayına girene kadar açılışta tekrar yükleyebilirsin.',
    ],
    chromeTitle: 'Chrome, Edge ve Brave',
    chromeSteps: [
      'En güncel GitHub Release’den <code>nukeall-chromium.zip</code> dosyasını indir.',
      'Silmeyeceğin kalıcı bir klasöre çıkar.',
      '<code>chrome://extensions</code> — veya <code>edge://extensions</code> / <code>brave://extensions</code> sayfasını aç.',
      '<strong>Geliştirici modu</strong> anahtarını aç (sağ üstte veya Edge’de sol altta).',
      '<strong>Paketlenmemiş öğe yükle</strong> (Load unpacked) butonuna bas ve çıkardığın klasörü seç.',
      'NukeAll’u sabitle ve simgeye tıklayıp yan paneli aç.',
    ],
    devNote: 'Chromium başlangıçta “geliştirici modu uzantıları” uyarısı gösterebilir. Chrome Web Mağazası dışından kurulan açık kaynak eklentiler için bu normaldir.',
    afterTitle: 'Kurulumdan sonra',
    afterSteps: [
      'x.com, instagram.com veya reddit.com adresine gir ve normal şekilde oturum aç.',
      'NukeAll’u aç ve 3 adımlı sihirbazı izle: platform → profil → incele ve sil.',
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
        'Tüm işlemler — tarama, filtreleme, risk analizi, yedekler, çevrimdışı arşiv ve silme raporları — tamamen kendi tarayıcının içinde çalışır. Veriler yalnızca tarayıcının yerel depolama alanında ve IndexedDB’de tutulur, bize gönderilmez.',
        'Eklenti yalnızca temizlemeyi seçtiğin platformlarla (x.com, twitter.com, instagram.com, reddit.com) açık oturumun üzerinden iletişim kurar.',
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
