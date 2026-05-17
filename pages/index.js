import brands from '../data/brands'

const wpUrl = 'https://wa.me/905077302703?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.'

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
}

export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial', background: '#0b0b0b', color: '#fff', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderBottom: '1px solid #222' }}>
        <a href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '26px', fontWeight: 'bold' }}>Paşa Oto Parça</a>
        <nav style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
          {brands.map(brand => <a key={brand.slug} href={`/products?brand=${brand.slug}`} style={{ color: '#ddd', textDecoration: 'none' }}>{brand.name}</a>)}
        </nav>
      </header>

      <section style={{ padding: '100px 40px', textAlign: 'center', background: 'linear-gradient(to bottom,#111,#000)' }}>
        <h1 style={{ fontSize: '64px', marginBottom: '20px' }}>Elektrikli Araç<br />Yedek Parça Platformu</h1>
        <p style={{ maxWidth: '900px', margin: '0 auto', color: '#aaa', fontSize: '20px', lineHeight: 1.6 }}>Tesla, BYD, Togg, MG, Chery ve Skywell araçları için profesyonel OEM ve yan sanayi yedek parça altyapısı.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', flexWrap: 'wrap' }}>
          <a href="/products" style={{ background: '#fff', color: '#000', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' }}>Ürünleri İncele</a>
          <a href={wpUrl} style={{ background: '#25D366', color: '#071b0d', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', textDecoration: 'none' }}>WhatsApp Sipariş</a>
        </div>
      </section>

      <section style={{ padding: '60px 40px' }}>
        <h2 style={{ fontSize: '38px', marginBottom: '30px' }}>Markalar</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          {brands.map(brand => (
            <div key={brand.slug} style={{ background: '#151515', border: '1px solid #222', borderRadius: '20px', padding: '28px' }}>
              <a href={`/products?brand=${brand.slug}`} style={{ color: '#fff', textDecoration: 'none' }}><h3 style={{ fontSize: '30px', marginBottom: '20px' }}>{brand.name}</h3></a>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {brand.models.map(model => <a key={model} href={`/products?brand=${brand.slug}&model=${slugify(model)}`} style={{ background: '#202020', padding: '10px 14px', borderRadius: '999px', fontSize: '14px', color: '#fff', textDecoration: 'none' }}>{model}</a>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
