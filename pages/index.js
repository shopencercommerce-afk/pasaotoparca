import brands from '../data/brands'

const wpUrl = 'https://wa.me/905077302703?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.'

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
}

function productsUrl(brand, model) {
  const query = model ? `?brand=${brand}&model=${slugify(model)}` : `?brand=${brand}`
  return `/products/${query}`
}

const features = [
  { title: 'Hızlı Parça Bulma', text: 'Marka ve modele göre ürünleri hızlıca filtreleyin.' },
  { title: 'WhatsApp Sipariş', text: 'Ürün kodu ile direkt sipariş ve uyumluluk teyidi alın.' },
  { title: 'Elektrikli Araç Odaklı', text: 'Tesla, BYD, Togg, MG ve Chery parçalarına odaklı katalog.' }
]

export default function Home() {
  return (
    <main className="page">
      <header className="header">
        <a href="/" className="brand">
          <img src="/logo.svg" alt="Paşa Oto Parça" />
          <div>
            <strong>Paşa Oto Parça</strong>
            <span>Oto Yedek Parça & EV Parts</span>
          </div>
        </a>

        <nav className="nav">
          <a href="/products/">Ürünler</a>
          {brands.slice(0, 5).map(brand => <a key={brand.slug} href={productsUrl(brand.slug)}>{brand.name}</a>)}
          <a href={wpUrl} className="navCta">WhatsApp</a>
        </nav>
      </header>

      <section className="hero">
        <div className="heroInner">
          <div className="heroCopy">
            <div className="badge">Tesla • BYD • Togg • MG • Chery • Skywell</div>
            <h1>Oto Yedek Parçada Profesyonel Çözüm</h1>
            <p>Elektrikli ve yeni nesil araçlar için kaporta, mekanik, elektrik ve aksesuar ürünlerini tek katalogda inceleyin. Parça koduyla hızlı teklif alın.</p>
            <div className="actions">
              <a href="/products/" className="primary">Kataloğu İncele</a>
              <a href={wpUrl} className="whatsapp">WhatsApp’tan Sor</a>
            </div>
          </div>

          <div className="heroCard">
            <div className="logoPanel">
              <img src="/logo.svg" alt="Paşa Oto Parça" />
            </div>
            <div className="miniGrid">
              <span>Kaporta</span>
              <span>Mekanik</span>
              <span>Elektrik</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="featureGrid">
          {features.map(feature => (
            <div key={feature.title} className="feature">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section brandsSection">
        <div className="sectionHead">
          <div>
            <span>MARKA KATALOĞU</span>
            <h2>Araç Markasına Göre İncele</h2>
          </div>
          <a href="/products/" className="outline">Tüm Ürünler</a>
        </div>

        <div className="brandGrid">
          {brands.map(brand => (
            <div key={brand.slug} className="brandCard">
              <a href={productsUrl(brand.slug)}><h3>{brand.name}</h3></a>
              <p>{brand.models.length} model için ürün kataloğu</p>
              <div className="modelList">
                {brand.models.map(model => <a key={model} href={productsUrl(brand.slug, model)}>{model}</a>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; }
        .page { min-height: 100vh; background: #070707; color: #fff; font-family: Arial, sans-serif; overflow-x: hidden; }
        .header { display: flex; align-items: center; justify-content: space-between; gap: 22px; padding: 16px 40px; border-bottom: 1px solid #202020; background: rgba(7,7,7,.96); position: sticky; top: 0; z-index: 20; backdrop-filter: blur(10px); }
        .brand { display: flex; align-items: center; gap: 14px; color: #fff; text-decoration: none; min-width: 230px; }
        .brand img { width: 58px; height: 58px; object-fit: contain; background: #fff; border-radius: 14px; padding: 5px; flex: 0 0 auto; }
        .brand strong { display: block; font-size: 22px; letter-spacing: -.2px; }
        .brand span { display: block; color: #999; font-size: 13px; margin-top: 2px; }
        .nav { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
        .nav a { color: #d7d7d7; text-decoration: none; font-weight: 700; font-size: 14px; padding: 10px 12px; border-radius: 999px; border: 1px solid transparent; }
        .nav a:hover { border-color: #333; background: #111; }
        .nav .navCta { background: #25D366; color: #071b0d; padding: 11px 16px; }
        .hero { padding: 86px 40px 62px; background: radial-gradient(circle at top right, rgba(255,255,255,.08), transparent 34%), linear-gradient(135deg,#090909,#151515 55%,#050505); }
        .heroInner { max-width: 1250px; margin: 0 auto; display: grid; grid-template-columns: minmax(0,1.2fr) minmax(320px,.8fr); gap: 46px; align-items: center; }
        .badge { display: inline-flex; max-width: 100%; border: 1px solid #2c2c2c; background: #111; color: #d0d0d0; padding: 10px 16px; border-radius: 999px; margin-bottom: 24px; font-size: 14px; }
        .hero h1 { font-size: clamp(42px, 5vw, 64px); line-height: 1.04; margin: 0 0 22px; letter-spacing: -1.8px; }
        .hero p { color: #b5b5b5; font-size: 20px; line-height: 1.65; max-width: 720px; margin: 0; }
        .actions { display: flex; gap: 14px; margin-top: 32px; flex-wrap: wrap; }
        .actions a { display: inline-flex; align-items: center; justify-content: center; min-height: 54px; padding: 15px 26px; border-radius: 14px; font-weight: 800; text-decoration: none; }
        .primary { background: #fff; color: #000; }
        .whatsapp { background: #25D366; color: #071b0d; }
        .heroCard { background: linear-gradient(180deg,#181818,#0d0d0d); border: 1px solid #2a2a2a; border-radius: 30px; padding: 24px; box-shadow: 0 30px 90px rgba(0,0,0,.45); min-width: 0; }
        .logoPanel { background: #fff; border-radius: 22px; padding: 18px; margin-bottom: 18px; }
        .logoPanel img { width: 100%; max-height: 260px; object-fit: contain; display: block; }
        .miniGrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .miniGrid span { background: #111; border: 1px solid #2a2a2a; border-radius: 16px; padding: 16px 10px; text-align: center; color: #ddd; font-weight: 800; }
        .section { max-width: 1250px; margin: 0 auto; padding: 42px 40px; }
        .featureGrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .feature, .brandCard { background: #121212; border: 1px solid #242424; border-radius: 22px; padding: 24px; }
        .feature h3 { margin: 0 0 10px; font-size: 22px; }
        .feature p, .brandCard p { margin: 0; color: #999; line-height: 1.6; }
        .sectionHead { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
        .sectionHead span { color: #888; font-size: 13px; font-weight: 800; letter-spacing: .8px; }
        .sectionHead h2 { font-size: clamp(30px, 4vw, 42px); margin: 8px 0 0; }
        .outline { color: #fff; text-decoration: none; border: 1px solid #333; padding: 12px 18px; border-radius: 999px; white-space: nowrap; }
        .brandGrid { display: grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap: 20px; }
        .brandCard a { color: #fff; text-decoration: none; }
        .brandCard h3 { font-size: 30px; margin: 0 0 8px; }
        .modelList { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
        .modelList a { background: #202020; border: 1px solid #303030; padding: 10px 14px; border-radius: 999px; font-size: 14px; }
        @media (max-width: 820px) {
          .header { position: relative; padding: 14px 16px; flex-direction: column; align-items: stretch; gap: 12px; }
          .brand { min-width: 0; gap: 11px; }
          .brand img { width: 48px; height: 48px; border-radius: 11px; }
          .brand strong { font-size: 19px; }
          .brand span { font-size: 12px; }
          .nav { justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; gap: 8px; padding-bottom: 4px; scrollbar-width: none; }
          .nav::-webkit-scrollbar { display: none; }
          .nav a { white-space: nowrap; background: #121212; border-color: #242424; font-size: 13px; padding: 9px 12px; }
          .hero { padding: 34px 16px 30px; }
          .heroInner { grid-template-columns: 1fr; gap: 22px; }
          .badge { font-size: 12px; overflow: hidden; white-space: nowrap; }
          .hero h1 { font-size: 36px; letter-spacing: -1px; }
          .hero p { font-size: 16px; line-height: 1.6; }
          .actions { gap: 10px; }
          .actions a { width: 100%; min-height: 50px; }
          .heroCard { border-radius: 22px; padding: 16px; }
          .logoPanel { border-radius: 16px; padding: 14px; }
          .logoPanel img { max-height: 190px; }
          .miniGrid { grid-template-columns: 1fr; gap: 8px; }
          .miniGrid span { padding: 13px 10px; }
          .section { padding: 24px 16px; }
          .featureGrid { grid-template-columns: 1fr; }
          .sectionHead { align-items: flex-start; flex-direction: column; }
          .outline { width: 100%; text-align: center; }
          .brandGrid { grid-template-columns: 1fr; }
          .brandCard { padding: 20px; }
        }
      `}</style>
    </main>
  )
}
