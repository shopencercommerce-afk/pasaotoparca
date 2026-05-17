import { useState } from 'react'
import brands from '../data/brands'
import products from '../data/products.json'

const wpUrl = 'https://wa.me/905077302703?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9-]+/g, '')
}

function productsUrl(brand, model) {
  const query = model ? `?brand=${brand}&model=${slugify(model)}` : `?brand=${brand}`
  return `/products/${query}`
}

function productCode(product) {
  return product.sku || product.refNo || product.internalCode || `urun-${product.id || product.no}`
}

function productSlug(product) {
  return `${slugify(productCode(product))}-${product.id || product.no || slugify(product.title)}`
}

function cleanImagePath(image) {
  if (!image) return '/logo-new.svg'
  const normalized = String(image).replace(/\\/g, '/')
  if (normalized === '/logo.svg' || normalized === 'logo.svg') return '/logo-new.svg'
  if (normalized.startsWith('/')) return normalized
  return '/' + normalized.replace(/^images\//, 'images/')
}

function parsePrice(priceText) {
  if (!priceText) return 0
  return Number(String(priceText).replace(/₺/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
}

function salePrice(product) {
  if (product.price) return formatPrice(Number(product.price))
  const cost = parsePrice(product.price3 || product.price2 || product.price1)
  if (!cost) return 'Fiyat sorunuz'
  if (cost <= 1000) return formatPrice(cost * 2)
  if (cost <= 10000) return formatPrice(cost * 1.5)
  return formatPrice(cost * 1.25)
}

const featuredProducts = products.filter(p => p.image && p.title).slice(0, 8)
const popularBrands = brands.slice(0, 6)

const trustItems = [
  ['Parça Kodu ile Teyit', 'Yanlış ürün riskini azaltmak için ürün kodu ile kontrol.'],
  ['WhatsApp Destek', 'Sipariş öncesi hızlı uyumluluk ve stok bilgisi.'],
  ['Yeni Nesil Araçlar', 'Tesla, BYD, Togg, MG, Chery ve Skywell odaklı katalog.'],
  ['Kargo Bilgilendirme', 'Sipariş sonrası teslimat süreci WhatsApp üzerinden takip.']
]

export default function Home() {
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const value = search.trim()
    if (!value) return
    window.location.href = `/products/?q=${encodeURIComponent(value)}`
  }

  return (
    <main className="page">
      <div className="topNotice">
        <span>Elektrikli ve yeni nesil araç yedek parçalarında hızlı teklif</span>
        <a href={wpUrl}>WhatsApp destek: 0507 730 27 03</a>
      </div>

      <header className="header">
        <a href="/" className="logoWrap"><img src="/logo-new.svg" alt="Paşa Oto Parça" /></a>
        <form className="searchBox" onSubmit={handleSearch}>
          <input type="text" placeholder="Ürün adı, parça kodu veya araç modeli ara" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit">⌕</button>
        </form>
        <div className="userLinks">
          <a href="/account">Hesabım</a>
          <a href="/cart/">Sepetim</a>
        </div>
      </header>

      <nav className="navBar">
        <a href="/products/" className="allCat">☰ Tüm Kategoriler</a>
        <a href="/products/">Katalog</a>
        {popularBrands.map(brand => <a key={brand.slug} href={productsUrl(brand.slug)}>{brand.name}</a>)}
        <a href={wpUrl}>İletişim</a>
      </nav>

      <section className="hero">
        <div className="heroText">
          <span className="eyebrow">PAŞA OTO PARÇA</span>
          <h1>Yeni nesil araçlar için güvenilir yedek parça kataloğu</h1>
          <p>Marka ve modele göre ürünleri inceleyin, parça koduyla hızlı teklif alın. Sipariş öncesi uyumluluk kontrolü için WhatsApp destek hattımıza yazabilirsiniz.</p>
          <div className="heroActions">
            <a href="/products/" className="primaryBtn">Kataloğu İncele</a>
            <a href={wpUrl} className="secondaryBtn">WhatsApp’tan Teklif Al</a>
          </div>
        </div>
        <div className="heroPanel">
          <div className="panelHeader"><span>Öne çıkan markalar</span><strong>EV Parts</strong></div>
          <div className="brandTiles">{popularBrands.map(brand => <a href={productsUrl(brand.slug)} key={brand.slug}>{brand.name}</a>)}</div>
          <div className="panelBottom"><img src="/logo-new.svg" alt="Paşa Oto Parça" /></div>
        </div>
      </section>

      <section className="trustStrip">
        {trustItems.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
      </section>

      <section className="section">
        <div className="sectionHead">
          <div><span>MARKA SEÇİMİ</span><h2>Aracınıza uygun parçaları bulun</h2></div>
          <a href="/products/">Tüm ürünleri gör</a>
        </div>
        <div className="brandGrid">
          {brands.map(brand => <a className="brandCard" href={productsUrl(brand.slug)} key={brand.slug}><div>{brand.name.charAt(0)}</div><strong>{brand.name}</strong><span>{brand.models.length} model</span></a>)}
        </div>
      </section>

      <section className="section productSection">
        <div className="sectionHead">
          <div><span>VİTRİN</span><h2>Öne çıkan ürünler</h2></div>
          <a href="/products/">Kataloğa git</a>
        </div>
        <div className="productGrid">
          {featuredProducts.map(product => {
            const detailUrl = `/product/${productSlug(product)}`
            return <article className="productCard" key={`${product.no || product.id}-${productCode(product)}`}>
              <a href={detailUrl} className="productImage"><img src={cleanImagePath(product.image)} alt={product.title} /></a>
              <div className="productInfo"><a href={detailUrl}><h3>{product.title}</h3></a><p>{productCode(product)}</p><strong>{salePrice(product)}</strong><a href={wpUrl} className="quoteBtn">Teklif Al</a></div>
            </article>
          })}
        </div>
      </section>

      <section className="ctaBand">
        <div><span>PARÇA KODUNUZ VAR MI?</span><h2>Doğru parçayı birlikte teyit edelim.</h2><p>Parça kodu, araç modeli veya şase bilginizi WhatsApp’tan gönderin. Size uygun ürünü hızlıca netleştirelim.</p></div>
        <a href={wpUrl}>WhatsApp’tan Yaz</a>
      </section>

      <a href={wpUrl} className="floatingWp">WhatsApp</a>

      <style jsx>{`
        *{box-sizing:border-box}.page{min-height:100vh;background:#f5f5f3;color:#111;font-family:Arial,sans-serif;overflow-x:hidden}a{color:inherit;text-decoration:none}.topNotice{display:flex;justify-content:space-between;gap:18px;background:#111;color:#fff;padding:10px 56px;font-size:13px}.topNotice a{color:#fff;font-weight:800}.header{display:grid;grid-template-columns:190px 1fr auto;align-items:center;gap:28px;background:#fff;padding:18px 56px;border-bottom:1px solid #e8e8e8}.logoWrap img{width:165px;height:78px;object-fit:contain;display:block}.searchBox{height:54px;border:1px solid #dedede;border-radius:14px;background:#fafafa;display:flex;align-items:center;justify-content:space-between;padding:0 6px 0 18px;color:#777}.searchBox input{width:100%;border:0;background:transparent;outline:none;font:inherit;color:#111}.searchBox button{width:46px;height:42px;border:0;border-radius:10px;background:#111;color:#fff;font-size:23px;cursor:pointer}.userLinks{display:flex;gap:10px}.userLinks a{background:#111;color:#fff;border-radius:999px;padding:12px 17px;font-weight:900;font-size:14px}.navBar{display:flex;align-items:center;gap:22px;padding:0 56px;height:56px;background:#fff;border-bottom:1px solid #e9e9e9;white-space:nowrap;overflow-x:auto;font-weight:800;font-size:14px}.allCat{color:#b3141b}.hero{max-width:1320px;margin:0 auto;padding:64px 56px 46px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:44px;align-items:center}.eyebrow,.sectionHead span,.ctaBand span{color:#b3141b;font-size:12px;font-weight:900;letter-spacing:1.4px}.hero h1{font-size:clamp(46px,5.6vw,74px);line-height:.98;letter-spacing:-3px;margin:14px 0 22px}.hero p{color:#5c5c5c;font-size:18px;line-height:1.75;max-width:610px;margin:0}.heroActions{display:flex;gap:14px;flex-wrap:wrap;margin-top:32px}.primaryBtn,.secondaryBtn{min-height:54px;display:inline-flex;align-items:center;justify-content:center;padding:0 26px;border-radius:999px;font-weight:900}.primaryBtn{background:#111;color:#fff;box-shadow:0 18px 44px rgba(0,0,0,.16)}.secondaryBtn{background:#fff;border:1px solid #dcdcdc}.heroPanel{background:#fff;border:1px solid #e4e4e4;border-radius:34px;padding:24px;box-shadow:0 34px 90px rgba(0,0,0,.08)}.panelHeader{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.panelHeader span{color:#777}.panelHeader strong{background:#111;color:#fff;border-radius:999px;padding:9px 13px}.brandTiles{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.brandTiles a{background:#f3f3f2;border:1px solid #e6e6e6;border-radius:18px;padding:20px;font-weight:900;text-align:center}.panelBottom{margin-top:18px;background:#f8f8f8;border-radius:24px;padding:20px;display:grid;place-items:center}.panelBottom img{max-width:78%;max-height:210px;object-fit:contain}.trustStrip{max-width:1210px;margin:0 auto;padding:0 56px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.trustStrip div{background:#fff;border:1px solid #e7e7e7;border-radius:22px;padding:20px;box-shadow:0 20px 54px rgba(0,0,0,.045)}.trustStrip strong{display:block;margin-bottom:7px}.trustStrip span{color:#666;font-size:14px;line-height:1.5}.section{max-width:1320px;margin:0 auto;padding:64px 56px 0}.sectionHead{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}.sectionHead h2{font-size:clamp(32px,4vw,48px);line-height:1;margin:8px 0 0;letter-spacing:-1.7px}.sectionHead>a{background:#fff;border:1px solid #ddd;border-radius:999px;padding:13px 18px;font-weight:900}.brandGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}.brandCard{background:#fff;border:1px solid #e6e6e6;border-radius:24px;padding:22px;text-align:center;box-shadow:0 20px 62px rgba(0,0,0,.045)}.brandCard div{width:64px;height:64px;margin:0 auto 14px;border-radius:20px;background:linear-gradient(135deg,#111,#444);color:#fff;display:grid;place-items:center;font-size:30px;font-weight:900}.brandCard strong{display:block;font-size:18px}.brandCard span{display:block;margin-top:6px;color:#777;font-size:13px}.productGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.productCard{background:#fff;border:1px solid #e6e6e6;border-radius:26px;overflow:hidden;box-shadow:0 22px 70px rgba(0,0,0,.055)}.productImage{height:210px;background:#f7f7f7;display:grid;place-items:center;padding:18px}.productImage img{max-width:100%;max-height:100%;object-fit:contain}.productInfo{padding:18px}.productInfo h3{font-size:16px;line-height:1.35;min-height:44px;margin:0 0 10px}.productInfo p{color:#777;font-size:13px;margin:0 0 12px}.productInfo strong{display:block;color:#b3141b;font-size:20px;margin-bottom:14px}.quoteBtn{display:inline-flex;background:#111;color:#fff;border-radius:999px;padding:11px 16px;font-weight:900;font-size:13px}.ctaBand{max-width:1210px;margin:74px auto 90px;background:#111;color:#fff;border-radius:34px;padding:42px 46px;display:flex;align-items:center;justify-content:space-between;gap:26px;box-shadow:0 36px 90px rgba(0,0,0,.18)}.ctaBand h2{font-size:clamp(30px,4vw,48px);letter-spacing:-1.4px;margin:10px 0}.ctaBand p{color:#cfcfcf;line-height:1.6;margin:0;max-width:680px}.ctaBand a{background:#25D366;color:#071b0d;border-radius:999px;padding:16px 24px;font-weight:900;white-space:nowrap}.floatingWp{position:fixed;right:24px;bottom:22px;z-index:50;background:#25D366;color:#fff;border-radius:999px;padding:15px 22px;font-weight:900;box-shadow:0 16px 42px rgba(37,211,102,.34)}@media(max-width:980px){.topNotice{display:none}.header{grid-template-columns:1fr;padding:14px 16px;gap:12px}.logoWrap img{width:140px;height:64px;margin:0 auto}.searchBox{height:48px}.userLinks a{flex:1;text-align:center}.userLinks{width:100%}.navBar{padding:0 16px;gap:14px}.hero{grid-template-columns:1fr;padding:42px 16px 32px;gap:24px}.hero h1{font-size:40px;letter-spacing:-2px}.hero p{font-size:16px}.primaryBtn,.secondaryBtn{width:100%}.heroPanel{border-radius:26px;padding:18px}.trustStrip{padding:0 16px;grid-template-columns:1fr}.section{padding:50px 16px 0}.sectionHead{align-items:flex-start;flex-direction:column}.sectionHead>a{width:100%;text-align:center}.brandGrid{grid-template-columns:repeat(2,1fr);gap:12px}.brandCard{border-radius:20px;padding:18px 12px}.productGrid{grid-template-columns:1fr;gap:14px}.productImage{height:190px}.ctaBand{margin:54px 16px 90px;padding:28px;flex-direction:column;align-items:flex-start;border-radius:26px}.ctaBand a{width:100%;text-align:center}.floatingWp{left:16px;right:16px;bottom:16px;text-align:center}}
      `}</style>
    </main>
  )
}
