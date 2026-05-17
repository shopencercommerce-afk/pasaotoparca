import { useEffect, useMemo, useState } from 'react'

const whatsappNumber = '905077302703'
const wpBase = `https://wa.me/${whatsappNumber}`
const emptyVehicle = { brand: '', model: '', year: '', plate: '', vin: '' }
const emptyAddress = { title: 'Ev Adresi', city: '', district: '', detail: '' }

function getUsers() {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('pasaUsers') || '[]')
}

function saveUsers(users) {
  localStorage.setItem('pasaUsers', JSON.stringify(users))
}

export default function AccountPage() {
  const [mode, setMode] = useState('login')
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', city: '', district: '', address: '', vehicleBrand: '', vehicleModel: '', vehicleYear: '', plate: '', vin: '' })
  const [vehicle, setVehicle] = useState(emptyVehicle)
  const [address, setAddress] = useState(emptyAddress)
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem('pasaUser') || 'null')
    const cart = JSON.parse(localStorage.getItem('pasaCart') || '[]')
    setCartItems(cart)
    if (activeUser) {
      setUser(activeUser)
      setVehicle(activeUser.vehicle || emptyVehicle)
      setAddress(activeUser.address || emptyAddress)
    }
  }, [])

  function showToast(text) {
    setToast(text)
    window.setTimeout(() => setToast(''), 2600)
  }

  function loginOrRegister(e) {
    e.preventDefault()
    const users = getUsers()

    if (mode === 'register') {
      if (!form.name || !form.phone || !form.email || !form.password || !form.city || !form.district || !form.address) {
        showToast('Lütfen zorunlu alanları doldurun.')
        return
      }
      if (users.find(item => item.email === form.email)) {
        showToast('Bu e-posta ile kayıt var.')
        return
      }

      const newUser = {
        id: Date.now(),
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        createdAt: new Date().toLocaleDateString('tr-TR'),
        vehicle: { brand: form.vehicleBrand, model: form.vehicleModel, year: form.vehicleYear, plate: form.plate, vin: form.vin },
        address: { title: 'Ana Adres', city: form.city, district: form.district, detail: form.address },
        orders: [],
        quotes: []
      }
      saveUsers([...users, newUser])
      localStorage.setItem('pasaUser', JSON.stringify(newUser))
      setUser(newUser)
      setVehicle(newUser.vehicle)
      setAddress(newUser.address)
      showToast('Hesabınız oluşturuldu.')
      return
    }

    const found = users.find(item => item.email === form.email && item.password === form.password)
    if (!found) {
      showToast('E-posta veya şifre hatalı.')
      return
    }
    localStorage.setItem('pasaUser', JSON.stringify(found))
    setUser(found)
    setVehicle(found.vehicle || emptyVehicle)
    setAddress(found.address || emptyAddress)
    showToast('Giriş başarılı.')
  }

  function updateUser(patch) {
    const updated = { ...user, ...patch }
    const users = getUsers().map(item => item.id === user.id ? updated : item)
    saveUsers(users)
    localStorage.setItem('pasaUser', JSON.stringify(updated))
    setUser(updated)
  }

  function saveProfile() {
    updateUser({ vehicle, address })
    showToast('Bilgiler kaydedildi.')
  }

  function createOrderDraft() {
    if (!cartItems.length) return showToast('Sepetiniz boş.')
    const order = { id: `PS-${Date.now()}`, date: new Date().toLocaleDateString('tr-TR'), status: 'WhatsApp sipariş bekliyor', items: cartItems }
    const updatedOrders = [order, ...(user.orders || [])]
    updateUser({ orders: updatedOrders })
    showToast('Sipariş taslağı oluşturuldu.')
  }

  function createQuote() {
    const quote = { id: `TF-${Date.now()}`, date: new Date().toLocaleDateString('tr-TR'), status: 'Cevap bekliyor', vehicle, note: 'Parça ve uyumluluk teklifi' }
    updateUser({ quotes: [quote, ...(user.quotes || [])] })
    showToast('Teklif talebi oluşturuldu.')
  }

  function logout() {
    localStorage.removeItem('pasaUser')
    setUser(null)
    showToast('Çıkış yapıldı.')
  }

  const wpOrderText = useMemo(() => {
    if (!user) return ''
    const items = cartItems.map(item => `• ${item.title} (${item.code}) x${item.qty || 1}`).join('\n') || 'Sepet boş'
    return encodeURIComponent(`Merhaba, sipariş vermek istiyorum.\n\nAd Soyad: ${user.name}\nTelefon: ${user.phone || '-'}\nE-posta: ${user.email}\nAdres: ${address.city || '-'} / ${address.district || '-'} - ${address.detail || '-'}\nAraç: ${vehicle.brand || '-'} ${vehicle.model || '-'} ${vehicle.year || '-'}\nŞase: ${vehicle.vin || '-'}\n\nÜrünler:\n${items}`)
  }, [user, address, vehicle, cartItems])

  return (
    <main className="page">
      <header className="header"><a href="/" className="logo"><img src="/logo-new.svg" alt="Paşa Oto Parça" /></a><nav><a href="/">Ana Sayfa</a><a href="/products/">Katalog</a><a href="/cart/">Sepetim</a></nav></header>
      <section className="hero"><span>MÜŞTERİ PANELİ</span><h1>{user ? `Merhaba ${user.name}` : 'Hesabım'}</h1><p>{user ? 'Profil, araç, adres, sipariş ve teklif bilgilerinizi buradan yönetin.' : 'Siparişlerinizi daha hızlı tamamlamak için giriş yapın veya kayıt olun.'}</p></section>

      {!user ? (
        <section className="authWrap">
          <div className="authCard">
            <div className="tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Giriş Yap</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Kayıt Ol</button></div>
            <form onSubmit={loginOrRegister} className="form">
              {mode === 'register' ? <><input placeholder="Ad Soyad *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /><input placeholder="Telefon *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></> : null}
              <input type="email" placeholder="E-posta *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input type="password" placeholder="Şifre *" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              {mode === 'register' ? <><div className="formTitle">Teslimat Bilgileri</div><input placeholder="İl *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /><input placeholder="İlçe *" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /><textarea placeholder="Açık adres *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /><div className="formTitle">Araç Bilgileri</div><input placeholder="Araç markası" value={form.vehicleBrand} onChange={e => setForm({ ...form, vehicleBrand: e.target.value })} /><input placeholder="Model" value={form.vehicleModel} onChange={e => setForm({ ...form, vehicleModel: e.target.value })} /><input placeholder="Yıl" value={form.vehicleYear} onChange={e => setForm({ ...form, vehicleYear: e.target.value })} /><input placeholder="Plaka" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} /><input placeholder="Şase No" value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} /></> : null}
              <button type="submit">{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}</button>
            </form>
          </div>
        </section>
      ) : (
        <section className="dashboard">
          <aside className="side"><strong>Hesabım</strong><a href="#profile">Profil</a><a href="#vehicle">Araç Bilgilerim</a><a href="#address">Adreslerim</a><a href="#orders">Siparişlerim</a><a href="#quotes">Teklif Taleplerim</a><button onClick={logout}>Çıkış Yap</button></aside>
          <div className="content">
            <section id="profile" className="card"><span>PROFİL</span><h2>Kişisel Bilgiler</h2><div className="infoGrid"><div><small>Ad Soyad</small><b>{user.name}</b></div><div><small>Telefon</small><b>{user.phone || '-'}</b></div><div><small>E-posta</small><b>{user.email}</b></div><div><small>Kayıt Tarihi</small><b>{user.createdAt || '-'}</b></div></div></section>
            <section id="vehicle" className="card"><span>ARAÇ</span><h2>Araç Bilgilerim</h2><div className="editGrid"><input placeholder="Marka" value={vehicle.brand} onChange={e => setVehicle({ ...vehicle, brand: e.target.value })} /><input placeholder="Model" value={vehicle.model} onChange={e => setVehicle({ ...vehicle, model: e.target.value })} /><input placeholder="Yıl" value={vehicle.year} onChange={e => setVehicle({ ...vehicle, year: e.target.value })} /><input placeholder="Plaka" value={vehicle.plate} onChange={e => setVehicle({ ...vehicle, plate: e.target.value })} /><input className="wide" placeholder="Şase No" value={vehicle.vin} onChange={e => setVehicle({ ...vehicle, vin: e.target.value })} /></div></section>
            <section id="address" className="card"><span>ADRES</span><h2>Teslimat Adresim</h2><div className="editGrid"><input placeholder="Adres başlığı" value={address.title} onChange={e => setAddress({ ...address, title: e.target.value })} /><input placeholder="İl" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} /><input placeholder="İlçe" value={address.district} onChange={e => setAddress({ ...address, district: e.target.value })} /><textarea className="wide" placeholder="Açık adres" value={address.detail} onChange={e => setAddress({ ...address, detail: e.target.value })} /></div><button className="save" onClick={saveProfile}>Bilgileri Kaydet</button></section>
            <section id="orders" className="card"><span>SİPARİŞLER</span><h2>Siparişlerim</h2><div className="actionRow"><button onClick={createOrderDraft}>Sepetten Sipariş Taslağı Oluştur</button><a href={`${wpBase}?text=${wpOrderText}`} target="_blank" rel="noreferrer">WhatsApp ile Gönder</a></div>{(user.orders || []).length ? user.orders.map(order => <div className="listItem" key={order.id}><b>{order.id}</b><small>{order.date} • {order.status}</small><p>{order.items.length} ürün</p></div>) : <div className="empty">Henüz kayıtlı sipariş yok. Sepetteki ürünlerle sipariş taslağı oluşturabilirsiniz.</div>}</section>
            <section id="quotes" className="card"><span>TEKLİFLER</span><h2>Teklif Taleplerim</h2><div className="actionRow"><button onClick={createQuote}>Teklif Talebi Oluştur</button><a href={`${wpBase}?text=${encodeURIComponent('Merhaba, araç bilgilerime göre parça teklifi almak istiyorum.')}`} target="_blank" rel="noreferrer">WhatsApp Destek</a></div>{(user.quotes || []).length ? user.quotes.map(quote => <div className="listItem" key={quote.id}><b>{quote.id}</b><small>{quote.date} • {quote.status}</small><p>{quote.note}</p></div>) : <div className="empty">Henüz teklif talebi yok.</div>}</section>
          </div>
        </section>
      )}
      {toast ? <div className="toast">{toast}</div> : null}
      <style jsx>{`
        *{box-sizing:border-box}.page{min-height:100vh;background:#f5f6f8;color:#252733;font-family:Inter,Arial,sans-serif}a{text-decoration:none;color:inherit}button,input,textarea{font:inherit}.header{display:flex;justify-content:space-between;align-items:center;gap:18px;background:#fff;border-bottom:1px solid #e8eaf0;padding:14px 56px}.logo img{width:150px;height:70px;object-fit:contain}nav{display:flex;gap:10px}nav a{background:#151821;color:#fff;border-radius:999px;padding:12px 16px;font-weight:900}.hero{max-width:1220px;margin:0 auto;padding:46px 56px 18px}.hero span,.card>span{color:#f32334;font-size:12px;font-weight:950;letter-spacing:1.4px}.hero h1{font-size:clamp(38px,6vw,72px);line-height:1;margin:10px 0}.hero p{color:#666d78;font-size:17px}.authWrap{max-width:920px;margin:0 auto;padding:10px 56px 80px}.authCard,.card{background:#fff;border:1px solid #e8eaf0;border-radius:28px;padding:26px;box-shadow:0 24px 70px rgba(31,35,45,.06)}.tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}.tabs button{border:0;border-radius:16px;background:#f1f3f6;padding:14px;font-weight:950}.tabs .active{background:#151821;color:#fff}.form,.editGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form input,.editGrid input,textarea{min-width:0;border:1px solid #e1e4ea;background:#f7f8fa;border-radius:16px;padding:14px 15px;outline:none}.form textarea,.wide{grid-column:1/-1}.form button,.save,.actionRow button,.actionRow a{border:0;background:#25D366;color:#071b0d;border-radius:999px;padding:15px 18px;font-weight:950;text-align:center;cursor:pointer}.form button{grid-column:1/-1}.formTitle{grid-column:1/-1;font-weight:950;margin-top:6px}.dashboard{max-width:1220px;margin:0 auto;padding:10px 56px 90px;display:grid;grid-template-columns:270px minmax(0,1fr);gap:22px}.side{position:sticky;top:20px;background:#151821;color:#fff;border-radius:26px;padding:20px;display:grid;gap:10px}.side strong{font-size:22px;margin-bottom:8px}.side a,.side button{border:0;text-align:left;background:rgba(255,255,255,.08);color:#fff;border-radius:16px;padding:13px;font-weight:850;cursor:pointer}.content{display:grid;gap:18px}.card h2{font-size:30px;margin:8px 0 18px}.infoGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.infoGrid div,.empty,.listItem{background:#f7f8fa;border-radius:18px;padding:16px}.infoGrid small,.listItem small{display:block;color:#777;margin-bottom:6px}.actionRow{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}.listItem{margin-top:10px}.listItem p{margin:8px 0 0;color:#666}.toast{position:fixed;right:20px;bottom:24px;background:#151821;color:#fff;border-radius:18px;padding:14px 18px;box-shadow:0 20px 54px rgba(31,35,45,.2);z-index:100}@media(max-width:900px){.header{padding:12px 16px;flex-direction:column}.logo img{width:128px;height:58px}nav{width:100%;overflow-x:auto}nav a{white-space:nowrap}.hero{padding:34px 16px 10px}.hero h1{font-size:36px}.hero p{font-size:15px}.authWrap{padding:10px 16px 90px}.form,.editGrid,.infoGrid,.actionRow{grid-template-columns:1fr}.dashboard{grid-template-columns:1fr;padding:10px 16px 90px}.side{position:relative;top:auto}.card{border-radius:22px;padding:20px}.toast{left:16px;right:16px;bottom:90px;text-align:center}}
      `}</style>
    </main>
  )
}
