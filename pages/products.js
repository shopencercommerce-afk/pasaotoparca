import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import products from '../data/products.json'
import brands from '../data/brands'
import SiteLayout, { cleanImagePath, parsePrice, productCode, productSlug, salePrice, whatsappUrl, productsUrl } from '../components/SiteLayout'

const pageSize = 36
const brandLabels = brands.reduce((acc, brand) => ({ ...acc, [brand.slug]: brand.name }), {})

function normalizeText(text) {
  return String(text || '').toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, ' ').trim()
}

function productMatchesBrand(product, brandSlug) {
  if (!brandSlug) return true
  return normalizeText(`${product.brand || ''} ${product.title || ''} ${product.rawText || ''}`).includes(normalizeText(brandSlug))
}

function productMatchesModel(product, modelSlug) {
  if (!modelSlug) return true
  const wanted = normalizeText(modelSlug).replace(/-/g, ' ')
  const text = normalizeText(`${product.title || ''} ${product.rawText || ''} ${product.model || ''}`)
  if (wanted === 'model 3') return text.includes('model 3') || text.includes('model 3 y') || text.includes('model 3y')
  if (wanted === 'model y') return text.includes('model y') || text.includes('model 3 y') || text.includes('model 3y')
  return text.includes(wanted)
}

function productMatchesCategory(product, category) {
  if (!category) return true
  return normalizeText(product.category || 'Diğer') === normalizeText(category)
}

function productMatchesSearch(product, query) {
  if (!query) return true
  const words = normalizeText(query).split(' ').filter(Boolean)
  const text = normalizeText(`${product.title || ''} ${productCode(product)} ${product.category || ''} ${product.brand || ''} ${product.model || ''} ${product.rawText || ''}`)
  return words.every(word => text.includes(word))
}

function readFiltersFromUrl() {
  if (typeof window === 'undefined') return { brand: '', model: '', q: '', category: '' }
  const params = new URLSearchParams(window.location.search)
  return { brand: params.get('brand') || '', model: params.get('model') || '', q: params.get('q') || '', category: params.get('category') || '' }
}

function buildUrl(nextFilters) {
  const params = new URLSearchParams()
  if (nextFilters.brand) params.set('brand', nextFilters.brand)
  if (nextFilters.model) params.set('model', nextFilters.model)
  if (nextFilters.q) params.set('q', nextFilters.q)
  if (nextFilters.category) params.set('category', nextFilters.category)
  const query = params.toString()
  return query ? `/products/?${query}` : '/products/'
}

function addToCart(product, setToast) {
  if (typeof window === 'undefined') return
  const item = { id: `${product.no || product.id || productCode(product)}`, title: product.title, code: productCode(product), price: salePrice(product, 2), image: cleanImagePath(product.image), category: product.category || 'Diğer', qty: 1 }
  const current = JSON.parse(localStorage.getItem('pasaCart') || '[]')
  const existing = current.find(cartItem => cartItem.id === item.id)
  const next = existing ? current.map(cartItem => cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem) : [...current, item]
  localStorage.setItem('pasaCart', JSON.stringify(next))
  window.dispatchEvent(new Event('cart-updated'))
  setToast(`${product.title} sepete eklendi.`)
  window.setTimeout(() => setToast(''), 2400)
}

function priceNumber(product) {
  return parsePrice(salePrice(product, 2))
}

