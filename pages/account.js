import { useEffect, useState } from 'react'

const whatsappNumber = '905077302703'
const wpUrl = `https://wa.me/${whatsappNumber}`

export default function AccountPage() {
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem('pasaUser') || 'null')
    if (activeUser) setUser(activeUser)
  }, [])

  function submit(e) {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('pasaUsers') || '[]')

    if (mode === 'register') {
      const newUser = { name, email, password }
      localStorage.setItem('pasaUsers', JSON.stringify([...users, newUser]))
      localStorage.setItem('pasaUser', JSON.stringify(newUser))
      setUser(newUser)
      return
    }

    const found = users.find(item => item.email === email && item.password === password)
    if (found) {
      localStorage.setItem('pasaUser', JSON.stringify(found))
      setUser(found)
    }
  }

  function logout() {
    localStorage.removeItem('pasaUser')
    setUser(null)
  }

  return (
    <main className="page">
      <header className="header">
        <a href="/" className="logo"><img src="/logo-new.svg" alt="Paşa Oto Parça" /></a>
        <nav>
          <a href="/">Ana Sayfa</a>
          <a href="/products/">Katalog</a>
          <a href="/cart/">Sepetim</a>
        </nav>
      </header>

      <section className="hero">
        <span>MÜŞTERİ PANELİ</span>
        <h1>{user ? `Merhaba ${user.name}` : 'Hesabım'}</h1>
      </section>

      <section className="container">
        {!user ? (
          <div className="card">
            <div className="tabs">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Giriş Yap</button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Kayıt Ol</button>
            </div>

            <form onSubmit={submit} className="form">
              {mode === 'register' ? <input placeholder="Ad Soyad" value={name} onChange={e => setName(e.target.value)} /> : null}
              <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit">{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</button>
            </form>
          </div>
        ) : (
          <div className="card logged">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <div className="actions">
              <a href="/cart/">Sepete Git</a>
              <a href={`${wpUrl}?text=Merhaba, siparişlerim hakkında bilgi almak istiyorum.`}>WhatsApp Destek</a>
            </div>
            <button className="logout" onClick={logout}>Çıkış Yap</button>
          </div>
        )}
      </section>

      <style jsx>{`
        *{box-sizing:border-box}.page{min-height:100vh;background:#f4f2ee;font-family:Arial,sans-serif}.header{display:flex;justify-content:space-between;align-items:center;padding:18px 54px;background:#fff;border-bottom:1px solid rgba(0,0,0,.08)}.logo img{width:150px;height:70px;object-fit:contain}.hero{max-width:1100px;margin:0 auto;padding:60px 54px 20px}.hero span{color:#b3141b;font-size:12px;font-weight:900;letter-spacing:1.4px}.hero h1{font-size:clamp(42px,6vw,74px);margin:12px 0}.container{max-width:1100px;margin:0 auto;padding:0 54px 80px}.card{background:#fff;border-radius:28px;padding:28px;box-shadow:0 24px 80px rgba(0,0,0,.06)}.tabs{display:flex;gap:10px;margin-bottom:20px}.tabs button{flex:1;border:0;border-radius:16px;padding:14px;font-weight:900;background:#ececec}.tabs .active{background:#111;color:#fff}.form{display:grid;gap:12px}.form input{border:1px solid #ddd;background:#f8f8f8;border-radius:16px;padding:15px}.form button,.logout,.actions a{border:0;border-radius:999px;padding:15px;font-weight:900}.form button{background:#25D366}.logged h2{margin:0 0 8px}.logged p{color:#666}.actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}.actions a{text-align:center;background:#111;color:#fff}.logout{width:100%;background:#f32334;color:#fff}@media(max-width:860px){.header{padding:14px 16px;flex-direction:column;gap:12px}.logo img{width:130px;height:58px}.hero{padding:42px 16px 18px}.container{padding:0 16px 90px}.actions{grid-template-columns:1fr}}
      `}</style>
    </main>
  )
}
