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
        <a href="/" className="brandLink">
          <img src="/logo.svg" alt="Paşa Oto Parça" className="brandLogo" />
          <div>
            <strong className="brandTitle">Paşa Oto Parça</strong>
            <span className="brandSub">Oto Yedek Parça & EV Parts</span>
          </div>
        </a>

        <nav className="nav">
          <a href="/products/">Ürünler</a>
          {brands.slice(0, 5).map(brand => <a key={brand.slug} href={productsUrl(brand.slug)}>{brand.name}</a>)}
          <a href={wpUrl} className="whatsappSmall">WhatsApp</a>
        </nav>
      </header>

      <section className="hero">
        <div className="heroGrid">
          <div>
            <div className="badge">Tesla • BYD • Togg • MG • Chery • Skywell</div>
            <h1>Oto Yedek Parçada Profesyonel Çözüm</h1>
            <p className="heroText">Elektrikli ve yeni nesil araçlar için kaporta, mekanik, elektrik ve aksesuar ürünlerini tek katalogda inceleyin. Parça koduyla hızlı teklif alın.</p>
            <div className="heroButtons">
              <a href="/products/" className="primaryBtn">Kataloğu İncele</a>
              <a href={wpUrl} className="whatsappBtn">WhatsApp’tan Sor</a>
            </div>
          </div>

          <div className="showcase">
            <div className="logoBox">
              <img src="/logo.svg" alt="Paşa Oto Parça" />
            </div>
            <div className="serviceGrid">
              {['Kaporta', 'Mekanik', 'Elektrik'].map(item => <div key={item}>{item}</div>)}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .page { font-family: Arial, sans-serif; background: #070707; color: #fff; min-height: 100vh; overflow-x: hidden; }
        .header { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 18px 40px; border-bottom: 1px solid #202020; }
        .nav { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
        @media (max-width:760px){
          .header { padding:14px 16px; flex-direction:column; align-items:flex-start; }
          .nav { width:100%; overflow-x:auto; flex-wrap:nowrap; }
        }
      `}</style>
    </main>
  )
}
