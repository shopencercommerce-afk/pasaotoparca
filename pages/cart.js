import { useEffect, useMemo, useState } from 'react'

const whatsappNumber = '905077302703'

function parsePrice(value) {
  if (!value) return 0
  return Number(String(value).replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(value)
}

export default function CartPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const load = () => {
      const cart = JSON.parse(localStorage.getItem('pasaCart') || '[]')
      setItems(cart)
    }
    load()
    window.addEventListener('cart-updated', load)
    return () => window.removeEventListener('cart-updated', load)
  }, [])

  const total = useMemo(() => items.reduce((sum, item) => sum + parsePrice(item.price) * (item.qty || 1), 0), [items])

  function removeItem(id) {
    const next = items.filter(item => item.id !== id)
    localStorage.setItem('pasaCart', JSON.stringify(next))
    setItems(next)
    window.dispatchEvent(new Event('cart-updated'))
  }

  const message = encodeURIComponent(
    items.length === 0
      ? 'Merhaba, sepetim hakkında bilgi almak istiyorum.'
      : `Merhaba, aşağıdaki ürünleri sipariş vermek istiyorum:\n\n${items.map(item => `• ${item.title} (${item.code}) x${item.qty || 1} - ${item.price}`).join('\n')}\n\nToplam: ${formatPrice(total)}`
  )

  return (
    <main className="page">
      <header className="header">
        <a href="/" className="brand"><img src="/logo.svg" alt="Paşa Oto Parça" />Paşa Oto Parça</a>
        <div className="actions">
          <a href="/products/">Ürünlere Dön</a>
          <a href="/account">Hesabım</a>
        </div>
      </header>

      <section className="hero">
        <span>SEPETİM</span>
        <h1>Alışveriş Sepeti</h1>
        <p>Eklediğiniz ürünleri inceleyebilir ve WhatsApp üzerinden siparişe dönüştürebilirsiniz.</p>
      </section>

      <section className="layout">
        <div className="items">
          {items.length === 0 ? (
            <div className="empty">
              <strong>Sepetiniz boş.</strong>
              <p>Katalogdan ürün seçerek sepete ekleyebilirsiniz.</p>
              <a href="/products/">Kataloğa Git</a>
            </div>
          ) : items.map(item => (
            <article className="item" key={item.id}>
              <div className="imgBox"><img src={item.image} alt={item.title} /></div>
              <div className="info">
                <h2>{item.title}</h2>
                <p>{item.code}</p>
                <strong>{item.price}</strong>
                <span>Adet: {item.qty || 1}</span>
              </div>
              <button onClick={() => removeItem(item.id)}>Sil</button>
            </article>
          ))}
        </div>

        <aside className="summary">
          <span>SEPET ÖZETİ</span>
          <h2>{items.length} ürün</h2>
          <div className="total">{formatPrice(total)}</div>
          <a href={`https://wa.me/${whatsappNumber}?text=${message}`} target="_blank" rel="noreferrer">WhatsApp ile Sipariş Ver</a>
        </aside>
      </section>

      <style jsx>{`
        *{box-sizing:border-box}.page{min-height:100vh;background:#f4f2ee;color:#111;font-family:Arial,sans-serif}.header{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:18px 54px;background:rgba(255,255,255,.92);border-bottom:1px solid rgba(0,0,0,.08);position:sticky;top:0;z-index:10;backdrop-filter:blur(18px)}.brand{display:flex;align-items:center;gap:12px;color:#111;text-decoration:none;font-size:24px;font-weight:900}.brand img{width:140px;height:64px;object-fit:contain}.actions{display:flex;gap:10px;flex-wrap:wrap}.actions a{background:#fff;border:1px solid rgba(0,0,0,.08);padding:12px 16px;border-radius:999px;font-weight:800;color:#111;text-decoration:none}.hero{max-width:1240px;margin:0 auto;padding:60px 54px 20px}.hero span,.summary span{color:#b3141b;font-size:12px;font-weight:900;letter-spacing:1.4px}.hero h1{font-size:clamp(44px,7vw,78px);line-height:.95;letter-spacing:-3px;margin:14px 0}.hero p{max-width:620px;color:#666;font-size:18px;line-height:1.7;margin:0}.layout{max-width:1240px;margin:0 auto;padding:18px 54px 90px;display:grid;grid-template-columns:1fr 340px;gap:22px;align-items:start}.items{display:grid;gap:16px}.item{background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:28px;padding:18px;display:grid;grid-template-columns:150px 1fr auto;gap:18px;align-items:center;box-shadow:0 24px 80px rgba(0,0,0,.05)}.imgBox{height:140px;background:#f5f5f5;border-radius:22px;display:grid;place-items:center;padding:14px}.imgBox img{max-width:100%;max-height:100%;object-fit:contain}.info h2{margin:0 0 10px;font-size:22px;line-height:1.25}.info p{margin:0 0 10px;color:#777}.info strong{display:block;font-size:24px;color:#b3141b;margin-bottom:8px}.info span{color:#555}.item button{border:0;background:#111;color:#fff;border-radius:999px;padding:12px 18px;font-weight:800;cursor:pointer}.summary{position:sticky;top:110px;background:#111;color:#fff;border-radius:30px;padding:28px;box-shadow:0 34px 90px rgba(0,0,0,.16)}.summary h2{font-size:34px;margin:10px 0 18px}.total{font-size:42px;font-weight:900;margin-bottom:24px}.summary a,.empty a{display:inline-flex;justify-content:center;align-items:center;background:#25D366;color:#071b0d;border-radius:999px;padding:16px 22px;font-weight:900;text-decoration:none;width:100%}.empty{background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:30px;padding:34px;box-shadow:0 24px 80px rgba(0,0,0,.05)}.empty strong{display:block;font-size:28px;margin-bottom:10px}.empty p{color:#666;line-height:1.6;margin-bottom:22px}@media(max-width:900px){.header{padding:14px 16px;flex-direction:column;align-items:stretch}.brand{font-size:20px}.brand img{width:120px;height:56px;margin:0 auto}.actions a{flex:1;text-align:center}.hero{padding:42px 16px 18px}.hero h1{font-size:44px;letter-spacing:-2px}.hero p{font-size:16px}.layout{grid-template-columns:1fr;padding:16px 16px 90px}.item{grid-template-columns:1fr;gap:14px}.imgBox{height:190px}.summary{position:relative;top:auto}.total{font-size:34px}}
      `}</style>
    </main>
  )
}