export default function ProductsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState({ brand: '', model: '', q: '', category: '' })
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [toast, setToast] = useState('')
  const [sort, setSort] = useState('featured')

  useEffect(() => { const next = readFiltersFromUrl(); setFilters(next); setLocalSearch(next.q) }, [router.asPath])

  const allCategories = useMemo(() => Array.from(new Set(products.map(p => p.category || 'Diğer'))).filter(Boolean).sort(), [])
  const selectedBrand = brands.find(brand => brand.slug === filters.brand)

  const filteredProducts = useMemo(() => {
    const result = products.filter(product => productMatchesBrand(product, filters.brand) && productMatchesModel(product, filters.model) && productMatchesCategory(product, filters.category) && productMatchesSearch(product, filters.q))
    return [...result].sort((a, b) => {
      if (sort === 'price-asc') return priceNumber(a) - priceNumber(b)
      if (sort === 'price-desc') return priceNumber(b) - priceNumber(a)
      if (sort === 'name') return String(a.title || '').localeCompare(String(b.title || ''), 'tr')
      return (a.no || a.id || 0) - (b.no || b.id || 0)
    })
  }, [filters, sort])

  useEffect(() => { setVisibleCount(pageSize) }, [filters.brand, filters.model, filters.q, filters.category, sort])

  useEffect(() => {
    const onScroll = () => { if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900) setVisibleCount(count => Math.min(count + pageSize, filteredProducts.length)) }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); return () => window.removeEventListener('scroll', onScroll)
  }, [filteredProducts.length])

  function updateFilters(patch) {
    const next = { ...filters, ...patch }
    if (patch.brand !== undefined) next.model = ''
    router.push(buildUrl(next), undefined, { shallow: true })
  }

  function handleSearch(e) { e.preventDefault(); updateFilters({ q: localSearch.trim() }) }

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const brandName = brandLabels[filters.brand] || 'Tüm Markalar'
  const modelName = filters.model ? filters.model.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''
  const pageTitle = filters.q ? `Arama: ${filters.q}` : modelName ? `${brandName} ${modelName} Ürünleri` : filters.category ? `${filters.category} Ürünleri` : `${brandName} Ürünleri`
  const hasMore = visibleProducts.length < filteredProducts.length
  const activeFilterCount = [filters.brand, filters.model, filters.q, filters.category].filter(Boolean).length

  return (
    <SiteLayout>
      <section className="intro">
        <div><span>ÜRÜN KATALOĞU</span><h1>{pageTitle}</h1><p>{filteredProducts.length} ürün bulundu. Stoktaki ürünler için WhatsApp üzerinden hızlı sipariş verebilirsiniz.</p></div>
        <button className="filterToggle" type="button" onClick={() => setDrawerOpen(true)}>Filtreler {activeFilterCount ? `(${activeFilterCount})` : ''}</button>
      </section>

      <section className="catalogShell">
        <aside className={`filters ${drawerOpen ? 'open' : ''}`}>
          <div className="filterHead"><strong>Filtreler</strong><button onClick={() => setDrawerOpen(false)} type="button">×</button></div>
          <form className="localSearch" onSubmit={handleSearch}><input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Ürün, kod veya model ara" /><button type="submit">Ara</button></form>
          <div className="filterBlock"><strong>Marka</strong><a className={!filters.brand ? 'active' : ''} href="/products/">Tüm Markalar</a>{brands.map(brand => <a className={filters.brand === brand.slug ? 'active' : ''} key={brand.slug} href={productsUrl(brand.slug)}>{brand.name}</a>)}</div>
          {selectedBrand ? <div className="filterBlock"><strong>Model</strong><button className={!filters.model ? 'active' : ''} type="button" onClick={() => updateFilters({ model: '' })}>Tüm Modeller</button>{selectedBrand.models.map(model => <button className={filters.model === model.toLowerCase().replace(/\s+/g, '-') ? 'active' : ''} key={model} type="button" onClick={() => updateFilters({ model: model.toLowerCase().replace(/\s+/g, '-') })}>{model}</button>)}</div> : null}
          <div className="filterBlock"><strong>Kategori</strong><button className={!filters.category ? 'active' : ''} type="button" onClick={() => updateFilters({ category: '' })}>Tüm Kategoriler</button>{allCategories.map(category => <button className={filters.category === category ? 'active' : ''} key={category} type="button" onClick={() => updateFilters({ category })}>{category}</button>)}</div>
          {activeFilterCount ? <button type="button" className="clearBtn" onClick={() => router.push('/products/', undefined, { shallow: true })}>Filtreleri Temizle</button> : null}
        </aside>

        <div className="catalogMain">
          <div className="toolbar"><div className="quickCats"><button className={!filters.category ? 'active' : ''} onClick={() => updateFilters({ category: '' })}>Tümü</button>{allCategories.slice(0, 12).map(category => <button className={filters.category === category ? 'active' : ''} key={category} onClick={() => updateFilters({ category })}>{category}</button>)}</div><label><span>Sırala</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Öne çıkan</option><option value="price-asc">Fiyat artan</option><option value="price-desc">Fiyat azalan</option><option value="name">Ürün adı</option></select></label></div>
          <section className="grid">
            {visibleProducts.length === 0 ? <div className="empty"><strong>Ürün bulunamadı.</strong><p>Arama kelimesini sadeleştirin, parça kodunu deneyin veya filtreleri temizleyin.</p><button onClick={() => router.push('/products/', undefined, { shallow: true })}>Filtreleri Temizle</button></div> : visibleProducts.map(product => {
              const price = salePrice(product, 2)
              const detailUrl = `/product/${productSlug(product)}`
              const wp = whatsappUrl(`Merhaba, bu ürünü sipariş vermek istiyorum:\n\nÜrün: ${product.title}\nKod: ${productCode(product)}\nFiyat: ${price}\nKategori: ${product.category || 'Diğer'}\nStok: Stokta\nKargo: 2 gün içinde kargoda`)
              return <article key={`${product.no || product.id}-${productCode(product)}`} className="card"><a href={detailUrl} className="cardMain"><div className="imageBox"><img loading="lazy" src={cleanImagePath(product.image)} alt={product.title} /></div><div className="cardBody"><span>{product.category || 'Diğer'}</span><h2>{product.title}</h2><p>Ref: {productCode(product)}</p><div className="badges"><small>Stokta</small><small>2 gün içinde kargoda</small></div><strong>{price}</strong></div></a><div className="buttonRow"><a href={wp} target="_blank" rel="noreferrer" className="wpBtn">WP Sipariş Ver</a><button type="button" onClick={() => addToCart(product, setToast)} className="cartBtn">Sepete Ekle</button></div></article>
            })}
          </section>
          {hasMore ? <div className="loadMore"><button onClick={() => setVisibleCount(count => Math.min(count + pageSize, filteredProducts.length))}>Daha Fazla Ürün Göster</button><span>{visibleProducts.length} / {filteredProducts.length}</span></div> : filteredProducts.length > 0 ? <div className="loadMore done"><span>Tüm ürünler gösterildi: {filteredProducts.length} ürün</span></div> : null}
        </div>
      </section>
      {drawerOpen ? <button className="overlay" onClick={() => setDrawerOpen(false)} aria-label="Filtreleri kapat" /> : null}
      {toast ? <div className="toast"><span>{toast}</span><a href="/cart/">Sepete Git</a></div> : null}
      <style jsx>{`
        .intro{max-width:1320px;margin:0 auto;padding:42px 56px 16px;display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.intro span{color:#f32334;font-size:12px;font-weight:950;letter-spacing:1.4px}.intro h1{font-size:clamp(38px,5vw,64px);line-height:1;letter-spacing:-2.5px;margin:10px 0}.intro p{max-width:720px;color:#666d78;font-size:16px;line-height:1.6;margin:0}.filterToggle{display:none;border:0;background:#151821;color:#fff;border-radius:999px;padding:14px 20px;font-weight:950}.catalogShell{max-width:1320px;margin:0 auto;padding:18px 56px 46px;display:grid;grid-template-columns:280px minmax(0,1fr);gap:22px;align-items:start}.filters{position:sticky;top:142px;min-width:0;background:#fff;border:1px solid #e8eaf0;border-radius:28px;padding:20px;box-shadow:0 22px 70px rgba(31,35,45,.055);max-height:calc(100vh - 168px);overflow:auto}.filterHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.filterHead strong{font-size:22px}.filterHead button{display:none}.localSearch{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-bottom:18px}.localSearch input{min-width:0;border:1px solid #e1e4ea;background:#f7f8fa;border-radius:16px;padding:13px 14px;font:inherit}.localSearch button{border:0;border-radius:16px;background:#f32334;color:#fff;font-weight:950;padding:0 15px}.filterBlock{display:grid;gap:8px;margin-top:18px}.filterBlock strong{margin-bottom:2px}.filterBlock a,.filterBlock button,.clearBtn{border:0;text-align:left;background:#f7f8fa;color:#555b67;border-radius:15px;padding:11px 13px;font:inherit;font-weight:800;cursor:pointer}.filterBlock .active,.clearBtn{background:#151821;color:#fff}.clearBtn{width:100%;margin-top:18px;text-align:center}.catalogMain{min-width:0}.toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:14px;margin-bottom:18px}.toolbar label{background:#fff;border:1px solid #e1e4ea;border-radius:18px;padding:9px 12px;color:#666;font-weight:850;display:flex;gap:9px;align-items:center;white-space:nowrap}.toolbar select{border:0;outline:0;font-weight:900;background:transparent}.quickCats{display:flex;gap:10px;flex-wrap:wrap;min-width:0}.quickCats button{border:1px solid #e1e4ea;background:#fff;border-radius:999px;padding:10px 14px;font-weight:850;cursor:pointer;color:#555b67}.quickCats .active{background:#f32334;color:#fff;border-color:#f32334}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}.card{min-width:0;background:#fff;border:1px solid #e8eaf0;border-radius:24px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 18px 54px rgba(31,35,45,.055)}.cardMain{display:flex;flex-direction:column;flex:1;min-width:0}.imageBox{height:190px;background:#f7f8fa;display:flex;align-items:center;justify-content:center;padding:16px}.imageBox img{max-width:100%;max-height:100%;object-fit:contain}.cardBody{padding:15px;display:flex;flex-direction:column;gap:8px;flex:1;min-width:0}.cardBody span{color:#f32334;font-size:12px;font-weight:950}.cardBody h2{font-size:16px;margin:0;line-height:1.32;min-height:42px;word-break:break-word}.cardBody p{color:#777;margin:0;font-size:13px;overflow-wrap:anywhere}.badges{display:flex;gap:7px;flex-wrap:wrap}.badges small{background:#eef8f1;border-radius:999px;padding:6px 9px;color:#156b2f;font-size:11px;font-weight:900}.cardBody strong{font-size:19px;margin-top:auto;color:#f32334}.buttonRow{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:0 15px 15px}.wpBtn,.cartBtn{border:0;border-radius:999px;padding:12px 8px;text-align:center;font-weight:950;cursor:pointer;font-family:inherit;font-size:13px}.wpBtn{background:#25D366;color:#071b0d}.cartBtn{background:#151821;color:#fff}.empty{grid-column:1/-1;background:#fff;border:1px solid #e8eaf0;border-radius:24px;padding:26px}.empty strong{display:block;font-size:22px;margin-bottom:8px}.empty p{color:#666d78}.empty button{border:0;background:#151821;color:#fff;border-radius:999px;padding:13px 18px;font-weight:950}.loadMore{padding:26px 0 16px;display:flex;flex-direction:column;align-items:center;gap:10px}.loadMore button{border:0;background:#151821;color:#fff;border-radius:999px;padding:15px 26px;font-weight:950;cursor:pointer}.loadMore span{color:#666d78;font-weight:850}.loadMore.done span{background:#fff;border:1px solid #e1e4ea;border-radius:999px;padding:14px 22px;color:#333}.overlay{display:none}.toast{position:fixed;right:22px;bottom:24px;z-index:120;background:#151821;color:#fff;border-radius:22px;padding:14px 16px;display:flex;gap:14px;align-items:center;box-shadow:0 20px 54px rgba(31,35,45,.22)}.toast a{background:#25D366;color:#071b0d;border-radius:999px;padding:10px 13px;font-weight:950}@media(max-width:920px){.intro{padding:24px 14px 10px;display:grid;gap:14px}.intro h1{font-size:30px;line-height:1.06;letter-spacing:-1.4px}.intro p{font-size:14.5px;line-height:1.55}.filterToggle{display:inline-flex;width:100%;justify-content:center}.catalogShell{display:block;padding:10px 14px 28px}.filters{position:fixed;left:0;right:0;bottom:0;top:auto;z-index:110;border-radius:26px 26px 0 0;max-height:84vh;transform:translateY(105%);transition:.22s;padding:18px 14px 98px;box-shadow:0 -22px 70px rgba(31,35,45,.24)}.filters.open{transform:translateY(0)}.filterHead button{display:grid;place-items:center;border:0;background:#f1f3f6;width:40px;height:40px;border-radius:50%;font-size:24px}.overlay{display:block;position:fixed;inset:0;z-index:105;background:rgba(15,18,25,.42);border:0}.toolbar{grid-template-columns:1fr;gap:10px;position:sticky;top:122px;z-index:20;background:#f5f6f8;padding:8px 0 10px;margin-bottom:10px}.toolbar label{width:100%;justify-content:space-between;border-radius:16px}.toolbar select{max-width:58%;min-width:0}.quickCats{display:flex;overflow-x:auto;flex-wrap:nowrap;padding:2px 2px 8px;margin:0 -2px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}.quickCats button{white-space:nowrap;scroll-snap-align:start;padding:10px 13px;font-size:13px}.grid{grid-template-columns:1fr;gap:12px}.card{border-radius:20px;display:grid;grid-template-columns:118px minmax(0,1fr);align-items:stretch;overflow:hidden}.cardMain{display:contents}.imageBox{height:auto;min-height:150px;padding:10px}.cardBody{padding:12px 12px 10px}.cardBody h2{font-size:14.5px;min-height:auto;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.badges small{font-size:10.5px;padding:5px 7px}.cardBody strong{font-size:17px}.buttonRow{grid-column:1/-1;grid-template-columns:1fr 1fr;padding:0 12px 12px}.toast{left:14px;right:14px;bottom:88px;justify-content:space-between}.loadMore button{width:100%}}@media(max-width:420px){.catalogShell{padding-left:10px;padding-right:10px}.intro{padding-left:10px;padding-right:10px}.card{grid-template-columns:104px minmax(0,1fr)}.imageBox{min-height:138px}.cardBody{gap:6px;padding:10px}.cardBody h2{font-size:13.5px}.cardBody p{font-size:12px}.buttonRow{gap:7px;padding:0 10px 10px}.wpBtn,.cartBtn{font-size:12px;padding:11px 6px}.toolbar{top:118px}.quickCats button{font-size:12.5px}}
      `}</style>
    </SiteLayout>
  )
}