import { useEffect, useState } from 'react'

export default function App({ Component, pageProps }) {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('pasaCart') || '[]')
        const count = cart.reduce((total, item) => total + (item.qty || 1), 0)
        setCartCount(count)
      } catch {
        setCartCount(0)
      }
    }

    updateCartCount()
    window.addEventListener('cart-updated', updateCartCount)
    window.addEventListener('storage', updateCartCount)
    return () => {
      window.removeEventListener('cart-updated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  return (
    <>
      <Component {...pageProps} />
      <div className="quickUserNav">
        <a href="/account" className="quickUserNavItem">Hesabım</a>
        <a href="/cart/" className="quickUserNavItem cartItem">Sepetim <strong>{cartCount}</strong></a>
      </div>
      <style jsx global>{`
        .quickUserNav {
          position: fixed;
          right: 22px;
          top: 96px;
          z-index: 9999;
          display: flex;
          gap: 8px;
          align-items: center;
          pointer-events: auto;
        }
        .quickUserNavItem {
          background: rgba(17, 17, 17, 0.92);
          color: #fff !important;
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 999px;
          padding: 11px 15px;
          font-family: Arial, sans-serif;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none !important;
          box-shadow: 0 14px 38px rgba(0,0,0,.18);
          backdrop-filter: blur(12px);
        }
        .quickUserNavItem strong {
          display: inline-grid;
          place-items: center;
          min-width: 21px;
          height: 21px;
          margin-left: 6px;
          border-radius: 50%;
          background: #25D366;
          color: #071b0d;
          font-size: 12px;
        }
        @media (max-width: 760px) {
          .quickUserNav {
            top: auto;
            right: 12px;
            left: 12px;
            bottom: 76px;
            justify-content: center;
          }
          .quickUserNavItem {
            flex: 1;
            text-align: center;
            padding: 12px 14px;
          }
        }
      `}</style>
    </>
  )
}
