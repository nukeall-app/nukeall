# NukeAll (Türkçe)

[English](README.md) · [Web Sitesi](https://nukeall.pages.dev/tr/) · [Kurulum Rehberi](https://nukeall.pages.dev/tr/kurulum/) · [Gizlilik](PRIVACY.md) · [Destek Ol](https://nukeall.pages.dev/tr/destek/)

**Ücretsiz, açık kaynak (`GPL-3.0-or-later`), %100 tarayıcında çalışan sosyal medya geçmişi temizleyici.**

NukeAll; **yalnızca kendi** gönderi, yanıt, yorum, beğeni, repost, yer imi ve giden sohbet (DM) mesajlarını doğrudan tarayıcının içinde toplu olarak siler — **sunucu yok, şifre istemez, takip yok ve ücretli sınır yok**.

## Desteklenen Platformlar ve Özellikler

- **Tamamen ücretsiz ve sınırsız:** 30 gün sınırı, günlük kota veya abonelik yok.
- **X (Twitter):** Eski tweet, yanıt, beğeni, repost ve yer imlerini otomatik olarak temizler; yıllar öncesindeki paylaşımlar için resmi X veri arşivini de destekler.
- **Instagram:** Eski yorum, beğeni ve gönderileri siler; sohbetlerde **yalnızca kendi gönderdiğin** DM mesajlarının gönderimini geri alır (`unsend`) ve resmi Instagram veri indirmesini sorunsuz işler.
- **Reddit:** Silmeden önce yorum ve gönderilerin üzerine **0–3 tur** rastgele veya belirlediğin metni yazarak eski cümlelerinin kalmamasını sağlar; resmi Reddit veri arşiviyle çok eski geçmişe de ulaşır.
- **LinkedIn:** Yeni paylaşımlarına dokunmadan takvimden tarih seçerek (veya tek tıkla `30 gün+`, `6 ay+`, `1 yıl+`) eski gönderi, yorum ve beğenilerini temizler; LinkedIn veri arşivini de destekler.
- **Çevrimdışı küfür filtresi:** İstersen silmeden önce İngilizce ve Türkçe küfür kelimelerini (veya kendi eklediğin kelimeleri) tarayıcının içinde otomatik işaretler.
- **Onay ekranı ve korumalar:** Sen onay vermeden hiçbir şey silinmez; sabitlenen, çok beğeni alan veya koruma kelimesi içeren paylaşımlar otomatik hariç tutulur.
- **Kişisel yedek ve özet:** İstersen silmeden önce bilgisayarında aranabilir kişisel bir yedek ve işlem sonunda temizlik özeti saklayabilirsin.
- **Hesap dostu hız:** İnsansı gecikmeler, platform uyardığında otomatik bekleme ve tarayıcı kapansa bile kaldığı yerden devam etme özelliği.
- **Çift dil ve tema:** Tam Türkçe / İngilizce arayüz, karanlık ve aydınlık tema.

## İndirme ve Kurulum

Chrome ve Firefox paketleri doğrudan **[GitHub Releases](https://github.com/nukeall-app/nukeall/releases/latest)** sayfasındaki **Assets** bölümünde (`SHA256SUMS.txt` doğrulama dosyasıyla birlikte) paylaşılır:

- **Chrome / Edge / Brave:** `nukeall-chrome.zip` dosyasını indirip klasöre çıkar, `chrome://extensions` üzerinden **Geliştirici modu**nu aç ve **Paketlenmemiş öğe yükle** ile klasörü seç.
- **Firefox:** Eklenti henüz Firefox Add-ons mağazasında yayında değil. `nukeall-firefox.zip` dosyasını indirip `about:debugging#/runtime/this-firefox` sayfasından **Geçici Eklenti Yükle…** ile yükleyebilirsin.
- Adım adım görsel rehber: **[nukeall.pages.dev/tr/kurulum/](https://nukeall.pages.dev/tr/kurulum/)**

## Gizlilik Garantisi

- Şifre, iki adımlı doğrulama kodu veya API anahtarı asla istenmez — zaten açık olan tarayıcı sekmenle çalışır.
- Tarayıcı güvenlik izinleri yalnızca desteklenen platformlarla (`x.com`, `twitter.com`, `instagram.com`, `reddit.com`, `linkedin.com`) sınırlıdır.
- Eklenti içinde hiçbir analiz, telemetri veya dış sunucu bağlantısı bulunmaz (her derlemede otomatik `npm run check:network` testiyle doğrulanır).
- Tüm açık kaynak bağımlılıklar CI ortamında `npm run check:licenses` ile denetlenir.

## Katkı ve Marka Yönetişimi

- Pull Request açan katkıcılar [CLA.md](CLA.md) sözleşmesini onaylar ([`cla-signatures.json`](cla-signatures.json)).
- NukeAll adı ve marka hakları [TRADEMARK.md](TRADEMARK.md) dosyasında tanımlıdır.

## Sorumluluk Reddi

Platformlar kullanım koşullarında hızlı otomasyonu kısıtlar. Varsayılan **Güvenli** hızı ve günlük güvenli limiti açık tutun. Kullanım kendi sorumluluğunuzdadır. X Corp, Meta, Reddit veya LinkedIn ile resmi bağı yoktur.

## Lisans

[GPL-3.0-or-later](LICENSE)
