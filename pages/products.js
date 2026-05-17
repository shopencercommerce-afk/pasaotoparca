import { useRouter } from 'next/router'
import products from '../data/products.json'

const whatsappNumber = '905077302703'

const brandLabels = {
  tesla: 'Tesla',
  byd: 'BYD',
  togg: 'Togg',
  chery: 'Chery',
  mg: 'MG',
  skywell: 'Skywell'
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

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

  if (normalized.startsWith('/')) {
    return normalized
  }

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
  const cost = parsePrice(product.price3 || product.price2 || product.price1)
  if (!cost) return ''
  if (product.price) return `${Number(product.price).toLocaleString('tr-TR')} ₺`
  if (cost <= 1000) return formatPrice(cost * 2)
  if (cost <= 10000) return formatPrice(cost * 1.5)
  return formatPrice(cost * 1.25)
}

function productMatchesBrand(product, brandSlug) {
  if (!brandSlug) return true
  const brandText = normalizeText(`${product.brand || ''} ${product.title || ''} ${product.rawText || ''}`)
  return brandText.includes(normalizeText(brandSlug))
}

function productMatchesModel(product, modelSlug) {
  if (!modelSlug) return true
  const wanted = normalizeText(modelSlug).replace(/-/g, ' ')
  const productText = normalizeText(`${product.title || ''} ${product.rawText || ''} ${product.model || ''}`)

  if (wanted === 'model 3') {
    return productText.includes('model 3') || productText.includes('model 3 y') || productText.includes('model 3 y') || productText.includes('model 3y')
  }

  if (wanted === 'model y') {
    return productText.includes('model y') || productText.includes('model 3 y') || productText.includes('model 3y')
  }

  return productText.includes(wanted)
}

export default function ProductsPage() {
  const router = useRouter()
  const brandSlug = typeof router.query.brand === 'string' ? router.query.brand : ''
  const modelSlug = typeof router.query.model === 'string' ? router.query.model : ''

  const filteredProducts = products.filter(product => productMatchesBrand(product, brandSlug) && productMatchesModel(product, modelSlug))
  const visibleProducts = filteredProducts.slice(0, 60)
  const categories = ['Tümü', ...Array.from(new Set(filteredProducts.map(p => p.category || 'Diğer')))]
  const brandName = brandLabels[brandSlug] || 'Tüm Markalar'
  const modelName = modelSlug ? modelSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''
  const pageTitle = modelName ? `${brandName} ${modelName} Ürünleri` : `${brandName} Ürünleri`

  return (
    <main style={{ fontFamily: 'Arial', background: '#0b0b0b', color: '#fff', minHeight: '100vh' }}>
      <header style={{ padding: '24px 40px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
          <img src="/logo.svg" alt="Paşa Oto Parça" style={{ width: '56px', height: '56px', objectFit: 'contain', background: '#fff', borderRadius: '10px', padding: '4px' }} />
          Paşa Oto Parça
        </a>
        <a href={`https://wa.me/${whatsappNumber}?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.`} style={{ color: '#071b0d', textDecoration: 'none', background: '#25D366', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold' }}>WhatsApp Sipariş</a>
      </header>

      <section style={{ padding: '50px 40px 20px' }}>
        <h1 style={{ fontSize: '44px', margin: 0 }}>{pageTitle}</h1>
        <p style={{ color: '#aaa', fontSize: '18px' }}>Bu filtrede {filteredProducts.length} ürün var. Performans için şu an ilk {visibleProducts.length} ürün gösteriliyor.</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px' }}>
          {categories.map(category => (
            <span key={category} style={{ background: '#171717', border: '1px solid #2a2a2a', padding: '10px 14px', borderRadius: '999px', color: '#ddd' }}>{category}</span>
          ))}
        </div>
      </section>

      <section style={{ padding: '30px 40px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '22px' }}>
        {visibleProducts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', background: '#151515', border: '1px solid #242424', borderRadius: '18px', padding: '28px', color: '#ddd' }}>
            Bu marka/model için ürün bulunamadı.
          </div>
        ) : visibleProducts.map(product => {
          const image = cleanImagePath(product.image)
          const salePrice = calculateSalePrice(product)
          const slug = productSlug(product)
          const detailUrl = `/product/${slug}`
          const message = encodeURIComponent(`Merhaba, bu ürünü sipariş vermek istiyorum:\n\nÜrün: ${product.title}\nKod: ${product.refNo || product.internalCode || product.sku}\nFiyat: ${salePrice || product.price || 'Fiyat sorunuz'}\nKategori: ${product.category}`)
          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

          return (
            <a key={`${product.no || product.id}-${product.refNo || product.sku}`} href={detailUrl} style={{ background: '#151515', border: '1px solid #242424', borderRadius: '18px', overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: '#fff' }}>
              <div style={{ height: '210px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px' }}>
                <img loading="lazy" src={image} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <span style={{ color: '#999', fontSize: '13px' }}>{product.category || 'Diğer'} • {brandName}</span>
                <h2 style={{ fontSize: '18px', margin: 0, lineHeight: 1.35 }}>{product.title}</h2>
                <p style={{ color: '#aaa', margin: 0, fontSize: '14px' }}>Ref: {product.refNo || product.internalCode || product.sku}</p>
                <strong style={{ fontSize: '20px', marginTop: 'auto' }}>{salePrice || (product.price ? `${product.price.toLocaleString('tr-TR')} ₺` : 'Fiyat sorunuz')}</strong>
                <span onClick={(e) => e.stopPropagation()}>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#071b0d', textDecoration: 'none', fontWeight: 'bold', padding: '12px', borderRadius: '12px', marginTop: '8px' }}>WhatsApp ile Sipariş Ver</a>
                </span>
              </div>
            </a>
          )
        })}
      </section>
    </main>
  )
}
