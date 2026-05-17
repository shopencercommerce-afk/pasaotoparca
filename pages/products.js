import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import products from '../data/products.json'

const whatsappNumber = '905077302703'
const fallbackLogo = '/logo-new.svg'
const pageSize = 36

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

function productMatchesSearch(product, query) {
  if (!query) return true
  const words = normalizeText(query).split(' ').filter(Boolean)
  if (words.length === 0) return true
  const text = normalizeText(`${product.title || ''} ${productCode(product)} ${product.category || ''} ${product.brand || ''} ${product.model || ''} ${product.rawText || ''}`)
  return words.every(word => text.includes(word))
}

function readFiltersFromUrl() {
  if (typeof window === 'undefined') return { brand: '', model: '', q: '' }
  const params = new URLSearchParams(window.location.search)
  return {
    brand: params.get('brand') || '',
    model: params.get('model') || '',
    q: params.get('q') || ''
  }
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
  const [filters, setFilters] = useState({ brand: '', model: '', q: '' })
  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    const updateFilters = () => setFilters(readFiltersFromUrl())
    updateFilters()
    window.addEventListener('popstate', updateFilters)
    return () => window.removeEventListener('popstate', updateFilters)
  }, [router.asPath])

  const brandSlug = filters.brand
  const modelSlug = filters.model
  const searchQuery = filters.q

  const filteredProducts = useMemo(() => products.filter(product => (
    productMatchesBrand(product, brandSlug) &&
    productMatchesModel(product, modelSlug) &&
    productMatchesSearch(product, searchQuery)
  )), [brandSlug, modelSlug, searchQuery])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [brandSlug, modelSlug, searchQuery])

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900) {
        setVisibleCount(count => Math.min(count + pageSize, filteredProducts.length))
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [filteredProducts.length])

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const categories = ['Tümü', ...Array.from(new Set(filteredProducts.map(p => p.category || 'Diğer')))]
  const brandName = brandLabels[brandSlug] || 'Tüm Markalar'
  const modelName = modelSlug ? modelSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''
  const pageTitle = searchQuery ? `Arama: ${searchQuery}` : modelName ? `${brandName} ${modelName} Ürünleri` : `${brandName} Ürünleri`
  const hasMore = visibleProducts.length < filteredProducts.length

  return (
    <main className="page">
      <header className="header">
        <a href="/" className="logoWrap"><img src="/logo-new.svg" alt="Paşa Oto Parça" /></a>
        <nav>
          <a href="/">Ana Sayfa</a>
          <a href="/products/">Katalog</a>
          <a href="/account">Hesabım</a>
          <a href="/cart/">Sepetim</a>
          <a href={`https://wa.me/${whatsappNumber}?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.`}>Destek</a>
        </nav>
      </header>

      <section className="intro">
        <span>ÜRÜN KATALOĞU</span>
        <h1>{pageTitle}</h1>
        <p>{filteredProducts.length} ürün bulundu. Şu an {visibleProducts.length} ürün gösteriliyor. Aşağı indikçe diğer ürünler otomatik yüklenecek.</p>
        <div className="categories">
          {categories.map(category => <span key={category}>{category}</span>)}
        </div>
      </section>

      <section className="grid">
        {visibleProducts.length === 0 ? (
          <div className="empty">Bu arama veya filtre için ürün bulunamadı.</div>
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

      {hasMore ? (
        <div className="loadMore">
          <button onClick={() => setVisibleCount(count => Math.min(count + pageSize, filteredProducts.length))}>Daha Fazla Ürün Göster</button>
          <span>{visibleProducts.length} / {filteredProducts.length}</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="loadMore done"><span>Tüm ürünler gösterildi: {filteredProducts.length} ürün</span></div>
      ) : null}

      <style jsx>{`
        *{box-sizing:border-box}.page{font-family:Arial,sans-serif;background:#f5f5f3;color:#111;min-height:100vh;overflow-x:hidden}a{text-decoration:none;color:inherit}.header{position:sticky;top:0;z-index:40;display:grid;grid-template-columns:180px 1fr;align-items:center;gap:28px;padding:16px 54px;background:rgba(255,255,255,.92);border-bottom:1px solid #e8e8e8;backdrop-filter:blur(18px)}.logoWrap img{width:155px;height:72px;object-fit:contain;display:block}nav{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}nav a{background:#fff;border:1px solid #e3e3e3;border-radius:999px;padding:11px 16px;font-weight:900;font-size:14px;box-shadow:0 12px 30px rgba(0,0,0,.035)}.intro{max-width:1320px;margin:0 auto;padding:58px 54px 22px}.intro>span{color:#b3141b;font-size:12px;font-weight:900;letter-spacing:1.4px}.intro h1{font-size:clamp(42px,6vw,72px);line-height:.98;letter-spacing:-3px;margin:14px 0}.intro p{max-width:720px;color:#666;font-size:18px;line-height:1.7;margin:0}.categories{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}.categories span{background:#fff;border:1px solid #e1e1e1;padding:10px 15px;border-radius:999px;color:#333;font-weight:800;font-size:14px}.grid{max-width:1320px;margin:0 auto;padding:28px 54px 32px;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}.empty{grid-column:1/-1;background:#fff;border:1px solid #e6e6e6;border-radius:26px;padding:32px;color:#333;box-shadow:0 24px 70px rgba(0,0,0,.05)}.card{background:#fff;border:1px solid #e6e6e6;border-radius:26px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(0,0,0,.055)}.cardMain{display:flex;flex-direction:column;flex:1;color:#111}.imageBox{height:220px;background:#f7f7f7;display:flex;align-items:center;justify-content:center;padding:18px}.imageBox img{max-width:100%;max-height:100%;object-fit:contain}.cardBody{padding:18px;display:flex;flex-direction:column;gap:10px;flex:1}.cardBody span{color:#777;font-size:13px;font-weight:800}.cardBody h2{font-size:18px;margin:0;line-height:1.35;min-height:48px}.cardBody p{color:#777;margin:0;font-size:14px;overflow-wrap:anywhere}.cardBody strong{font-size:21px;margin-top:auto;color:#b3141b}.buttonRow{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 18px 18px}.wpBtn,.cartBtn{border:0;border-radius:999px;padding:12px;text-align:center;font-weight:900;text-decoration:none;cursor:pointer;font-family:inherit;font-size:13px}.wpBtn{background:#25D366;color:#071b0d}.cartBtn{background:#111;color:#fff}.loadMore{max-width:1320px;margin:0 auto;padding:10px 54px 86px;display:flex;flex-direction:column;align-items:center;gap:10px}.loadMore button{border:0;background:#111;color:#fff;border-radius:999px;padding:15px 26px;font-weight:900;cursor:pointer}.loadMore span{color:#666;font-weight:800}.loadMore.done span{background:#fff;border:1px solid #e1e1e1;border-radius:999px;padding:14px 22px;color:#333}@media(max-width:760px){.header{grid-template-columns:1fr;padding:14px 16px;gap:12px}.logoWrap img{width:132px;height:62px;margin:0 auto}nav{justify-content:flex-start;overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px}nav a{white-space:nowrap}.intro{padding:36px 16px 14px}.intro h1{font-size:38px;letter-spacing:-2px}.intro p{font-size:16px}.categories{flex-wrap:nowrap;overflow-x:auto}.categories span{white-space:nowrap}.grid{padding:22px 16px 28px;grid-template-columns:1fr;gap:16px}.buttonRow{grid-template-columns:1fr}.imageBox{height:200px}.loadMore{padding:10px 16px 72px}.loadMore button{width:100%}}
      `}</style>
    </main>
  )
}
