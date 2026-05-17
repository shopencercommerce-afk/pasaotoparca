import products from '../../data/products.json'

const whatsappNumber = '905077302703'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function productCode(product) {
  return product.sku || product.refNo || product.internalCode || `urun-${product.id || product.no}`
}

function productSlug(product) {
  return `${slugify(productCode(product))}-${product.id || product.no || slugify(product.title)}`
}

function cleanImagePath(image) {
  if (!image) return '/logo.svg'
  const normalized = image.replace(/\\/g, '/')
  if (normalized.startsWith('/')) return normalized
  return '/' + normalized.replace(/^images\//, 'images/')
}

function parsePrice(priceText) {
  if (!priceText) return 0
  return Number(String(priceText).replace(/₺/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(value)
}

function calculateSalePrice(product) {
  if (product.price) return `${Number(product.price).toLocaleString('tr-TR')} ₺`
  const cost = parsePrice(product.price3 || product.price2 || product.price1)
  if (!cost) return 'Fiyat sorunuz'
  if (cost <= 1000) return formatPrice(cost * 2)
  if (cost <= 10000) return formatPrice(cost * 1.5)
  return formatPrice(cost * 1.25)
}

export async function getStaticPaths() {
  return {
    paths: products.map(product => ({ params: { slug: productSlug(product) } })),
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const product = products.find(item => productSlug(item) === params.slug) || null

  return {
    props: {
      product
    }
  }
}

export default function ProductDetailPage({ product }) {
  if (!product) return null

  const image = cleanImagePath(product.image)
  const code = productCode(product)
  const price = calculateSalePrice(product)
  const brand = product.brand || 'Paşa Oto Parça'
  const model = product.model || ''
  const message = encodeURIComponent(`Merhaba, bu ürün hakkında bilgi almak istiyorum:\n\nÜrün: ${product.title}\nKod: ${code}\nFiyat: ${price}\nKategori: ${product.category || 'Diğer'}`)
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', background: '#0b0b0b', color: '#fff', minHeight: '100vh' }}>
      <header style={{ padding: '24px 40px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
          <img src="/logo.svg" alt="Paşa Oto Parça" style={{ width: '56px', height: '56px', objectFit: 'contain', background: '#fff', borderRadius: '10px', padding: '4px' }} />
          Paşa Oto Parça
        </a>
        <a href="/products/" style={{ color: '#ddd', textDecoration: 'none', border: '1px solid #333', padding: '12px 18px', borderRadius: '999px' }}>Ürünlere Dön</a>
      </header>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 40px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '36px', alignItems: 'start' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={image} alt={product.title} style={{ maxWidth: '100%', maxHeight: '520px', objectFit: 'contain' }} />
        </div>

        <div style={{ background: '#151515', border: '1px solid #242424', borderRadius: '24px', padding: '30px' }}>
          <div style={{ color: '#aaa', marginBottom: '12px', fontSize: '15px' }}>{brand}{model ? ` • ${model}` : ''} • {product.category || 'Diğer'}</div>
          <h1 style={{ fontSize: '42px', lineHeight: 1.12, margin: '0 0 22px' }}>{product.title}</h1>
          <div style={{ display: 'grid', gap: '12px', margin: '24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', borderBottom: '1px solid #2a2a2a', paddingBottom: '12px' }}>
              <span style={{ color: '#999' }}>Ürün Kodu</span>
              <strong>{code}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', borderBottom: '1px solid #2a2a2a', paddingBottom: '12px' }}>
              <span style={{ color: '#999' }}>Kategori</span>
              <strong>{product.category || 'Diğer'}</strong>
            </div>
            {product.stock ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', borderBottom: '1px solid #2a2a2a', paddingBottom: '12px' }}>
                <span style={{ color: '#999' }}>Stok</span>
                <strong>{product.stock}</strong>
              </div>
            ) : null}
          </div>

          <div style={{ fontSize: '34px', fontWeight: 'bold', margin: '26px 0' }}>{price}</div>

          <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#071b0d', textDecoration: 'none', fontWeight: 'bold', padding: '17px 22px', borderRadius: '14px', fontSize: '18px' }}>WhatsApp ile Sipariş Ver</a>
        </div>
      </section>
    </main>
  )
}
