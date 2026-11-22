# NukeAll (Türkçe)

[English](README.md) · [Web Sitesi](https://nukeall.app/tr/) · [Gizlilik](PRIVACY.md) · [Destek Ol](https://nukeall.app/tr/destek/)

**Ücretsiz, açık kaynak (`GPL-3.0-or-later`), %100 yerel sosyal medya geçmişi temizleyici.**

NukeAll; **yalnızca kendi** gönderi, yanıt, yorum, beğeni, repost ve yer imlerini doğrudan tarayıcının içinde toplu olarak siler — sunucusuz, üyeliksiz, telemetrisiz ve ücretli limit olmadan.

## Özellikler (X, Instagram, Reddit ve LinkedIn Hazır)

- **Sınırsız ve ücretsiz:** 30 gün sınırı, kredi veya abonelik yok.
- **X (Twitter):** Seçilen türe göre Yanıtlar, Beğeniler, Yer İmleri veya Profile otomatik gider; pasif GraphQL okuyucu + çalışma zamanı queryId keşfi + DOM yedeği + `tweets.js`/`like.js` arşiv içe aktarma.
- **Instagram:** Hareketlerin (Yorumlar, Beğeniler, Gönderiler) sayfalarına ve Direct sohbetlerde yalnızca kendi gönderdiğin mesajları geri almaya (unsend) otomatik gider; oturum API + pasif Bloks/GraphQL okuyucu + shortcode-mediaId dönüşümü + DOM yedeği + Türkçe karakter düzeltmeli JSON arşiv içe aktarma.
- **Reddit:** Yorumlar/Gönderiler geçmişine otomatik gider; silmeden önce **çok geçişli üzerine yazma (0–3 tur)** (rastgele veya özel metin + yalnızca üzerine yazma modu) ve `comments.csv`/`posts.csv` arşiv içe aktarma.
- **LinkedIn:** `/in/<handle>/recent-activity/{all,comments,reactions}/` sayfalarına otomatik gider; 64-bit Snowflake URN'lerden (`BigInt >> 22n`) kesin oluşturma tarihini çözer, göreceli TR/EN tarihleri yorumlar, `Shares.csv`/`Comments.csv`/`Reactions.csv` arşivlerini destekler ve güvenli DOM tıklama otomasyonu kullanır.
- **Tek tür tarama:** Bozulmaları önlemek için her taramada tek bir içerik türü seçilir.
- **Tarih seçici ve İnceleme ızgarası:** İncele & Sil ekranında doğrudan takvim (`Başlangıç`/`Bitiş`) veya tek tık kısayollar (`30 g+`, `6 ay+`, `1 yıl+`, `Sıfırla`) ile eski gönderileri daralt; kelime, regex, medya, risk veya beğeni/sabitlenme koruması uygula.
- **Yerel risk taraması:** EN + TR küfür listesi, e-posta, telefon, IBAN, sağlama kontrollü TC Kimlik No, Luhn kontrollü kart numarası ve gece saati (01:00–05:00) tespiti.
- **Manuel yedek ve raporlar:** İsteğe bağlı tek tıkla JSON/CSV yedek, tek dosya çevrimdışı HTML arşiv, 10 saniyelik iptal süresi, kaldığı yerden devam ve HTML/JSON silme raporu.
- **Çift dil:** Türkçe ve İngilizce arayüz, karanlık ve aydınlık tema.

## Gizlilik Garantisi

- Eklenti CSP politikası `connect-src 'self'` uygular.
- İzinler yalnızca temizlenen platformlarla (`x.com`, `twitter.com`, `instagram.com`, `reddit.com`, `linkedin.com`) sınırlıdır.
- `npm run check:network` CI testi derlenmiş eklenti çıktısında izin dışı URL bulursa build'i kırar; `npm run check:licenses` ise `GPL-3.0-or-later` lisans uyumluluğunu doğrular.

## Katkı ve Marka Yönetişimi

- Pull Request açan katkıcılar projenin uzun vadeli sürdürülebilirliği için [CLA.md](CLA.md) metnini onaylar ([`cla-signatures.json`](cla-signatures.json)).
- NukeAll adı, simgeleri ve `nukeall.app` alan adı kullanım koşulları [TRADEMARK.md](TRADEMARK.md) dosyasında tanımlıdır.

## Sorumluluk Reddi

Platformlar kullanım koşullarında hızlı otomasyonu kısıtlar. Varsayılan **Güvenli** hızı ve günlük güvenli limiti açık tutun. Kullanım kendi sorumluluğunuzdadır. X Corp, Meta, Reddit veya LinkedIn ile resmi bağı yoktur.

## Lisans

[GPL-3.0-or-later](LICENSE)
