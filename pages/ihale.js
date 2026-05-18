import { useEffect, useMemo, useState } from 'react'

const partners = ['Mustafa', 'Bedirhan', 'Ömer']
const accessCode = process.env.NEXT_PUBLIC_IHALE_ACCESS_CODE || 'pasa2026'
const storageKey = 'pasaIhalePanelV2'
const oldStorageKey = 'pasaIhalePanelV1'

const statusLabels = { gelecek: 'Gelecek Araç', tamirde: 'Tamirde', hazir: 'Satışa Hazır', satildi: 'Satıldı' }

const emptyVehicle = {
  title: '', brand: '', model: '', plate: '', status: 'gelecek',
  purchasePrice: '', auctionCommission: '', cardCommission: '', notaryCost: '', towCost: '', repairCost: '', otherCost: '', salePrice: '',
  notes: '', neededParts: [], boughtParts: []
}

function toNumber(value) { return Number(String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0 }
function formatInputMoney(value) { const raw = String(value || '').replace(/[^0-9]/g, ''); return raw ? new Intl.NumberFormat('tr-TR').format(Number(raw)) : '' }
function formatMoney(value) { return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value || 0)} TL` }
function uid() { return `${Date.now()}-${Math.random().toString(16).slice(2)}` }
function normalizeCar(car) { return { ...emptyVehicle, ...car } }
function totalCost(car) { const item = normalizeCar(car); const parts = (item.boughtParts || []).reduce((sum, part) => sum + toNumber(part.price), 0); return toNumber(item.purchasePrice) + toNumber(item.auctionCommission) + toNumber(item.cardCommission) + toNumber(item.notaryCost) + toNumber(item.towCost) + toNumber(item.repairCost) + toNumber(item.otherCost) + parts }
function profit(car) { return toNumber(car.salePrice) - totalCost(car) }
function partnerSpend(car, name) { return (car.boughtParts || []).filter(part => part.buyer === name).reduce((sum, part) => sum + toNumber(part.price), 0) }
function completion(car) { const needed = car.neededParts || []; if (!needed.length) return 'Parça listesi yok'; return `${needed.filter(part => part.done).length}/${needed.length} parça tamamlandı` }

export default function IhalePage() {
  const [user, setUser] = useState('')
  const [loginName, setLoginName] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [cars, setCars] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [carForm, setCarForm] = useState(emptyVehicle)
  const [partInputs, setPartInputs] = useState({})

  useEffect(() => {
    if (typeof window === 'undefined') return
    setUser(localStorage.getItem('pasaIhaleUser') || '')
    const saved = localStorage.getItem(storageKey) || localStorage.getItem(oldStorageKey) || '[]'
    setCars(JSON.parse(saved).map(normalizeCar))
  }, [])

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(cars)) }, [cars])

  function login(e) {
    e.preventDefault()
    const normalized = loginName.trim().toLocaleLowerCase('tr-TR')
    const found = partners.find(name => name.toLocaleLowerCase('tr-TR') === normalized || (normalized === 'omer' && name === 'Ömer'))
    if (!found || loginCode !== accessCode) return alert('Giriş bilgileri hatalı.')
    localStorage.setItem('pasaIhaleUser', found)
    setUser(found)
  }
  function logout() { localStorage.removeItem('pasaIhaleUser'); setUser(''); setLoginName(''); setLoginCode('') }
  function updateCar(id, patch) { setCars(cars.map(car => car.id === id ? normalizeCar({ ...car, ...patch }) : car)) }
  function moneyPatch(id, key, value) { updateCar(id, { [key]: formatInputMoney(value) }) }
  function saveCar(e) {
    e.preventDefault()
    if (!carForm.title.trim()) return alert('Araç adı yazmalısın.')
    const next = normalizeCar({ ...carForm, id: uid(), createdBy: user, createdAt: new Date().toLocaleDateString('tr-TR') })
    setCars([next, ...cars]); setSelectedId(next.id); setCarForm(emptyVehicle); setFormOpen(false)
  }
  function deleteCar(id) { if (!confirm('Bu araç kartı silinsin mi?')) return; setCars(cars.filter(car => car.id !== id)); setSelectedId('') }
  function addNeededPart(carId) { const value = (partInputs[`need-${carId}`] || '').trim(); if (!value) return; setCars(cars.map(car => car.id === carId ? { ...car, neededParts: [...(car.neededParts || []), { id: uid(), name: value, done: false, addedBy: user }] } : car)); setPartInputs({ ...partInputs, [`need-${carId}`]: '' }) }
  function toggleNeededPart(carId, partId) { setCars(cars.map(car => car.id === carId ? { ...car, neededParts: (car.neededParts || []).map(part => part.id === partId ? { ...part, done: !part.done } : part) } : car)) }
  function removeNeededPart(carId, partId) { setCars(cars.map(car => car.id === carId ? { ...car, neededParts: (car.neededParts || []).filter(part => part.id !== partId) } : car)) }
  function addBoughtPart(carId) { const name = (partInputs[`bought-name-${carId}`] || '').trim(); const price = partInputs[`bought-price-${carId}`] || ''; const buyer = partInputs[`bought-buyer-${carId}`] || user; if (!name) return alert('Alınan parça adı yazmalısın.'); setCars(cars.map(car => car.id === carId ? { ...car, boughtParts: [...(car.boughtParts || []), { id: uid(), name, price, buyer, boughtAt: new Date().toLocaleDateString('tr-TR') }] } : car)); setPartInputs({ ...partInputs, [`bought-name-${carId}`]: '', [`bought-price-${carId}`]: '', [`bought-buyer-${carId}`]: user }) }
  function removeBoughtPart(carId, partId) { setCars(cars.map(car => car.id === carId ? { ...car, boughtParts: (car.boughtParts || []).filter(part => part.id !== partId) } : car)) }

  const selectedCar = cars.find(car => car.id === selectedId) ? normalizeCar(cars.find(car => car.id === selectedId)) : null
  const summary = useMemo(() => {
    const totalInvestment = cars.reduce((sum, car) => sum + totalCost(car), 0)
    const totalSales = cars.reduce((sum, car) => sum + toNumber(car.salePrice), 0)
    const soldProfit = cars.filter(car => car.status === 'satildi').reduce((sum, car) => sum + profit(car), 0)
    const byPartner = partners.map(name => ({ name, spend: cars.reduce((sum, car) => sum + partnerSpend(car, name), 0) }))
    return { totalInvestment, totalSales, soldProfit, byPartner }
  }, [cars])

  if (!user) return <main className="loginPage"><section className="loginCard"><span>GİZLİ PANEL</span><h1>İhale Takip</h1><p>Bu sayfa site içinde görünmez. Yetkili ortak girişi gerektirir.</p><form onSubmit={login}><input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Kullanıcı adı" autoFocus /><input value={loginCode} onChange={e => setLoginCode(e.target.value)} placeholder="Giriş kodu" type="password" /><button>Giriş Yap</button></form><small>Giriş bilgisi olmayan kişiler panele erişemez.</small></section><GlobalStyle /></main>

  return <main className="page">
    <header className="topbar"><div><span>PAŞA OTO PARÇA</span><h1>İhale Araç Ortak Paneli</h1><p>Giriş yapan: <b>{user}</b></p></div><div className="topActions"><button onClick={() => setFormOpen(true)}>+ Araç Kartı Ekle</button><button className="ghost" onClick={logout}>Çıkış</button></div></header>
    <section className="summaryGrid"><div><span>Toplam Araç</span><strong>{cars.length}</strong></div><div><span>Toplam Maliyet</span><strong>{formatMoney(summary.totalInvestment)}</strong></div><div><span>Toplam Satış</span><strong>{formatMoney(summary.totalSales)}</strong></div><div><span>Satılan Araç Kâr/Zarar</span><strong className={summary.soldProfit >= 0 ? 'profit' : 'loss'}>{formatMoney(summary.soldProfit)}</strong></div></section>
    <section className="partnerGrid">{summary.byPartner.map(item => <div key={item.name}><span>{item.name} parça harcaması</span><strong>{formatMoney(item.spend)}</strong></div>)}</section>

    <section className="carsGrid">
      {cars.length === 0 ? <div className="empty"><h2>Henüz araç kartı yok.</h2><p>İlk aracı ekleyerek maliyet, parça ve satış takibine başlayabilirsin.</p></div> : cars.map(rawCar => {
        const car = normalizeCar(rawCar); const cost = totalCost(car); const carProfit = profit(car)
        return <button className="carCard" key={car.id} onClick={() => setSelectedId(car.id)}><span className={`status ${car.status}`}>{statusLabels[car.status]}</span><h2>{car.title}</h2><p>{[car.brand, car.model, car.plate].filter(Boolean).join(' • ') || 'Araç bilgisi eklenmedi'}</p><div className="cardStats"><div><small>Maliyet</small><b>{formatMoney(cost)}</b></div><div><small>Satış</small><b>{formatMoney(toNumber(car.salePrice))}</b></div><div><small>Kâr/Zarar</small><b className={carProfit >= 0 ? 'profit' : 'loss'}>{formatMoney(carProfit)}</b></div></div><em>{completion(car)} • Detay için tıkla</em></button>
      })}
    </section>

    {formOpen ? <Modal title="Yeni Araç Kartı" onClose={() => setFormOpen(false)}><form onSubmit={saveCar} className="carForm simple"><input placeholder="Araç adı örn: Model Y Kazalı" value={carForm.title} onChange={e => setCarForm({ ...carForm, title: e.target.value })} /><input placeholder="Marka" value={carForm.brand} onChange={e => setCarForm({ ...carForm, brand: e.target.value })} /><input placeholder="Model" value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} /><input placeholder="Plaka" value={carForm.plate} onChange={e => setCarForm({ ...carForm, plate: e.target.value })} /><button>Aracı Kaydet</button></form></Modal> : null}

    {selectedCar ? <CarModal car={selectedCar} user={user} onClose={() => setSelectedId('')} updateCar={updateCar} deleteCar={deleteCar} moneyPatch={moneyPatch} addNeededPart={addNeededPart} toggleNeededPart={toggleNeededPart} removeNeededPart={removeNeededPart} addBoughtPart={addBoughtPart} removeBoughtPart={removeBoughtPart} partInputs={partInputs} setPartInputs={setPartInputs} /> : null}
    <GlobalStyle />
  </main>
}

function Modal({ title, onClose, children }) { return <div className="modalOverlay" onMouseDown={onClose}><section className="modal" onMouseDown={e => e.stopPropagation()}><div className="modalHead"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</section></div> }

function CarModal({ car, user, onClose, updateCar, deleteCar, moneyPatch, addNeededPart, toggleNeededPart, removeNeededPart, addBoughtPart, removeBoughtPart, partInputs, setPartInputs }) {
  const cost = totalCost(car), carProfit = profit(car), share = car.status === 'satildi' ? carProfit / partners.length : 0
  return <Modal title={car.title} onClose={onClose}>
    <div className="modalSub"><span className={`status ${car.status}`}>{statusLabels[car.status]}</span><p>{[car.brand, car.model, car.plate].filter(Boolean).join(' • ') || 'Araç bilgisi eklenmedi'}</p></div>
    <div className="editCosts"><label>Statü<select value={car.status} onChange={e => updateCar(car.id, { status: e.target.value })}>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Araç Bedeli<input value={car.purchasePrice} onChange={e => moneyPatch(car.id, 'purchasePrice', e.target.value)} placeholder="100.000" /></label><label>Autogong Komisyon<input value={car.auctionCommission} onChange={e => moneyPatch(car.id, 'auctionCommission', e.target.value)} placeholder="15.000" /></label><label>Kredi Kartı Komisyon<input value={car.cardCommission} onChange={e => moneyPatch(car.id, 'cardCommission', e.target.value)} placeholder="7.500" /></label><label>Noter Harç<input value={car.notaryCost} onChange={e => moneyPatch(car.id, 'notaryCost', e.target.value)} placeholder="5.000" /></label><label>Çekici<input value={car.towCost} onChange={e => moneyPatch(car.id, 'towCost', e.target.value)} placeholder="5.000" /></label><label>Tamir<input value={car.repairCost} onChange={e => moneyPatch(car.id, 'repairCost', e.target.value)} placeholder="25.000" /></label><label>Diğer<input value={car.otherCost} onChange={e => moneyPatch(car.id, 'otherCost', e.target.value)} placeholder="10.000" /></label><label>Satış<input value={car.salePrice} onChange={e => moneyPatch(car.id, 'salePrice', e.target.value)} placeholder="450.000" /></label></div>
    <div className="numbers"><div><span>Toplam Maliyet</span><strong>{formatMoney(cost)}</strong></div><div><span>Satış</span><strong>{formatMoney(toNumber(car.salePrice))}</strong></div><div><span>Kâr / Zarar</span><strong className={carProfit >= 0 ? 'profit' : 'loss'}>{formatMoney(carProfit)}</strong></div><div><span>Kişi Başı Pay</span><strong>{car.status === 'satildi' ? formatMoney(share) : '-'}</strong></div></div>
    <div className="columns"><section><h3>Gerekli Parçalar</h3><div className="addLine"><input value={partInputs[`need-${car.id}`] || ''} onChange={e => setPartInputs({ ...partInputs, [`need-${car.id}`]: e.target.value })} placeholder="Örn: Sol far" /><button onClick={() => addNeededPart(car.id)}>Ekle</button></div><div className="list">{(car.neededParts || []).map(part => <div className="listRow" key={part.id}><label><input type="checkbox" checked={part.done} onChange={() => toggleNeededPart(car.id, part.id)} /><span className={part.done ? 'done' : ''}>{part.name}</span></label><button onClick={() => removeNeededPart(car.id, part.id)}>×</button></div>)}</div></section><section><h3>Alınan Parçalar</h3><div className="buyGrid"><input value={partInputs[`bought-name-${car.id}`] || ''} onChange={e => setPartInputs({ ...partInputs, [`bought-name-${car.id}`]: e.target.value })} placeholder="Parça adı" /><input value={partInputs[`bought-price-${car.id}`] || ''} onChange={e => setPartInputs({ ...partInputs, [`bought-price-${car.id}`]: formatInputMoney(e.target.value) })} placeholder="Tutar" /><select value={partInputs[`bought-buyer-${car.id}`] || user} onChange={e => setPartInputs({ ...partInputs, [`bought-buyer-${car.id}`]: e.target.value })}>{partners.map(name => <option key={name}>{name}</option>)}</select><button onClick={() => addBoughtPart(car.id)}>Alındı Ekle</button></div><div className="list">{(car.boughtParts || []).map(part => <div className="boughtRow" key={part.id}><div><b>{part.name}</b><small>{part.buyer} aldı • {part.boughtAt}</small></div><strong>{formatMoney(toNumber(part.price))}</strong><button onClick={() => removeBoughtPart(car.id, part.id)}>×</button></div>)}</div></section></div>
    <textarea className="notes" placeholder="Araç notları" value={car.notes || ''} onChange={e => updateCar(car.id, { notes: e.target.value })} />
    <div className="dangerRow"><button onClick={() => deleteCar(car.id)}>Aracı Sil</button></div>
  </Modal>
}

function GlobalStyle() { return <style jsx global>{`
*{box-sizing:border-box}body{margin:0;background:#101218;color:#eef1f7;font-family:Inter,Arial,sans-serif}button,input,select,textarea{font:inherit}button{cursor:pointer}.loginPage{min-height:100vh;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at top,#272c3a,#101218 60%)}.loginCard{width:min(520px,100%);background:#fff;color:#161922;border-radius:30px;padding:34px;box-shadow:0 30px 90px rgba(0,0,0,.35)}.loginCard span,.topbar span{color:#f32334;font-size:12px;font-weight:950;letter-spacing:1.5px}.loginCard h1{font-size:44px;line-height:1;margin:12px 0}.loginCard p{color:#5c6470;line-height:1.6}.loginCard form{display:grid;gap:12px;margin:22px 0}.loginCard input,.loginCard button{height:54px;border-radius:16px;border:1px solid #dde1ea;padding:0 16px}.loginCard button,.topActions button,.carForm button{border:0;background:#f32334;color:#fff;font-weight:950}.loginCard small{color:#777;line-height:1.5}.page{min-height:100vh;padding:28px;background:#f4f6fb;color:#1b1f2a}.topbar{max-width:1360px;margin:0 auto 20px;display:flex;justify-content:space-between;gap:20px;align-items:flex-end}.topbar h1{font-size:clamp(34px,5vw,64px);line-height:1;margin:8px 0;color:#151821}.topbar p{color:#5b6270}.topActions{display:flex;gap:10px;flex-wrap:wrap}.topActions button,.ghost{border:0;border-radius:999px;padding:14px 18px;font-weight:950}.topActions .ghost{background:#151821;color:#fff}.summaryGrid,.partnerGrid{max-width:1360px;margin:0 auto 16px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.partnerGrid{grid-template-columns:repeat(3,1fr)}.summaryGrid>div,.partnerGrid>div,.carCard{background:#fff;color:#151821;border:1px solid #e4e8f1;border-radius:26px;box-shadow:0 20px 70px rgba(23,27,38,.07)}.summaryGrid>div,.partnerGrid>div{padding:20px}.summaryGrid span,.partnerGrid span,.numbers span{display:block;color:#717989;font-size:13px;margin-bottom:8px}.summaryGrid strong,.partnerGrid strong{font-size:26px}.profit{color:#0b8d3a!important}.loss{color:#d72737!important}.carsGrid{max-width:1360px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:18px;align-items:start}.empty{grid-column:1/-1;background:#fff;color:#151821;border-radius:26px;padding:34px}.carCard{width:100%;text-align:left;border:0;padding:22px}.carCard h2{font-size:28px;margin:12px 0 6px}.carCard p{color:#667085;margin:0 0 18px}.carCard em{display:block;color:#717989;font-style:normal;font-weight:800;margin-top:14px}.cardStats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.cardStats div,.numbers div{background:#f7f9fc;border-radius:18px;padding:13px}.cardStats small{display:block;color:#717989;margin-bottom:5px}.status{display:inline-flex;border-radius:999px;padding:7px 11px;font-size:12px;font-weight:950;background:#eef1f6;color:#303746}.status.gelecek{background:#fff3cd;color:#7a5500}.status.tamirde{background:#e7f0ff;color:#1554b3}.status.hazir{background:#e8f8ef;color:#0b7434}.status.satildi{background:#f1e8ff;color:#5d249a}.modalOverlay{position:fixed;inset:0;z-index:200;background:rgba(10,13,20,.62);display:grid;place-items:center;padding:20px}.modal{width:min(1180px,100%);max-height:90vh;overflow:auto;background:#fff;color:#151821;border-radius:30px;box-shadow:0 40px 120px rgba(0,0,0,.35);padding:24px}.modalHead{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:16px}.modalHead h2{font-size:32px;line-height:1.05;margin:0}.modalHead button{border:0;background:#eef1f6;border-radius:50%;width:42px;height:42px;font-size:26px}.modalSub{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}.modalSub p{margin:0;color:#667085}.carForm.simple{display:grid;grid-template-columns:repeat(4,1fr) auto;gap:12px}.carForm input,.editCosts input,.editCosts select,.addLine input,.buyGrid input,.buyGrid select,.notes{border:1px solid #dde2ec;background:#f8f9fc;border-radius:15px;padding:13px;min-width:0;color:#151821}.carForm button{border-radius:15px;padding:0 18px}.editCosts{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:18px 0}.editCosts label{display:grid;gap:6px;color:#6a7280;font-size:12px;font-weight:850}.numbers{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.numbers strong{font-size:22px}.columns{display:grid;grid-template-columns:1fr 1.25fr;gap:16px}.columns section{background:#f8f9fc;border:1px solid #e5e9f2;border-radius:22px;padding:16px}.columns h3{margin:0 0 12px}.addLine{display:grid;grid-template-columns:1fr auto;gap:8px}.addLine button,.buyGrid button{border:0;background:#151821;color:#fff;border-radius:14px;padding:0 14px;font-weight:900}.list{display:grid;gap:8px;margin-top:12px}.listRow,.boughtRow{background:#fff;border:1px solid #e5e9f2;border-radius:15px;padding:11px;display:flex;align-items:center;justify-content:space-between;gap:10px}.listRow label{display:flex;align-items:center;gap:8px}.listRow button,.boughtRow button{border:0;background:#eef1f6;border-radius:10px;width:30px;height:30px}.done{text-decoration:line-through;color:#8891a2}.buyGrid{display:grid;grid-template-columns:1.4fr .8fr .8fr auto;gap:8px}.boughtRow div{display:grid;gap:3px}.boughtRow small{color:#697386}.boughtRow strong{white-space:nowrap}.notes{width:100%;margin-top:16px;min-height:76px;resize:vertical}.dangerRow{display:flex;justify-content:flex-end;margin-top:16px}.dangerRow button{border:0;background:#151821;color:#fff;border-radius:999px;padding:12px 16px;font-weight:900}@media(max-width:980px){.page{padding:16px}.topbar{display:grid}.summaryGrid,.partnerGrid,.carsGrid,.carForm.simple,.editCosts,.numbers,.columns,.buyGrid,.cardStats{grid-template-columns:1fr}.topActions button{width:100%}.topActions{width:100%}.summaryGrid strong,.partnerGrid strong{font-size:22px}.modalOverlay{padding:10px;align-items:end}.modal{max-height:92vh;border-radius:24px 24px 0 0;padding:18px}.modalHead h2{font-size:24px}}
`}</style> }
