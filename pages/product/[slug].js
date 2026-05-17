import { useState } from 'react'
import products from '../../data/products.json'
import SiteLayout, { cleanImagePath, productCode, productSlug, salePrice, whatsappUrl } from '../../components/SiteLayout'

export async function getStaticPaths() {
  return {
    paths: products.map(product => ({ params: { slug: productSlug(product) } })),
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const product = products.find(item => productSlug(item) === params.slug) || null
  const relatedProducts = product
    ? products
        .filter(item => item !== product && (item.category === product.category || item.brand === product.brand))
        .filter(item => item.image && item.title)
        .slice(0, 4)
    : []

  return { props: { product, relatedProducts } }
}

function addToCart(product, setToast) {
  if (typeof window === 'undefined') return
  const item = {
    id: `${product.no || product.id || productCode(product)}`,
    title: product.title,
    code: productCode(product),
    price: salePrice(product, 2),
    image: cleanImagePath(product.image),
    category: product.category || 'Diğer',
    qty: 1
  }
  const current = JSON.parse(localStorage.getItem('pasaCart') || '[]')
  const existing = current.find(cartItem => cartItem.id === item.id)
  const next = existing
    ? current.map(cartItem => cartItem.id === item.id ? { ...cartItem, qty: (cartItem.qty || 1) + 1 } : cartItem)
    : [...current, item]
  localStorage.setItem('pasaCart', JSON.stringify(next))
  window.dispatchEvent(new Event('cart-updated'))
  setToast('Ürün sepete eklendi.')
  window.setTimeout(() => setToast(''), 2400)
}

export default function ProductDetailPage({ product, relatedProducts }) {
  const [toast, setToast] = useState('')
  if (!product) return null

  const image = cleanImagePath(product.image)
  const code = productCode(product)
  const price = salePrice(product, 2)
  const brand = product.brand || 'Paşa Oto Parça'
  const model = product.model || ''
  const message = `Merhaba, bu ürünü sipariş vermek istiyorum:\n\nÜrün: ${product.title}\nKod: ${code}\nFiyat: ${price}\nKategori: ${product.category || 'Diğer'}\nStok: Stokta\nKargo: 2 gün içinde kargoda`
  const wp = whatsappUrl(message)

  return (
    <SiteLayout>
      <section className="breadcrumb">
        <a href="/">Ana Sayfa</a><span>/</span><a href="/products/">Katalog</a><span>/</span><b>{product.category || 'Ürün'}</b>
      </section>

      <section className="detail">
        <div className="imageCard"><img src={image} alt={product.title} /></div>
        <div className="infoCard">
          <div className="pillRow"><span>{brand}</span>{model ? <span>{model}</span> : null}<span>{product.category || 'Diğer'}</span></div>
          <h1>{product.title}</h1>
          <p className="desc">Stoktaki ürünler için WhatsApp üzerinden hızlı sipariş verebilirsiniz.</p>
          <div className="price">{price}</div>
          <div className="specs">
            <div><span>Ürün Kodu</span><strong>{code}</strong></div>
            <div><span>Kategori</span><strong>{product.category || 'Diğer'}</strong></div>
            <div><span>Stok</span><strong>Stokta</strong></div>
            <div><span>Kargo</span><strong>2 gün içinde kargoda</strong></div>
          </div>
          <div className="actions">
            <a href={wp} target="_blank" rel="noreferrer" className="primary">WhatsApp ile Sipariş Ver</a>
            <button className="secondary" type="button" onClick={() => addToCart(product, setToast)}>Sepete Ekle</button>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="related">
          <div className="sectionHead"><div><span>BENZER ÜRÜNLER</span><h2>İlgili parçalar</h2></div><a href="/products/">Tümünü Gör</a></div>
          <div className="relatedGrid">
            {relatedProducts.map(item => {
              const url = `/product/${productSlug(item)}`
              return <article key={`${item.no || item.id}-${productCode(item)}`} className="card">
                <a href={url} className="cardImg"><img src={cleanImagePath(item.image)} alt={item.title} /></a>
                <div><span>{item.category || 'Diğer'}</span><a href={url}><h3>{item.title}</h3></a><p>Ref: {productCode(item)}</p><strong>{salePrice(item)}</strong></div>
              </article>
            })}
          </div>
        </section>
      ) : null}

      <div className="stickyBuy"><strong>{price}</strong><a href={wp} target="_blank" rel="noreferrer">WhatsApp Sipariş</a></div>
      {toast ? <div className="toast"><span>{toast}</span><a href="/cart/">Sepete Git</a></div> : null}

      <style jsx>{`
        .breadcrumb{max-width:1220px;margin:0 auto;padding:24px 56px 0;display:flex;gap:9px;align-items:center;color:#727784;font-size:14px}.breadcrumb a{font-weight:800}.breadcrumb b{color:#252733}.detail{max-width:1220px;margin:0 auto;padding:28px 56px 72px;display:grid;grid-template-columns:minmax(320px,.9fr) minmax(420px,1.1fr);gap:28px;align-items:start}.imageCard,.infoCard{background:#fff;border:1px solid #e8eaf0;border-radius:34px;box-shadow:0 28px 80px rgba(31,35,45,.07)}.imageCard{min-height:520px;padding:34px;display:grid;place-items:center}.imageCard img{max-width:100%;max-height:500px;object-fit:contain}.infoCard{padding:34px}.pillRow{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:18px}.pillRow span{background:#f1f3f6;border-radius:999px;padding:9px 13px;color:#555b67;font-size:13px;font-weight:900}.infoCard h1{font-size:clamp(32px,4.4vw,54px);line-height:1.04;letter-spacing:-2px;margin:0 0 16px;color:#252733}.desc{color:#6f7480;line-height:1.7;font-size:17px;margin:0 0 22px}.price{font-size:36px;font-weight:950;color:#f32334;margin-bottom:22px}.specs{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.specs div{background:#f7f8fa;border-radius:20px;padding:17px}.specs span{display:block;color:#858a95;font-size:12px;margin-bottom:8px}.specs strong{display:block;overflow-wrap:anywhere;color:#252733}.actions{display:grid;grid-template-columns:1.35fr .85fr;gap:12px;margin-top:24px}.primary,.secondary{min-height:56px;border:0;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:950;font-size:15px}.primary{background:#25D366;color:#071b0d}.secondary{background:#151821;color:#fff;cursor:pointer}.related{max-width:1220px;margin:0 auto;padding:10px 56px 34px}.sectionHead{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:20px}.sectionHead span{color:#f32334;font-size:12px;font-weight:950;letter-spacing:1.4px}.sectionHead h2{font-size:clamp(30px,4vw,44px);line-height:1;margin:8px 0 0;letter-spacing:-1.5px}.sectionHead>a{background:#fff;border:1px solid #e1e4ea;border-radius:999px;padding:13px 18px;font-weight:900}.relatedGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.card{background:#fff;border:1px solid #e8eaf0;border-radius:26px;overflow:hidden;box-shadow:0 22px 65px rgba(31,35,45,.05)}.cardImg{height:190px;background:#f7f8fa;display:grid;place-items:center;padding:18px}.cardImg img{max-width:100%;max-height:100%;object-fit:contain}.card>div{padding:16px}.card span{color:#f32334;font-size:12px;font-weight:900}.card h3{font-size:16px;line-height:1.35;min-height:44px;margin:8px 0}.card p{color:#777;margin:0 0 10px;font-size:13px;overflow-wrap:anywhere}.card strong{color:#f32334;font-size:18px}.stickyBuy{display:none}.toast{position:fixed;right:22px;bottom:24px;z-index:120;background:#151821;color:#fff;border-radius:22px;padding:14px 16px;display:flex;gap:14px;align-items:center;box-shadow:0 20px 54px rgba(31,35,45,.22)}.toast a{background:#25D366;color:#071b0d;border-radius:999px;padding:10px 13px;font-weight:950}@media(max-width:860px){.breadcrumb{padding:18px 16px 0;overflow-x:auto;white-space:nowrap}.detail{grid-template-columns:1fr;padding:18px 16px 120px;gap:16px}.imageCard{min-height:320px;border-radius:28px;padding:24px}.imageCard img{max-height:285px}.infoCard{border-radius:28px;padding:22px}.infoCard h1{font-size:31px;letter-spacing:-1.2px}.price{font-size:30px}.specs{grid-template-columns:1fr}.actions{grid-template-columns:1fr}.related{padding:4px 16px 22px}.sectionHead{align-items:flex-start;flex-direction:column}.sectionHead>a{width:100%;text-align:center}.relatedGrid{grid-template-columns:1fr}.stickyBuy{position:fixed;left:16px;right:16px;bottom:88px;z-index:70;background:#151821;color:#fff;border-radius:22px;padding:12px;display:grid;grid-template-columns:1fr 1.1fr;gap:10px;align-items:center;box-shadow:0 18px 46px rgba(31,35,45,.2)}.stickyBuy strong{padding-left:6px;color:#fff;font-size:16px}.stickyBuy a{background:#25D366;color:#071b0d;border-radius:999px;padding:13px 10px;text-align:center;font-weight:950;font-size:13px}.toast{left:16px;right:16px;bottom:164px;justify-content:space-between}}
      `}</style>
    </SiteLayout>
  )
}