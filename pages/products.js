import { useRouter } from 'next/router'
import products from '../data/products.json'

const whatsappNumber = '905077302703'
const fallbackLogo = '/logo-new.svg'

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
  if (!image) return fallbackLogo
  const normalized = String(image).replace(/\\/g, '/')
  if (normalized === '/logo.svg' || normalized === 'logo.svg') return fallbackLogo
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
  if (!cost) return ''
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
  if (wanted === 'model 3') return productText.includes('model 3') || productText.includes('model 3 y') || productText.includes('model 3y')
  if (wanted === 'model y') return productText.includes('model y') || productText.includes('model 3 y') || productText.includes('model 3y')
  return productText.includes(wanted)
}

function addToCart(product) {
  if (typeof window === 'undefined') return
  const item = {
    id: `${product.no || product.id || productCode(product)}`,
    title: product.title,
    code: productCode(product),
    price: calculateSalePrice(product) || 'Fiyat sorunuz',
    image: cleanImagePath(product.image),
    category: product.category || 'Diğer',
    qty: 1
  }
  const current = JSON.parse(localStorage.getItem('pasaCart') || '[]')
  const existing = current.find(cartItem => cartItem.id === item.id)
  const next = existing
    ? current.map(cartItem => cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem)
    : [...current, item]
  localStorage.setItem('pasaCart', JSON.stringify(next))
  window.dispatchEvent(new Event('cart-updated'))
  alert('Ürün sepete eklendi.')
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
    <main className="page">
      <header className="header">
        <a href="/" className="brand"><img src="/logo-new.svg" alt="Paşa Oto Parça" />Paşa Oto Parça</a>
        <div className="headerActions">
          <a href="/cart/" className="cartLink">Sepetim</a>
          <a href={`https://wa.me/${whatsappNumber}?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.`} className="wpTop">WhatsApp Sipariş</a>
        </div>
      </header>

      <section className="intro">
        <h1>{pageTitle}</h1>
        <p>Bu filtrede {filteredProducts.length} ürün var. Performans için şu an ilk {visibleProducts.length} ürün gösteriliyor.</p>
        <div className="categories">
          {categories.map(category => <span key={category}>{category}</span>)}
        </div>
      </section>

      <section className="grid">
        {visibleProducts.length === 0 ? (
          <div className="empty">Bu marka/model için ürün bulunamadı.</div>
        ) : visibleProducts.map(product => {
          const image = cleanImagePath(product.image)
          const price = calculateSalePrice(product)
          const detailUrl = `/product/${productSlug(product)}`
          const message = encodeURIComponent(`Merhaba, bu ürünü sipariş vermek istiyorum:\n\nÜrün: ${product.title}\nKod: ${productCode(product)}\nFiyat: ${price || product.price || 'Fiyat sorunuz'}\nKategori: ${product.category}`)
          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`

          return (
            <article key={`${product.no || product.id}-${productCode(product)}`} className="card">
              <a href={detailUrl} className="cardMain">
                <div className="imageBox"><img loading="lazy" src={image} alt={product.title} /></div>
                <div className="cardBody">
                  <span>{product.category || 'Diğer'} • {brandName}</span>
                  <h2>{product.title}</h2>
                  <p>Ref: {productCode(product)}</p>
                  <strong>{price || (product.price ? `${product.price.toLocaleString('tr-TR')} ₺` : 'Fiyat sorunuz')}</strong>
                </div>
              </a>
              <div className="buttonRow">
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="wpBtn">WP Sipariş Ver</a>
                <button type="button" onClick={() => addToCart(product)} className="cartBtn">Sepete Ekle</button>
              </div>
            </article>
          )
        })}
      </section>

      <style jsx>{`
        .page{font-family:Arial,sans-serif;background:#0b0b0b;color:#fff;min-height:100vh}.header{padding:24px 40px;border-bottom:1px solid #222;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap}.brand{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none;font-size:24px;font-weight:bold}.brand img{width:86px;height:56px;object-fit:contain;background:#fff;border-radius:10px;padding:4px}.headerActions{display:flex;gap:10px;flex-wrap:wrap}.wpTop,.cartLink{color:#071b0d;text-decoration:none;background:#25D366;padding:12px 18px;border-radius:10px;font-weight:bold}.cartLink{background:#fff;color:#111}.intro{padding:50px 40px 20px}.intro h1{font-size:44px;margin:0}.intro p{color:#aaa;font-size:18px}.categories{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.categories span{background:#171717;border:1px solid #2a2a2a;padding:10px 14px;border-radius:999px;color:#ddd}.grid{padding:30px 40px 80px;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px}.empty{grid-column:1/-1;background:#151515;border:1px solid #242424;border-radius:18px;padding:28px;color:#ddd}.card{background:#151515;border:1px solid #242424;border-radius:18px;overflow:hidden;display:flex;flex-direction:column}.cardMain{text-decoration:none;color:#fff;display:flex;flex-direction:column;flex:1}.imageBox{height:210px;background:#fff;display:flex;align-items:center;justify-content:center;padding:14px}.imageBox img{max-width:100%;max-height:100%;object-fit:contain}.cardBody{padding:18px;display:flex;flex-direction:column;gap:10px;flex:1}.cardBody span{color:#999;font-size:13px}.cardBody h2{font-size:18px;margin:0;line-height:1.35}.cardBody p{color:#aaa;margin:0;font-size:14px;overflow-wrap:anywhere}.cardBody strong{font-size:20px;margin-top:auto}.buttonRow{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 18px 18px}.wpBtn,.cartBtn{border:0;border-radius:12px;padding:12px;text-align:center;font-weight:800;text-decoration:none;cursor:pointer;font-family:inherit;font-size:14px}.wpBtn{background:#25D366;color:#071b0d}.cartBtn{background:#fff;color:#111}@media(max-width:760px){.header{padding:14px 16px;align-items:stretch}.brand{font-size:20px}.brand img{width:74px;height:46px}.headerActions a{flex:1;text-align:center}.intro{padding:30px 16px 12px}.intro h1{font-size:34px}.categories{flex-wrap:nowrap;overflow-x:auto}.categories span{white-space:nowrap}.grid{padding:22px 16px 54px;grid-template-columns:1fr;gap:16px}.buttonRow{grid-template-columns:1fr}.imageBox{height:190px}}
      `}</style>
    </main>
  )
}
