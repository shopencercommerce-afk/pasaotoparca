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

const featuredProducts = products.filter(p => p.image && p.title).slice(0, 6)

const stats = [
  ['238+', 'Aktif ürün'],
  ['6', 'Araç markası'],
  ['24/7', 'WhatsApp destek']
]

const services = [
  ['Premium Katalog', 'Marka ve modele göre hızlı parça keşfi.'],
  ['Parça Kodu ile Teklif', 'Ürün kodunu gönderin, doğru parçayı teyit edelim.'],
  ['Yeni Nesil Araç Odaklı', 'Tesla, BYD, Togg, MG, Chery ve Skywell parçaları.']
]

export default function Home() {
  return (
    <main className="page">
      <header className="header">
        <a href="/" className="logo"><img src="/logo.svg" alt="Paşa Oto Parça" /></a>
        <nav>
          <a href="/products/">Katalog</a>
          {brands.slice(0, 5).map(b => <a key={b.slug} href={productsUrl(b.slug)}>{b.name}</a>)}
        </nav>
        <a href={wpUrl} className="headerCta">WhatsApp Teklif</a>
      </header>

      <section className="hero">
        <div className="heroCopy">
          <span className="eyebrow">PAŞA OTO PARÇA SHOWROOM</span>
          <h1>Yeni nesil araçlar için premium yedek parça kataloğu.</h1>
          <p>Elektrikli ve modern araçlara özel kaporta, mekanik, elektrik ve aksesuar parçalarını tek bir sade katalogda inceleyin. Parça koduyla hızlı teklif alın.</p>
          <div className="heroActions">
            <a href="/products/" className="darkBtn">Kataloğu İncele</a>
            <a href={wpUrl} className="lightBtn">WhatsApp’tan Sor</a>
          </div>
          <div className="stats">
            {stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
          </div>
        </div>
        <div className="heroVisual">
          <div className="carLine" />
          <div className="heroLogo"><img src="/logo.svg" alt="Paşa Oto Parça" /></div>
        </div>
      </section>

      <section className="services">
        {services.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
      </section>

      <section className="section">
        <div className="sectionHead">
          <span>MARKALAR</span>
          <h2>Aracınıza göre hızlı seçim</h2>
        </div>
        <div className="brandGrid">
          {brands.map(brand => (
            <a className="brandCard" href={productsUrl(brand.slug)} key={brand.slug}>
              <span>{brand.name.charAt(0)}</span>
              <strong>{brand.name}</strong>
              <small>{brand.models.length} model</small>
            </a>
          ))}
        </div>
      </section>

      <section className="section productSection">
        <div className="sectionHead center">
          <span>ÖNE ÇIKANLAR</span>
          <h2>Popüler parçalar</h2>
        </div>
        <div className="productGrid">
          {featuredProducts.map(product => (
            <article className="productCard" key={`${product.no || product.id}-${productCode(product)}`}>
              <a href="/products/" className="productImage"><img src={cleanImagePath(product.image)} alt={product.title} /></a>
              <div>
                <h3>{product.title}</h3>
                <p>{productCode(product)}</p>
                <strong>{salePrice(product)}</strong>
                <a href={wpUrl}>Teklif Al</a>
              </div>
            </article>
          ))}
        </div>
        <a href="/products/" className="allProducts">Tüm Ürünleri Gör</a>
      </section>

      <section className="bottomCta">
        <div>
          <span>PARÇA KODUNUZ HAZIR MI?</span>
          <h2>Doğru parçayı birlikte teyit edelim.</h2>
        </div>
        <a href={wpUrl}>WhatsApp’tan Yaz</a>
      </section>

      <a href={wpUrl} className="floatWp">WhatsApp</a>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; background: #f4f2ee; color: #111; font-family: Arial, sans-serif; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }
        .header { position: sticky; top: 0; z-index: 40; display: grid; grid-template-columns: 180px 1fr auto; align-items: center; gap: 28px; padding: 18px 54px; background: rgba(250,249,246,.88); border-bottom: 1px solid rgba(0,0,0,.08); backdrop-filter: blur(20px); }
        .logo img { width: 150px; height: 70px; object-fit: contain; display: block; }
        nav { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
        nav a { padding: 10px 14px; border-radius: 999px; font-size: 14px; font-weight: 700; color: #333; }
        nav a:hover { background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,.06); }
        .headerCta { background: #111; color: #fff; border-radius: 999px; padding: 13px 18px; font-weight: 800; white-space: nowrap; }
        .hero { min-height: 680px; display: grid; grid-template-columns: minmax(0, .95fr) minmax(420px, 1.05fr); align-items: center; gap: 54px; padding: 72px 54px 64px; max-width: 1440px; margin: 0 auto; }
        .heroCopy { max-width: 650px; }
        .eyebrow, .sectionHead span, .bottomCta span { display: inline-block; color: #b3141b; font-size: 12px; font-weight: 900; letter-spacing: 1.6px; margin-bottom: 16px; }
        h1 { margin: 0; font-size: clamp(48px, 6vw, 82px); line-height: .96; letter-spacing: -4px; font-weight: 900; }
        .heroCopy p { color: #5d5d5d; font-size: 19px; line-height: 1.75; margin: 26px 0 0; max-width: 580px; }
        .heroActions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 36px; }
        .darkBtn, .lightBtn { min-height: 56px; display: inline-flex; align-items: center; justify-content: center; padding: 0 28px; border-radius: 999px; font-weight: 900; }
        .darkBtn { background: #111; color: #fff; box-shadow: 0 22px 50px rgba(0,0,0,.18); }
        .lightBtn { background: #fff; border: 1px solid rgba(0,0,0,.1); }
        .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-top: 44px; max-width: 520px; }
        .stats div { background: rgba(255,255,255,.72); border: 1px solid rgba(0,0,0,.08); border-radius: 22px; padding: 18px; box-shadow: 0 22px 54px rgba(0,0,0,.05); }
        .stats strong { display: block; font-size: 28px; }
        .stats span { color: #6b6b6b; font-size: 13px; }
        .heroVisual { position: relative; min-height: 520px; border-radius: 44px; background: linear-gradient(135deg,#fff,#e8e8e8); box-shadow: inset 0 0 0 1px rgba(0,0,0,.06), 0 42px 90px rgba(0,0,0,.13); overflow: hidden; }
        .carLine { position: absolute; left: 9%; right: 7%; top: 22%; height: 270px; border-radius: 58% 40% 30% 48%; background: linear-gradient(135deg,#111,#3b3d40 58%,#0b0b0b); transform: skewX(-10deg); box-shadow: 0 30px 70px rgba(0,0,0,.24); }
        .carLine::before { content: ''; position: absolute; left: 15%; top: -56px; width: 58%; height: 132px; border: 18px solid #151515; border-bottom: 0; border-radius: 100% 100% 0 0; transform: skewX(10deg); background: rgba(255,255,255,.17); }
        .heroLogo { position: absolute; left: 50%; bottom: 32px; transform: translateX(-50%); width: 72%; background: #fff; border-radius: 30px; padding: 22px; box-shadow: 0 26px 60px rgba(0,0,0,.10); }
        .heroLogo img { width: 100%; max-height: 170px; object-fit: contain; display: block; }
        .services { max-width: 1330px; margin: -22px auto 0; position: relative; z-index: 2; display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; padding: 0 54px; }
        .services div { background: rgba(255,255,255,.84); border: 1px solid rgba(0,0,0,.07); border-radius: 26px; padding: 24px; box-shadow: 0 28px 70px rgba(0,0,0,.07); backdrop-filter: blur(18px); }
        .services strong { display: block; font-size: 18px; margin-bottom: 8px; }
        .services span { color: #666; line-height: 1.55; }
        .section { max-width: 1330px; margin: 0 auto; padding: 76px 54px 0; }
        .sectionHead { margin-bottom: 28px; }
        .sectionHead.center { text-align: center; }
        .sectionHead h2 { margin: 0; font-size: clamp(34px, 4vw, 52px); line-height: 1; letter-spacing: -1.8px; }
        .brandGrid { display: grid; grid-template-columns: repeat(6,1fr); gap: 16px; }
        .brandCard { background: #fff; border-radius: 28px; padding: 28px 18px; text-align: center; border: 1px solid rgba(0,0,0,.07); box-shadow: 0 24px 70px rgba(0,0,0,.055); transition: transform .2s ease, box-shadow .2s ease; }
        .brandCard:hover { transform: translateY(-4px); box-shadow: 0 32px 80px rgba(0,0,0,.09); }
        .brandCard span { width: 78px; height: 78px; border-radius: 24px; display: grid; place-items: center; margin: 0 auto 16px; color: #fff; background: linear-gradient(135deg,#111,#444); font-size: 38px; font-weight: 900; }
        .brandCard strong { display: block; font-size: 18px; }
        .brandCard small { color: #777; display: block; margin-top: 6px; }
        .productGrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
        .productCard { display: grid; grid-template-columns: 190px 1fr; gap: 20px; align-items: center; background: #fff; border-radius: 30px; border: 1px solid rgba(0,0,0,.07); padding: 18px; box-shadow: 0 26px 78px rgba(0,0,0,.065); }
        .productImage { height: 170px; display: grid; place-items: center; background: #f5f5f5; border-radius: 24px; padding: 16px; }
        .productImage img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .productCard h3 { font-size: 17px; line-height: 1.35; margin: 0 0 10px; }
        .productCard p { color: #777; font-size: 13px; margin: 0 0 12px; }
        .productCard strong { color: #b3141b; display: block; font-size: 20px; margin-bottom: 14px; }
        .productCard div a { display: inline-flex; border-radius: 999px; background: #111; color: #fff; padding: 11px 16px; font-weight: 800; font-size: 13px; }
        .allProducts { display: table; margin: 28px auto 0; background: #fff; border: 1px solid rgba(0,0,0,.1); padding: 15px 26px; border-radius: 999px; font-weight: 900; }
        .bottomCta { max-width: 1220px; margin: 80px auto 90px; padding: 42px; border-radius: 34px; background: #111; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 24px; box-shadow: 0 40px 90px rgba(0,0,0,.18); }
        .bottomCta h2 { margin: 0; font-size: clamp(30px, 4vw, 48px); letter-spacing: -1.5px; }
        .bottomCta a { background: #25D366; color: #071b0d; border-radius: 999px; padding: 16px 24px; font-weight: 900; white-space: nowrap; }
        .floatWp { position: fixed; right: 26px; bottom: 22px; z-index: 60; background: #25D366; color: #fff; border-radius: 999px; padding: 15px 22px; font-weight: 900; box-shadow: 0 18px 40px rgba(37,211,102,.35); }
        @media (max-width: 980px) {
          .header { grid-template-columns: 1fr; padding: 14px 16px; gap: 12px; }
          .logo img { width: 128px; height: 60px; margin: 0 auto; }
          nav { display: flex; overflow-x: auto; gap: 8px; padding-bottom: 4px; scrollbar-width: none; }
          nav::-webkit-scrollbar { display: none; }
          nav a { background: #fff; white-space: nowrap; box-shadow: 0 10px 26px rgba(0,0,0,.05); }
          .headerCta { text-align: center; }
          .hero { grid-template-columns: 1fr; min-height: auto; padding: 42px 16px 38px; gap: 26px; }
          h1 { font-size: 42px; letter-spacing: -2px; }
          .heroCopy p { font-size: 16px; line-height: 1.65; }
          .darkBtn, .lightBtn { width: 100%; }
          .stats { grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
          .stats div { padding: 14px 10px; border-radius: 18px; }
          .stats strong { font-size: 22px; }
          .heroVisual { min-height: 340px; border-radius: 30px; }
          .carLine { top: 18%; height: 190px; opacity: .95; }
          .heroLogo { width: 84%; bottom: 20px; border-radius: 22px; padding: 14px; }
          .heroLogo img { max-height: 115px; }
          .services { grid-template-columns: 1fr; padding: 0 16px; margin-top: 16px; }
          .section { padding: 52px 16px 0; }
          .brandGrid { grid-template-columns: repeat(2,1fr); gap: 12px; }
          .brandCard { border-radius: 22px; padding: 20px 12px; }
          .brandCard span { width: 58px; height: 58px; border-radius: 18px; font-size: 28px; }
          .productGrid { grid-template-columns: 1fr; gap: 14px; }
          .productCard { grid-template-columns: 120px 1fr; border-radius: 24px; padding: 12px; gap: 14px; }
          .productImage { height: 130px; border-radius: 18px; }
          .productCard h3 { font-size: 15px; }
          .bottomCta { margin: 52px 16px 90px; padding: 28px; border-radius: 28px; flex-direction: column; align-items: flex-start; }
          .bottomCta a { width: 100%; text-align: center; }
          .floatWp { left: 16px; right: 16px; text-align: center; bottom: 16px; }
        }
      `}</style>
    </main>
  )
}
