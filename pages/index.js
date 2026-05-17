import brands from '../data/brands'
import products from '../data/products.json'

const wpUrl = 'https://wa.me/905077302703?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9-]+/g, '')
}

function productsUrl(brand, model) {
  const query = model ? `?brand=${brand}&model=${slugify(model)}` : `?brand=${brand}`
  return `/products/${query}`
}

function productCode(product) {
  return product.sku || product.refNo || product.internalCode || `urun-${product.id || product.no}`
}

function cleanImagePath(image) {
  if (!image) return '/logo.svg'
  const normalized = String(image).replace(/\\/g, '/')
  if (normalized.startsWith('/')) return normalized
  return '/' + normalized.replace(/^images\//, 'images/')
}

function parsePrice(priceText) {
  if (!priceText) return 0
  return Number(String(priceText).replace(/₺/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
}

function salePrice(product) {
  if (product.price) return formatPrice(Number(product.price))
  const cost = parsePrice(product.price3 || product.price2 || product.price1)
  if (!cost) return 'Fiyat sorunuz'
  if (cost <= 1000) return formatPrice(cost * 2)
  if (cost <= 10000) return formatPrice(cost * 1.5)
  return formatPrice(cost * 1.25)
}

const featuredProducts = products
  .filter(product => product.image && product.title)
  .slice(0, 6)

const serviceItems = [
  { title: 'Orijinal & Kaliteli Ürün', text: 'Güvenilir ve garantili parçalar' },
  { title: 'Hızlı Kargo', text: 'Türkiye’nin her yerine' },
  { title: '7/24 Destek', text: 'WhatsApp ile anında destek' },
  { title: 'Güvenli Sipariş', text: 'Parça koduyla teklif alın' }
]

export default function Home() {
  return (
    <main className="page">
      <div className="topBar">
        <div><strong>Hızlı Kargo</strong><span>Türkiye’nin Her Yerine</span></div>
        <div><strong>%100 Güvenli Alışveriş</strong><span>SSL Sertifikalı Altyapı</span></div>
        <div><strong>Destek Hattı</strong><span>WhatsApp ile teklif alın</span></div>
      </div>

      <header className="header">
        <a href="/" className="logoArea">
          <img src="/logo.svg" alt="Paşa Oto Parça" />
        </a>
        <div className="searchBox">
          <span>Ürün, kategori veya parça kodu ara...</span>
          <b>⌕</b>
        </div>
        <div className="accountArea">
          <a href={wpUrl}>Hesabım<br /><span>Giriş Yap</span></a>
          <a href="/cart/">Sepetim<br /><span>0,00 TL</span></a>
        </div>
      </header>

      <nav className="mainNav">
        <a href="/products/" className="categoryBtn">☰ TÜM KATEGORİLER</a>
        <a href="/">Ana Sayfa</a>
        <a href="/products/">Katalog</a>
        <a href={wpUrl}>İletişim</a>
        {brands.map(brand => <a key={brand.slug} href={productsUrl(brand.slug)}>{brand.name}</a>)}
      </nav>

      <section className="hero">
        <div className="heroText">
          <span>ELEKTRİKLİ VE YENİ NESİL ARAÇLAR İÇİN</span>
          <h1>Oto Yedek Parçada Profesyonel Çözüm</h1>
          <p>Elektrikli ve yeni nesil araçlar için kaporta, mekanik, elektrik ve aksesuar ürünlerini tek katalogda inceleyin. Parça koduyla hızlı teklif alın.</p>
          <div className="heroActions">
            <a href="/products/" className="redBtn">KATALOĞU İNCELE ›</a>
            <a href={wpUrl} className="outlineBtn">WHATSAPP’TAN SOR</a>
          </div>
        </div>
        <div className="carVisual">
          <div className="carShape" />
        </div>
      </section>

      <section className="serviceStrip">
        {serviceItems.map(item => (
          <div key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="titleBlock">
          <h2>Markalara Göre Ürünler</h2>
          <span />
        </div>
        <div className="brandGrid">
          {brands.map(brand => (
            <a key={brand.slug} href={productsUrl(brand.slug)} className="brandCard">
              <div className="brandIcon">{brand.name.slice(0, 1)}</div>
              <strong>{brand.name}</strong>
            </a>
          ))}
        </div>
        <a href="/products/" className="centerBtn">TÜM MARKALARI GÖR ›</a>
      </section>

      <section className="section productsSection">
        <div className="titleBlock">
          <h2>Öne Çıkan Ürünler</h2>
          <span />
        </div>
        <div className="productGrid">
          {featuredProducts.map(product => (
            <article key={`${product.no || product.id}-${productCode(product)}`} className="productCard">
              <a href="/products/" className="productImg"><img src={cleanImagePath(product.image)} alt={product.title} /></a>
              <div className="productInfo">
                <h3>{product.title}</h3>
                <p>{productCode(product)}</p>
                <strong>{salePrice(product)}</strong>
                <a href={wpUrl}>SEPETE EKLE ›</a>
              </div>
            </article>
          ))}
        </div>
        <a href="/products/" className="centerBtn">TÜM ÜRÜNLERİ GÖR ›</a>
      </section>

      <section className="quickCards">
        <div><strong>Parça Koduyla Hızlı Teklif</strong><span>Parça kodunu gönderin, sizi arayalım.</span></div>
        <div><strong>Katalog İncele</strong><span>Tüm ürünleri marka ve modele göre görün.</span></div>
        <div><strong>WhatsApp Destek</strong><span>Anında destek için WhatsApp’tan yazın.</span></div>
        <div><strong>Kurumsal Çözümler</strong><span>Toptan ve bayilik için iletişime geçin.</span></div>
      </section>

      <a href={wpUrl} className="floatingWp">WhatsApp’tan Yazın</a>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; background: #f6f7f9; color: #151515; font-family: Arial, sans-serif; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }
        .topBar { background: #fff; border-bottom: 1px solid #e7e7e7; display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; padding: 12px 46px; color: #111; }
        .topBar div { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
        .topBar span { color: #6d6d6d; }
        .header { background: #fff; display: grid; grid-template-columns: 230px minmax(280px,1fr) 220px; align-items: center; gap: 28px; padding: 22px 46px; border-bottom: 1px solid #ececec; }
        .logoArea img { width: 170px; max-height: 95px; object-fit: contain; display: block; }
        .searchBox { border: 1px solid #d8d8d8; border-radius: 8px; height: 54px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; color: #777; background: #fff; }
        .searchBox b { font-size: 24px; color: #222; }
        .accountArea { display: flex; justify-content: flex-end; gap: 18px; font-weight: 800; }
        .accountArea span { color: #777; font-size: 13px; font-weight: 500; }
        .mainNav { height: 58px; background: #fff; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; gap: 24px; padding: 0 46px; font-weight: 800; overflow-x: auto; white-space: nowrap; }
        .categoryBtn { color: #d71920; }
        .hero { min-height: 430px; background: linear-gradient(110deg,#ffffff 0%,#f1f3f5 45%,#dfe4e9 100%); display: grid; grid-template-columns: minmax(320px,520px) 1fr; align-items: center; gap: 30px; padding: 58px 46px; border-bottom: 1px solid #e2e2e2; position: relative; overflow: hidden; }
        .heroText { max-width: 560px; position: relative; z-index: 2; }
        .heroText span { color: #d71920; font-size: 13px; font-weight: 900; letter-spacing: .3px; }
        .heroText h1 { font-size: clamp(38px,5vw,58px); line-height: 1.08; margin: 16px 0; letter-spacing: -1.8px; }
        .heroText p { color: #555; font-size: 18px; line-height: 1.65; margin: 0; }
        .heroActions { display: flex; gap: 18px; margin-top: 34px; flex-wrap: wrap; }
        .redBtn, .outlineBtn { min-height: 56px; display: inline-flex; align-items: center; justify-content: center; padding: 0 28px; border-radius: 8px; font-weight: 900; }
        .redBtn { background: #d71920; color: #fff; box-shadow: 0 12px 30px rgba(215,25,32,.22); }
        .outlineBtn { border: 1px solid #1b1b1b; color: #151515; background: #fff; }
        .carVisual { min-height: 300px; position: relative; }
        .carShape { position: absolute; inset: 30px 0 0 0; border-radius: 55% 20% 18% 40%; background: linear-gradient(135deg,#111,#3b424a 58%,#0c0c0c); box-shadow: -30px 40px 80px rgba(0,0,0,.18); transform: skewX(-10deg); opacity: .95; }
        .carShape::before { content: ''; position: absolute; left: 16%; top: -28px; width: 56%; height: 100px; border: 18px solid #222; border-bottom: 0; border-radius: 100% 100% 0 0; transform: skewX(12deg); background: rgba(255,255,255,.22); }
        .serviceStrip { background: #fff; border-bottom: 1px solid #e6e6e6; display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; padding: 22px 46px; }
        .serviceStrip div { border-right: 1px solid #eee; padding-right: 18px; display: flex; flex-direction: column; gap: 4px; }
        .serviceStrip span { color: #666; font-size: 14px; }
        .section { padding: 34px 46px; max-width: 1240px; margin: 0 auto; }
        .titleBlock { text-align: center; margin-bottom: 26px; }
        .titleBlock h2 { margin: 0; font-size: 30px; }
        .titleBlock span { display: block; width: 46px; height: 3px; background: #d71920; margin: 12px auto 0; }
        .brandGrid { display: grid; grid-template-columns: repeat(6,1fr); gap: 16px; }
        .brandCard { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 26px 14px; text-align: center; box-shadow: 0 16px 36px rgba(0,0,0,.04); }
        .brandIcon { width: 74px; height: 74px; border-radius: 18px; background: #f1f2f4; color: #d71920; display: grid; place-items: center; margin: 0 auto 14px; font-size: 34px; font-weight: 900; }
        .centerBtn { display: table; margin: 20px auto 0; border: 1px solid #d6d6d6; border-radius: 8px; padding: 14px 26px; font-weight: 900; background: #fff; }
        .productGrid { display: grid; grid-template-columns: repeat(6,1fr); gap: 14px; }
        .productCard { background: #fff; border: 1px solid #dedede; border-radius: 12px; overflow: hidden; box-shadow: 0 18px 42px rgba(0,0,0,.05); }
        .productImg { height: 160px; display: flex; align-items: center; justify-content: center; padding: 14px; background: #f8f8f8; }
        .productImg img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .productInfo { padding: 14px; }
        .productInfo h3 { min-height: 48px; font-size: 14px; line-height: 1.35; margin: 0 0 8px; }
        .productInfo p { color: #777; font-size: 12px; margin: 0 0 12px; }
        .productInfo strong { color: #d71920; display: block; margin-bottom: 12px; }
        .productInfo a { display: flex; justify-content: space-between; border: 1px solid #d6d6d6; border-radius: 6px; padding: 10px 12px; font-size: 12px; font-weight: 900; }
        .quickCards { max-width: 1240px; margin: 0 auto; padding: 22px 46px 70px; display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
        .quickCards div { background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 22px; display: flex; flex-direction: column; gap: 8px; }
        .quickCards strong { font-size: 18px; }
        .quickCards span { color: #666; line-height: 1.5; }
        .floatingWp { position: fixed; right: 28px; bottom: 24px; z-index: 30; background: #25D366; color: #fff; padding: 16px 24px; border-radius: 999px; font-weight: 900; box-shadow: 0 14px 34px rgba(37,211,102,.32); }
        @media (max-width: 980px) {
          .topBar { display: none; }
          .header { grid-template-columns: 1fr; padding: 16px; gap: 14px; }
          .logoArea img { width: 140px; margin: 0 auto; }
          .searchBox { height: 48px; }
          .accountArea { justify-content: center; }
          .mainNav { padding: 0 16px; gap: 14px; }
          .hero { grid-template-columns: 1fr; min-height: auto; padding: 42px 16px; }
          .heroText h1 { font-size: 38px; }
          .heroText p { font-size: 16px; }
          .heroActions a { width: 100%; }
          .carVisual { min-height: 160px; }
          .carShape { inset: 20px 0 0 0; opacity: .18; }
          .serviceStrip { grid-template-columns: 1fr 1fr; padding: 18px 16px; }
          .section { padding: 28px 16px; }
          .brandGrid { grid-template-columns: repeat(2,1fr); }
          .productGrid { grid-template-columns: repeat(2,1fr); }
          .quickCards { grid-template-columns: 1fr; padding: 18px 16px 80px; }
          .floatingWp { left: 16px; right: 16px; text-align: center; bottom: 16px; }
        }
      `}</style>
    </main>
  )
}
