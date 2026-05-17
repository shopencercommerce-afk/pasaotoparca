import brands from '../data/brands'

const wpUrl = 'https://wa.me/905077302703?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.'

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
}

export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial', background: '#0b0b0b', color: '#fff', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 40px', borderBottom: '1px solid #222', position: 'sticky', top: 0, backdropFilter: 'blur(12px)', background: 'rgba(10,10,10,0.9)', zIndex: 50 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#fff', textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Paşa Oto Parça" style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '12px', background: '#fff', padding: '6px' }} />
          <div>
            <strong style={{ display: 'block', fontSize: '24px' }}>Paşa Oto Parça</strong>
            <span style={{ color: '#888', fontSize: '13px' }}>Elektrikli Araç Yedek Parça</span>
          </div>
        </a>

        <nav style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
          {brands.map(brand => <a key={brand.slug} href={`/products?brand=${brand.slug}`} style={{ color: '#ddd', textDecoration: 'none', fontWeight: 600 }}>{brand.name}</a>)}
          <a href={wpUrl} style={{ background: '#25D366', color: '#071b0d', padding: '12px 18px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' }}>WhatsApp</a>
        </nav>
      </header>

      <section style={{ padding: '90px 40px 70px', background: 'radial-gradient(circle at top,#1d1d1d,#050505)' }}>
        <div style={{ maxWidth: '1250px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '50px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', background: '#161616', border: '1px solid #2a2a2a', padding: '10px 18px', borderRadius: '999px', marginBottom: '24px', color: '#bbb' }}>Tesla • BYD • Togg • MG • Chery</div>
            <h1 style={{ fontSize: '68px', lineHeight: 1.05, marginBottom: '24px' }}>Elektrikli Araçlar İçin Premium Yedek Parça</h1>
            <p style={{ color: '#aaa', fontSize: '20px', lineHeight: 1.7, maxWidth: '720px' }}>Tesla, BYD, Togg ve diğer elektrikli araç markaları için OEM ve yan sanayi yedek parçaları hızlı şekilde bulun, filtreleyin ve WhatsApp üzerinden sipariş verin.</p>
            <div style={{ display: 'flex', gap: '18px', marginTop: '34px', flexWrap: 'wrap' }}>
              <a href="/products" style={{ background: '#fff', color: '#000', padding: '18px 34px', borderRadius: '14px', fontWeight: 'bold', textDecoration: 'none' }}>Ürünleri İncele</a>
              <a href={wpUrl} style={{ background: '#25D366', color: '#071b0d', padding: '18px 34px', borderRadius: '14px', fontWeight: 'bold', textDecoration: 'none' }}>WhatsApp Sipariş</a>
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '28px', padding: '28px', boxShadow: '0 0 60px rgba(255,255,255,0.05)' }}>
            <img src="/logo.svg" alt="Paşa Oto Parça" style={{ width: '100%', borderRadius: '18px', background: '#fff', padding: '20px' }} />
          </div>
        </div>
      </section>

      <section style={{ padding: '70px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '22px', marginBottom: '70px' }}>
          <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '20px', padding: '26px' }}>
            <h3 style={{ fontSize: '22px' }}>Hızlı Sipariş</h3>
            <p style={{ color: '#999', lineHeight: 1.6 }}>WhatsApp üzerinden direkt sipariş ve destek.</p>
          </div>
          <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '20px', padding: '26px' }}>
            <h3 style={{ fontSize: '22px' }}>OEM Kalitesi</h3>
            <p style={{ color: '#999', lineHeight: 1.6 }}>Elektrikli araçlara özel kaliteli parça altyapısı.</p>
          </div>
          <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '20px', padding: '26px' }}>
            <h3 style={{ fontSize: '22px' }}>Marka Filtreleme</h3>
            <p style={{ color: '#999', lineHeight: 1.6 }}>Araç marka ve modeline göre ürün listeleme.</p>
          </div>
        </div>

        <h2 style={{ fontSize: '42px', marginBottom: '30px' }}>Markalar</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '26px' }}>
          {brands.map(brand => (
            <div key={brand.slug} style={{ background: '#151515', border: '1px solid #222', borderRadius: '24px', padding: '30px', transition: '0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <img src="/logo.svg" alt={brand.name} style={{ width: '54px', height: '54px', borderRadius: '12px', background: '#fff', padding: '4px' }} />
                <div>
                  <a href={`/products?brand=${brand.slug}`} style={{ color: '#fff', textDecoration: 'none' }}><h3 style={{ fontSize: '30px', margin: 0 }}>{brand.name}</h3></a>
                  <span style={{ color: '#888', fontSize: '14px' }}>{brand.models.length} model</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {brand.models.map(model => <a key={model} href={`/products?brand=${brand.slug}&model=${slugify(model)}`} style={{ background: '#202020', padding: '11px 15px', borderRadius: '999px', fontSize: '14px', color: '#fff', textDecoration: 'none' }}>{model}</a>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
