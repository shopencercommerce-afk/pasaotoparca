import products from '../data/products.json'

function cleanImagePath(image) {
  if (!image) return ''
  return '/' + image.replace(/\\/g, '/').replace(/^images\//, 'images/')
}

export default function ProductsPage() {
  const categories = ['Tümü', ...Array.from(new Set(products.map(p => p.category || 'Diğer')))]

  return (
    <main style={{ fontFamily: 'Arial', background: '#0b0b0b', color: '#fff', minHeight: '100vh' }}>
      <header style={{ padding: '24px 40px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>Paşa Oto Parça</a>
        <a href="/cart" style={{ color: '#fff', textDecoration: 'none', background: '#1f1f1f', padding: '12px 18px', borderRadius: '10px' }}>Sepet</a>
      </header>

      <section style={{ padding: '50px 40px 20px' }}>
        <h1 style={{ fontSize: '44px', margin: 0 }}>Tesla Model Y Ürünleri</h1>
        <p style={{ color: '#aaa', fontSize: '18px' }}>Himpeks ürün datasından otomatik oluşturuldu. Toplam {products.length} ürün.</p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px' }}>
          {categories.map(category => (
            <span key={category} style={{ background: '#171717', border: '1px solid #2a2a2a', padding: '10px 14px', borderRadius: '999px', color: '#ddd' }}>
              {category}
            </span>
          ))}
        </div>
      </section>

      <section style={{ padding: '30px 40px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '22px' }}>
        {products.map(product => {
          const image = cleanImagePath(product.image)
          const message = encodeURIComponent(`Merhaba, bu ürünü sipariş vermek istiyorum:%0A%0AÜrün: ${product.title}%0AKod: ${product.refNo || product.internalCode}%0AFiyat: ${product.price3 || product.price1}%0AKategori: ${product.category}`)
          const whatsappUrl = `https://wa.me/?text=${message}`

          return (
            <article key={`${product.no}-${product.refNo}`} style={{ background: '#151515', border: '1px solid #242424', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '210px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px' }}>
                {image ? (
                  <img src={image} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: '#777' }}>Görsel yok</span>
                )}
              </div>

              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <span style={{ color: '#999', fontSize: '13px' }}>{product.category || 'Diğer'} • Tesla</span>
                <h2 style={{ fontSize: '18px', margin: 0, lineHeight: 1.35 }}>{product.title}</h2>
                <p style={{ color: '#aaa', margin: 0, fontSize: '14px' }}>Ref: {product.refNo || product.internalCode}</p>
                <strong style={{ fontSize: '20px', marginTop: 'auto' }}>{product.price3 || product.price1 || 'Fiyat sorunuz'}</strong>

                <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ textAlign: 'center', background: '#25D366', color: '#071b0d', textDecoration: 'none', fontWeight: 'bold', padding: '12px', borderRadius: '12px', marginTop: '8px' }}>
                  WhatsApp ile Sipariş Ver
                </a>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
