import brands from '../data/brands'
import products from '../data/products.json'
import SiteLayout, { brandLogoText, cleanImagePath, productCode, productSlug, productsUrl, salePrice, whatsappUrl } from '../components/SiteLayout'

const featuredProducts = products.filter(p => p.image && p.title).slice(0, 8)
const popularBrands = brands.slice(0, 6)
const categories = Array.from(new Set(products.map(p => p.category || 'Diğer'))).slice(0, 8)

const trustItems = [
  ['Stokta Ürünler', 'Ürün kartlarında stok durumu net şekilde gösterilir.'],
  ['2 Gün İçinde Kargo', 'Stoktaki ürünler için hızlı kargo süreci başlatılır.'],
  ['WhatsApp Sipariş', 'Ürünü seçip WhatsApp üzerinden hızlıca sipariş verebilirsiniz.'],
  ['Yeni Nesil Araçlar', 'Tesla, BYD, Togg, MG, Chery ve Skywell odaklı katalog.']
]

export default function Home() {
  return (
    <SiteLayout>
      <section className="hero">
        <div className="heroText">
          <span className="eyebrow">PAŞA OTO PARÇA</span>
          <h1>Elektrikli ve yeni nesil araçlar için güvenilir yedek parça kataloğu</h1>
          <p>Marka, model, kategori veya parça kodu ile arayın. Stoktaki ürünleri WhatsApp üzerinden hızlıca sipariş verebilirsiniz.</p>
          <div className="heroActions">
            <a href="/products/" className="primaryBtn">Kataloğu İncele</a>
            <a href={whatsappUrl('Merhaba, stokta olan ürünler hakkında bilgi almak istiyorum.')} className="secondaryBtn">WhatsApp’tan Sipariş Ver</a>
          </div>
        </div>
        <div className="heroPanel">
          <div className="panelHeader"><span>Hızlı marka seçimi</span><strong>EV Parts</strong></div>
          <div className="brandTiles">{popularBrands.map(brand => <a href={productsUrl(brand.slug)} key={brand.slug}>{brandLogoText(brand.name)}<small>{brand.models.length} model</small></a>)}</div>
        </div>
      </section>

      <section className="trustBadges homeTrust">
        {trustItems.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
      </section>

      <section className="section">
        <div className="sectionHead"><div><span>KATEGORİLER</span><h2>En çok aranan parça grupları</h2></div><a href="/products/">Kataloğa git</a></div>
        <div className="categoryGrid">{categories.map(cat => <a href={`/products/?category=${encodeURIComponent(cat)}`} key={cat}>{cat}</a>)}</div>
      </section>

      <section className="section productSection">
        <div className="sectionHead"><div><span>ÖNE ÇIKAN ÜRÜNLER</span><h2>Hızlı sipariş verilebilecek ürünler</h2></div><a href="/products/">Kataloğa git</a></div>
        <div className="productGrid">
          {featuredProducts.map(product => {
            const detailUrl = `/product/${productSlug(product)}`
            return <article className="productCard" key={`${product.no || product.id}-${productCode(product)}`}>
              <a href={detailUrl} className="productImage"><img src={cleanImagePath(product.image)} alt={product.title} /></a>
              <div className="productInfo">
                <span>{product.category || 'Diğer'}</span>
                <a href={detailUrl}><h3>{product.title}</h3></a>
                <p>Ref: {productCode(product)}</p>
                <div className="miniBadges"><small>Stokta</small><small>2 gün içinde kargoda</small></div>
                <strong>{salePrice(product)}</strong>
                <a href={whatsappUrl(`Merhaba, ${product.title} ürünü için sipariş vermek istiyorum.`)} className="quoteBtn">WP Sipariş Ver</a>
              </div>
            </article>
          })}
        </div>
      </section>

      <section className="ctaBand"><div><span>HIZLI SİPARİŞ</span><h2>Doğru parçayı hızlıca sipariş verin.</h2><p>Parça kodu veya araç modelinizi WhatsApp’tan gönderin. Stoktaki ürünler için hızlı sipariş sürecini başlatalım.</p></div><a href={whatsappUrl('Merhaba, ürün siparişi vermek istiyorum.')}>WhatsApp’tan Yaz</a></section>

      <style jsx>{`
        .hero{max-width:1320px;margin:0 auto;padding:64px 56px 46px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:44px;align-items:center}.eyebrow,.sectionHead span,.ctaBand span{color:#f32334;font-size:12px;font-weight:900;letter-spacing:1.4px}.hero h1{font-size:clamp(46px,5.6vw,74px);line-height:.98;letter-spacing:-3px;margin:14px 0 22px}.hero p{color:#5c6470;font-size:18px;line-height:1.75;max-width:610px;margin:0}.heroActions{display:flex;gap:14px;flex-wrap:wrap;margin-top:32px}.primaryBtn,.secondaryBtn{min-height:54px;display:inline-flex;align-items:center;justify-content:center;padding:0 26px;border-radius:999px;font-weight:900}.primaryBtn{background:#151821;color:#fff;box-shadow:0 18px 44px rgba(0,0,0,.16)}.secondaryBtn{background:#25D366;color:#071b0d}.heroPanel{background:#fff;border:1px solid #e4e7ee;border-radius:34px;padding:24px;box-shadow:0 34px 90px rgba(31,35,45,.08)}.panelHeader{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.panelHeader span{color:#777}.panelHeader strong{background:#151821;color:#fff;border-radius:999px;padding:9px 13px}.brandTiles{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.brandTiles a{background:#f5f6f8;border:1px solid #e6e9f0;border-radius:18px;padding:20px;font-weight:900;text-align:center}.brandTiles small{display:block;margin-top:6px;color:#7b808c}.homeTrust{max-width:1210px;margin:0 auto;padding:0 56px}.section{max-width:1320px;margin:0 auto;padding:64px 56px 0}.sectionHead{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}.sectionHead h2{font-size:clamp(32px,4vw,48px);line-height:1;margin:8px 0 0;letter-spacing:-1.7px}.sectionHead>a{background:#fff;border:1px solid #e1e4ea;border-radius:999px;padding:13px 18px;font-weight:900}.categoryGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.categoryGrid a{background:#fff;border:1px solid #e6e9f0;border-radius:24px;padding:22px;font-weight:900;text-align:left;box-shadow:0 20px 62px rgba(31,35,45,.045)}.productGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.productCard{background:#fff;border:1px solid #e6e9f0;border-radius:26px;overflow:hidden;box-shadow:0 22px 70px rgba(31,35,45,.055)}.productImage{height:210px;background:#f7f8fa;display:grid;place-items:center;padding:18px}.productImage img{max-width:100%;max-height:100%;object-fit:contain}.productInfo{padding:18px}.productInfo span{color:#f32334;font-size:12px;font-weight:900}.productInfo h3{font-size:16px;line-height:1.35;min-height:44px;margin:8px 0 10px}.productInfo p{color:#777;font-size:13px;margin:0 0 12px;overflow-wrap:anywhere}.productInfo strong{display:block;color:#f32334;font-size:20px;margin-bottom:14px}.miniBadges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.miniBadges small{background:#eef8f1;border-radius:999px;padding:6px 10px;color:#156b2f;font-weight:900}.quoteBtn{display:inline-flex;background:#25D366;color:#071b0d;border-radius:999px;padding:11px 16px;font-weight:900;font-size:13px}.ctaBand{max-width:1210px;margin:74px auto 42px;background:#151821;color:#fff;border-radius:34px;padding:42px 46px;display:flex;align-items:center;justify-content:space-between;gap:26px;box-shadow:0 36px 90px rgba(0,0,0,.18)}.ctaBand h2{font-size:clamp(30px,4vw,48px);letter-spacing:-1.4px;margin:10px 0}.ctaBand p{color:#cfd3dc;line-height:1.6;margin:0;max-width:680px}.ctaBand a{background:#25D366;color:#071b0d;border-radius:999px;padding:16px 24px;font-weight:900;white-space:nowrap}@media(max-width:980px){.hero{grid-template-columns:1fr;padding:38px 16px 28px;gap:24px}.hero h1{font-size:39px;letter-spacing:-2px}.hero p{font-size:16px}.primaryBtn,.secondaryBtn{width:100%}.heroPanel{border-radius:26px;padding:18px}.homeTrust{padding:0 16px}.section{padding:46px 16px 0}.sectionHead{align-items:flex-start;flex-direction:column}.sectionHead>a{width:100%;text-align:center}.categoryGrid{grid-template-columns:repeat(2,1fr)}.productGrid{grid-template-columns:1fr}.ctaBand{margin:48px 16px 22px;padding:28px;flex-direction:column;align-items:flex-start}.ctaBand a{width:100%;text-align:center}}@media(max-width:420px){.hero{padding:26px 14px 22px}.hero h1{font-size:34px}.heroPanel{padding:14px}.brandTiles a{padding:16px 10px}.categoryGrid{grid-template-columns:1fr}.section{padding:38px 14px 0}.sectionHead h2{font-size:30px}.ctaBand{margin-left:14px;margin-right:14px}}
      `}</style>
    </SiteLayout>
  )
}
