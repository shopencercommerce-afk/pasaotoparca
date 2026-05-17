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
    <main style={{ fontFamily: 'Arial, sans-serif', background: '#070707', color: '#fff', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', borderBottom: '1px solid #202020', background: 'rgba(7,7,7,0.94)', position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#fff', textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Paşa Oto Parça" style={{ width: '62px', height: '62px', objectFit: 'contain', borderRadius: '14px', background: '#fff', padding: '5px' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '23px', letterSpacing: '.2px' }}>Paşa Oto Parça</strong>
            <span style={{ color: '#9b9b9b', fontSize: '13px' }}>Oto Yedek Parça & EV Parts</span>
          </div>
        </a>

        <nav style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/products/" style={{ color: '#ddd', textDecoration: 'none', fontWeight: 700 }}>Ürünler</a>
          {brands.slice(0, 5).map(brand => <a key={brand.slug} href={productsUrl(brand.slug)} style={{ color: '#aaa', textDecoration: 'none', fontWeight: 600 }}>{brand.name}</a>)}
          <a href={wpUrl} style={{ background: '#25D366', color: '#071b0d', padding: '12px 18px', borderRadius: '999px', fontWeight: 'bold', textDecoration: 'none' }}>WhatsApp</a>
        </nav>
      </header>

      <section style={{ padding: '90px 40px 60px', background: 'linear-gradient(135deg,#090909 0%,#151515 50%,#050505 100%)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(330px,1fr))', gap: '46px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', border: '1px solid #2c2c2c', background: '#111', color: '#d0d0d0', padding: '10px 16px', borderRadius: '999px', marginBottom: '24px', fontSize: '14px' }}>
              Tesla • BYD • Togg • MG • Chery • Skywell
            </div>
            <h1 style={{ fontSize: '64px', lineHeight: 1.04, margin: '0 0 22px', letterSpacing: '-1.8px' }}>
              Oto Yedek Parçada Profesyonel Çözüm
            </h1>
            <p style={{ color: '#b5b5b5', fontSize: '20px', lineHeight: 1.7, maxWidth: '720px', margin: 0 }}>
              Elektrikli ve yeni nesil araçlar için kaporta, mekanik, elektrik ve aksesuar ürünlerini tek katalogda inceleyin. Parça koduyla hızlı teklif alın.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '34px', flexWrap: 'wrap' }}>
              <a href="/products/" style={{ background: '#fff', color: '#000', padding: '17px 30px', borderRadius: '14px', fontWeight: 'bold', textDecoration: 'none' }}>Kataloğu İncele</a>
              <a href={wpUrl} style={{ background: '#25D366', color: '#071b0d', padding: '17px 30px', borderRadius: '14px', fontWeight: 'bold', textDecoration: 'none' }}>WhatsApp’tan Sor</a>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(180deg,#181818,#0d0d0d)', border: '1px solid #2a2a2a', borderRadius: '30px', padding: '28px', boxShadow: '0 30px 90px rgba(0,0,0,0.45)' }}>
            <div style={{ background: '#fff', borderRadius: '22px', padding: '22px', marginBottom: '20px' }}>
              <img src="/logo.svg" alt="Paşa Oto Parça" style={{ width: '100%', display: 'block' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              {['Kaporta', 'Mekanik', 'Elektrik'].map(item => (
                <div key={item} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '18px', textAlign: 'center', color: '#ddd', fontWeight: 700 }}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px', maxWidth: '1250px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '18px' }}>
          {features.map(feature => (
            <div key={feature.title} style={{ background: '#121212', border: '1px solid #242424', borderRadius: '22px', padding: '26px' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '22px' }}>{feature.title}</h3>
              <p style={{ margin: 0, color: '#999', lineHeight: 1.6 }}>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '35px 40px 80px', maxWidth: '1250px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: '#888', fontSize: '14px', fontWeight: 700 }}>MARKA KATALOĞU</span>
            <h2 style={{ fontSize: '42px', margin: '8px 0 0' }}>Araç Markasına Göre İncele</h2>
          </div>
          <a href="/products/" style={{ color: '#fff', textDecoration: 'none', border: '1px solid #333', padding: '12px 18px', borderRadius: '999px' }}>Tüm Ürünler</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '22px' }}>
          {brands.map(brand => (
            <div key={brand.slug} style={{ background: '#141414', border: '1px solid #252525', borderRadius: '24px', padding: '26px' }}>
              <a href={productsUrl(brand.slug)} style={{ color: '#fff', textDecoration: 'none' }}>
                <h3 style={{ fontSize: '30px', margin: '0 0 8px' }}>{brand.name}</h3>
              </a>
              <p style={{ color: '#888', margin: '0 0 20px' }}>{brand.models.length} model için ürün kataloğu</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {brand.models.map(model => <a key={model} href={productsUrl(brand.slug, model)} style={{ background: '#202020', border: '1px solid #303030', padding: '10px 14px', borderRadius: '999px', fontSize: '14px', color: '#fff', textDecoration: 'none' }}>{model}</a>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
