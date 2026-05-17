import { useRouter } from 'next/router'
import brands from '../data/brands'

export const whatsappNumber = '905077302703'
export const wpBaseUrl = `https://wa.me/${whatsappNumber}`

export function slugify(text) {
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

export function cleanImagePath(image) {
  if (!image) return '/logo-new.svg'
  const normalized = String(image).replace(/\\/g, '/')
  if (normalized === '/logo.svg' || normalized === 'logo.svg') return '/logo-new.svg'
  if (normalized.startsWith('/')) return normalized
  return '/' + normalized.replace(/^images\//, 'images/')
}

export function productCode(product) {
  return product.sku || product.refNo || product.internalCode || `urun-${product.id || product.no}`
}

export function productSlug(product) {
  return `${slugify(productCode(product))}-${product.id || product.no || slugify(product.title)}`
}

export function parsePrice(priceText) {
  if (!priceText) return 0
  return Number(String(priceText).replace(/₺/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

export function formatPrice(value, digits = 0) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: digits }).format(value)
}

export function salePrice(product, digits = 0) {
  if (product.price) return formatPrice(Number(product.price), digits)
  const cost = parsePrice(product.price3 || product.price2 || product.price1)
  if (!cost) return 'Fiyat sorunuz'
  if (cost <= 1000) return formatPrice(cost * 2, digits)
  if (cost <= 10000) return formatPrice(cost * 1.5, digits)
  return formatPrice(cost * 1.25, digits)
}

export function productsUrl(brand, model) {
  const query = model ? `?brand=${brand}&model=${slugify(model)}` : `?brand=${brand}`
  return `/products/${query}`
}

export function whatsappUrl(text) {
  return `${wpBaseUrl}?text=${encodeURIComponent(text)}`
}

export function brandLogoText(name) {
  const map = { Tesla: 'TESLA', BYD: 'BYD', Togg: 'TOGG', Chery: 'CHERY', MG: 'MG', Skywell: 'SKYWELL' }
  return map[name] || String(name || '').toUpperCase()
}

function HeaderSearch() {
  function handleSubmit(e) {
    e.preventDefault()
    const value = e.currentTarget.q.value.trim()
    if (value) window.location.href = `/products/?q=${encodeURIComponent(value)}`
  }

  return (
    <form className="siteSearch" onSubmit={handleSubmit}>
      <span>⌕</span>
      <input name="q" placeholder="Parça kodu, ürün, marka veya model ara" autoComplete="off" />
      <button type="submit">Ara</button>
    </form>
  )
}

export function SiteHeader() {
  return (
    <>
      <div className="noticeBar">
        <span>Parça kodu, stok ve araç uyumluluğu sipariş öncesi WhatsApp üzerinden teyit edilir.</span>
        <a href={whatsappUrl('Merhaba, ürün uyumluluğu ve stok hakkında bilgi almak istiyorum.')}>WhatsApp destek: 0507 730 27 03</a>
      </div>
      <header className="siteHeader">
        <a href="/" className="siteLogo"><img src="/logo-new.svg" alt="Paşa Oto Parça" /></a>
        <HeaderSearch />
        <div className="headerActions">
          <a href="/orders">Sipariş Takip</a>
          <a href="/cart/">Sepetim</a>
        </div>
      </header>
      <nav className="desktopNav">
        <div className="megaWrap">
          <a href="/products/" className="allCats">☰ Tüm Kategoriler</a>
          <div className="megaMenu">
            <div className="megaTitle">Marka ve modele göre hızlı seçim</div>
            <div className="megaGrid">
              {brands.map(brand => (
                <div key={brand.slug}>
                  <a className="megaBrand" href={productsUrl(brand.slug)}>{brandLogoText(brand.name)}</a>
                  {brand.models.map(model => <a key={model} href={productsUrl(brand.slug, model)}>{model}</a>)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <a href="/products/">Katalog</a>
        <a href={whatsappUrl('Merhaba, parça kodu ile ürün teyidi almak istiyorum.')}>Parça Kodu Teyidi</a>
        {brands.slice(0, 5).map(brand => <a key={brand.slug} href={productsUrl(brand.slug)}>{brand.name}</a>)}
        <a href={whatsappUrl('Merhaba, ürün siparişi vermek istiyorum.')}>İletişim</a>
      </nav>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="footerBrand">
        <img src="/logo-new.svg" alt="Paşa Oto Parça" />
        <p>Yeni nesil araçlar için parça kodu, marka/model ve stok bilgisiyle hızlı teklif sunan oto yedek parça kataloğu.</p>
      </div>
      <div>
        <h3>Katalog</h3>
        <a href="/products/">Tüm Ürünler</a>
        {brands.slice(0, 4).map(brand => <a key={brand.slug} href={productsUrl(brand.slug)}>{brand.name}</a>)}
      </div>
      <div>
        <h3>Destek</h3>
        <a href={whatsappUrl('Merhaba, ürün uyumluluğu hakkında bilgi almak istiyorum.')}>WhatsApp Destek</a>
        <a href={whatsappUrl('Merhaba, parça kodu ile ürün teyidi almak istiyorum.')}>Parça Kodu Teyidi</a>
        <a href="/orders">Sipariş Takip</a>
        <a href="/cart/">Sepetim</a>
      </div>
      <div>
        <h3>Güven</h3>
        <span>Stok teyidi</span>
        <span>Parça kodu kontrolü</span>
        <span>Kargo bilgilendirme</span>
        <span>WhatsApp üzerinden net teklif</span>
      </div>
    </footer>
  )
}

export function BottomNav() {
  const router = useRouter()
  const active = path => router.pathname === path || (path === '/products/' && router.pathname.startsWith('/product'))
  return (
    <nav className="bottomNav">
      <a className={active('/') ? 'active' : ''} href="/"><b>⌂</b><span>Ana Sayfa</span></a>
      <a className={active('/products/') ? 'active' : ''} href="/products/"><b>▦</b><span>Katalog</span></a>
      <a href={whatsappUrl('Merhaba, parça kodu ile ürün teyidi almak istiyorum.')}><b>✓</b><span>Teyit</span></a>
      <a className={active('/cart/') ? 'active' : ''} href="/cart/"><b>●</b><span>Sepet</span></a>
    </nav>
  )
}

export function SiteLayout({ children }) {
  return (
    <main className="sitePage">
      <SiteHeader />
      {children}
      <SiteFooter />
      <BottomNav />
      <style jsx global>{`
        *{box-sizing:border-box}body{margin:0}.sitePage{min-height:100vh;background:#f5f6f8;color:#252733;font-family:Inter,Arial,sans-serif;overflow-x:hidden}a{color:inherit;text-decoration:none}.noticeBar{display:flex;justify-content:space-between;gap:16px;background:#141820;color:#fff;padding:10px 56px;font-size:13px}.noticeBar a{font-weight:900;color:#fff}.siteHeader{position:sticky;top:0;z-index:40;display:grid;grid-template-columns:190px 1fr auto;align-items:center;gap:24px;background:rgba(255,255,255,.94);border-bottom:1px solid #e8eaf0;padding:14px 56px;backdrop-filter:blur(18px)}.siteLogo img{width:165px;height:72px;object-fit:contain;display:block}.siteSearch{height:52px;border:1px solid #e1e4ea;border-radius:18px;background:#f7f8fa;display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:8px;padding:0 7px 0 16px}.siteSearch span{font-size:22px;color:#8a8f9b}.siteSearch input{width:100%;border:0;outline:0;background:transparent;font:inherit;color:#252733}.siteSearch button{height:40px;border:0;border-radius:14px;background:#f32334;color:#fff;font-weight:900;padding:0 18px;cursor:pointer}.headerActions{display:flex;gap:10px}.headerActions a{background:#151821;color:#fff;border-radius:999px;padding:12px 16px;font-weight:900;font-size:14px}.desktopNav{height:56px;background:#fff;border-bottom:1px solid #e8eaf0;display:flex;align-items:center;gap:20px;padding:0 56px;white-space:nowrap;font-weight:850;font-size:14px;position:relative;z-index:30}.desktopNav>a,.allCats{height:56px;display:flex;align-items:center}.allCats{color:#f32334}.megaWrap{position:relative}.megaMenu{position:absolute;left:0;top:56px;width:min(940px,calc(100vw - 40px));background:#fff;border:1px solid #e5e7ee;border-radius:0 0 28px 28px;padding:22px;box-shadow:0 28px 80px rgba(31,35,45,.14);opacity:0;pointer-events:none;transform:translateY(8px);transition:.18s}.megaWrap:hover .megaMenu{opacity:1;pointer-events:auto;transform:translateY(0)}.megaTitle{font-size:13px;color:#7b808c;margin-bottom:14px}.megaGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.megaGrid>div{background:#f7f8fa;border-radius:20px;padding:16px;display:grid;gap:9px}.megaGrid a{color:#555b67;font-weight:750}.megaBrand{font-size:18px!important;color:#252733!important;font-weight:950!important}.siteFooter{max-width:1220px;margin:36px auto 0;padding:36px 56px 110px;display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:22px;color:#555b67}.siteFooter>div{background:#fff;border:1px solid #e8eaf0;border-radius:28px;padding:24px;box-shadow:0 22px 60px rgba(31,35,45,.05)}.siteFooter img{width:150px;height:72px;object-fit:contain}.siteFooter h3{margin:0 0 14px;color:#252733}.siteFooter a,.siteFooter span{display:block;margin:10px 0;color:#555b67;font-weight:750}.siteFooter p{line-height:1.65}.bottomNav{display:none}.trustBadges{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.trustBadges>div{background:#fff;border:1px solid #e8eaf0;border-radius:22px;padding:18px;box-shadow:0 20px 54px rgba(31,35,45,.045)}.trustBadges strong{display:block;color:#252733;margin-bottom:7px}.trustBadges span{color:#6f7480;font-size:14px;line-height:1.5}@media(max-width:920px){.noticeBar{display:none}.siteHeader{position:sticky;grid-template-columns:1fr;padding:12px 16px;gap:10px}.siteLogo img{width:136px;height:58px;margin:0 auto}.headerActions{display:none}.siteSearch{height:48px;border-radius:16px}.desktopNav{display:none}.siteFooter{grid-template-columns:1fr;padding:18px 16px 104px;margin-top:18px}.siteFooter>div{border-radius:24px}.bottomNav{position:fixed;left:16px;right:16px;bottom:14px;z-index:80;height:64px;background:rgba(255,255,255,.95);backdrop-filter:blur(18px);border-radius:24px;box-shadow:0 18px 46px rgba(31,35,45,.18);display:grid;grid-template-columns:repeat(4,1fr);align-items:center}.bottomNav a{display:grid;gap:1px;place-items:center;color:#a4a7af;font-weight:850}.bottomNav a b{font-size:18px}.bottomNav span{font-size:11px}.bottomNav .active{color:#f32334}.trustBadges{grid-template-columns:1fr}}
      `}</style>
    </main>
  )
}

export default SiteLayout