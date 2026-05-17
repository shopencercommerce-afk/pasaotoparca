import brands from '../data/brands'
import products from '../data/products.json'
import SiteLayout, { brandLogoText, cleanImagePath, productCode, productSlug, productsUrl, salePrice, whatsappUrl } from '../components/SiteLayout'

const featuredProducts = products.filter(p => p.image && p.title).slice(0, 8)
const popularBrands = brands.slice(0, 6)
const categories = Array.from(new Set(products.map(p => p.category || 'Diğer'))).slice(0, 8)

const trustItems = [
  ['Parça Kodu ile Teyit', 'Yanlış ürün riskini azaltmak için sipariş öncesi ürün kodu kontrolü.'],
  ['WhatsApp Destek', 'Sipariş öncesi hızlı uyumluluk ve stok bilgisi alın.'],
  ['Yeni Nesil Araçlar', 'Tesla, BYD, Togg, MG, Chery ve Skywell odaklı katalog.'],
  ['Kargo Bilgilendirme', 'Sipariş sonrası teslimat süreci WhatsApp üzerinden takip edilir.']
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
    </SiteLayout>
  )
}
