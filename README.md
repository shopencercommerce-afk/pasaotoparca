 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..5b63ac2cf5e88ba59652508d43cc6e48aeffded3
--- /dev/null
+++ b/README.md
@@ -0,0 +1,65 @@
+# Pasapotoparca.com
+
+Pasapotoparca.com, **oto yedek parça satışı** odaklı bir e-ticaret web sitesi projesidir.
+
+## Proje Amacı
+
+Bu projenin ana hedefi:
+
+- Tedarikçilerden gelen ürünleri **XML feed** üzerinden otomatik olarak çekmek,
+- Ürünleri web sitesinde güncel şekilde yayınlamak,
+- Kullanıcıların araçlarına uygun parçayı kolayca bulmasını sağlamak,
+- Özellikle **şase sorgu** ve **parça uyumluluğu** (araç marka/model/motor) özellikleriyle yanlış parça siparişini azaltmaktır.
+
+## Hedeflenen Temel Özellikler
+
+1. **Ürün Yönetimi (XML Entegrasyonu)**
+   - Birden fazla tedarikçiden XML ile ürün çekme
+   - Periyodik güncelleme (stok, fiyat, ürün bilgileri)
+   - Kategori ve marka eşleştirme
+
+2. **Araç Bazlı Uyumluluk Sistemi**
+   - Araç marka / model / yıl / motor seçimi
+   - Seçilen araca uygun parçaları filtreleme
+   - Uyumsuz ürünleri otomatik eleme
+
+3. **Şase (VIN) ile Sorgulama**
+   - Kullanıcının şase numarası ile araç bilgisini doğrulama
+   - Doğrulanan araca göre uyumlu parça önerisi
+   - Sipariş hatalarını azaltan kontrol mekanizması
+
+4. **E-Ticaret Altyapısı**
+   - Ürün listeleme ve detay sayfaları
+   - Sepet ve ödeme akışı
+   - Sipariş takibi ve müşteri hesabı
+
+## İlk Aşama Yol Haritası
+
+### 1) Temel Altyapı
+- Proje klasör yapısının oluşturulması
+- Veritabanı modeli tasarımı (ürün, araç, uyumluluk, tedarikçi)
+- Yönetim paneli ve API iskeleti
+
+### 2) XML Tedarikçi Entegrasyonu
+- XML import servisi
+- Mapping kuralları (tedarikçi alanları → sistem alanları)
+- Zamanlanmış senkronizasyon (cron/job)
+
+### 3) Uyumluluk Motoru
+- Araç/veri sözlüğü (marka-model-motor)
+- Parça ↔ araç uyumluluk eşleştirme
+- Filtreleme ve arama performansı optimizasyonu
+
+### 4) Şase Sorgu Modülü
+- VIN doğrulama altyapısı
+- Şaseye göre araç kimliği çıkarımı
+- Uyumlu parça öneri akışı
+
+### 5) Yayına Hazırlık
+- SEO ve performans optimizasyonu
+- Hata/izleme/loglama
+- Canlıya alma (domain, SSL, yedekleme, güvenlik)
+
+## Not
+
+Bu README bir başlangıç dokümanıdır. İlerleyen adımlarda teknik mimari, teknoloji seçimi, API sözleşmeleri ve geliştirme standartları ayrıca dokümante edilecektir.
 
EOF
)
