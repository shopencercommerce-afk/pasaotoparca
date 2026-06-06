import { useEffect, useMemo, useState } from 'react'

const statusLabels = { gelecek: 'Gelecek', tamirde: 'Tamirde', hazir: 'Hazır', satildi: 'Satıldı' }
const emptyForm = { title: '', brand: '', model: '', plate: '', status: 'gelecek', purchasePrice: '' }
const expenseFields = [
  ['auctionCommission', 'Autogong Komisyon'],
  ['cardCommission', 'Kredi Kartı Ödeme'],
  ['notaryCost', 'Noter Harç'],
  ['towCost', 'Çekici'],
  ['repairCost', 'Tamir'],
  ['otherCost', 'Diğer Masraf']
]

function toNumber(value) {
  return Number(String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0
}
function formatMoney(value) {
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value || 0)} TL`
}
function moneyText(value) {
  const raw = String(value || '').replace(/[^0-9]/g, '')
  return raw ? new Intl.NumberFormat('tr-TR').format(Number(raw)) : ''
}
function totalCost(car) {
  const parts = (car.boughtParts || []).reduce((sum, part) => sum + toNumber(part.price), 0)
  const expenses = expenseFields.reduce((sum, [key]) => sum + toNumber(car[key]), 0)
  return expenses + parts
}
function expenseList(car) {
  return expenseFields.map(([key, label]) => ({ key, label, amount: toNumber(car[key]) })).filter(item => item.amount > 0)
}
async function readJson(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'İşlem başarısız')
  return data
}

export default function IhalePage() {
  const [cars, setCars] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [inputs, setInputs] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    setErrorMessage('')
    try {
      const [vehicles, stocks] = await Promise.all([readJson(await fetch('/api/ihale')), readJson(await fetch('/api/stok'))])
      setCars(Array.isArray(vehicles) ? vehicles : [])
      setStockItems(Array.isArray(stocks) ? stocks : [])
    } catch (error) {
      setErrorMessage(error.message || 'Kayıtlar okunamadı.')
    } finally {
      setLoading(false)
    }
  }

  async function saveCar(e) {
    e.preventDefault()
    if (!form.title.trim()) return alert('Araç adı yazmalısın.')
    try {
      const created = await readJson(await fetch('/api/ihale', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }))
      setCars(current => [created, ...current])
      setSelectedId(created.id)
      setForm(emptyForm)
      setFormOpen(false)
    } catch (error) {
      setErrorMessage(error.message || 'Araç eklenemedi.')
    }
  }

  async function updateCar(car, patch) {
    const oldCars = cars
    const nextCar = { ...car, ...patch }
    setCars(current => current.map(item => item.id === car.id ? nextCar : item))
    try {
      const saved = await readJson(await fetch(`/api/ihale/${car.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextCar) }))
      setCars(current => current.map(item => item.id === car.id ? { ...saved, tasks: nextCar.tasks || [] } : item))
    } catch (error) {
      setCars(oldCars)
      setErrorMessage(error.message || 'Araç güncellenemedi.')
    }
  }

  async function deleteCar(car) {
    if (!confirm('Bu araç silinsin mi?')) return
    const oldCars = cars
    setCars(current => current.filter(item => item.id !== car.id))
    setSelectedId('')
    try { await readJson(await fetch(`/api/ihale/${car.id}`, { method: 'DELETE' })) }
    catch (error) { setCars(oldCars); setErrorMessage(error.message || 'Araç silinemedi.') }
  }

  function moneyPatch(car, key, value) {
    updateCar(car, { [key]: moneyText(value) })
  }

  function addExpense(car) {
    const key = inputs[`expense-key-${car.id}`] || 'cardCommission'
    const amount = inputs[`expense-amount-${car.id}`] || ''
    if (!amount) return alert('Masraf tutarı yazmalısın.')
    const nextAmount = toNumber(car[key]) + toNumber(amount)
    updateCar(car, { [key]: moneyText(String(nextAmount)) })
    setInputs(current => ({ ...current, [`expense-amount-${car.id}`]: '' }))
  }

  function clearExpense(car, key) {
    updateCar(car, { [key]: '' })
  }

  function addNeeded(car) {
    const name = (inputs[`need-${car.id}`] || '').trim()
    if (!name) return
    updateCar(car, { neededParts: [...(car.neededParts || []), { name, done: false, addedBy: '' }] })
    setInputs(current => ({ ...current, [`need-${car.id}`]: '' }))
  }
  function toggleNeeded(car, partId) {
    updateCar(car, { neededParts: (car.neededParts || []).map(part => part.id === partId ? { ...part, done: !part.done } : part) })
  }
  function removeNeeded(car, partId) {
    updateCar(car, { neededParts: (car.neededParts || []).filter(part => part.id !== partId) })
  }
  function addBought(car) {
    const name = (inputs[`bought-name-${car.id}`] || '').trim()
    const price = inputs[`bought-price-${car.id}`] || ''
    if (!name) return alert('Parça adı yazmalısın.')
    updateCar(car, { boughtParts: [...(car.boughtParts || []), { name, price, buyer: 'Manuel' }] })
    setInputs(current => ({ ...current, [`bought-name-${car.id}`]: '', [`bought-price-${car.id}`]: '' }))
  }
  function removeBought(car, partId) {
    updateCar(car, { boughtParts: (car.boughtParts || []).filter(part => part.id !== partId) })
  }

  async function useStock(car, stockId) {
    const stock = stockItems.find(item => item.id === stockId)
    if (!stock) return
    const qty = Number(stock.quantity || 0)
    if (qty <= 0) return alert('Bu ürün stokta yok.')
    const nextQty = qty - 1
    const updatedStock = { ...stock, quantity: nextQty, status: nextQty <= 0 ? 'kullanildi' : stock.status, note: [stock.note || '', `${new Date().toLocaleString('tr-TR')} - ${car.title} için kullanıldı.`].filter(Boolean).join('\n') }
    const nextCar = { ...car, boughtParts: [...(car.boughtParts || []), { name: [stock.brand, stock.productName, stock.partCode].filter(Boolean).join(' - '), price: stock.buyPrice || stock.salePrice || 0, buyer: 'Stoktan' }] }
    const oldCars = cars
    const oldStocks = stockItems
    setStockItems(current => current.map(item => item.id === stock.id ? updatedStock : item))
    setCars(current => current.map(item => item.id === car.id ? nextCar : item))
    try {
      await readJson(await fetch(`/api/stok/${stock.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedStock) }))
      const saved = await readJson(await fetch(`/api/ihale/${car.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nextCar) }))
      setCars(current => current.map(item => item.id === car.id ? { ...saved, tasks: nextCar.tasks || [] } : item))
    } catch (error) {
      setCars(oldCars)
      setStockItems(oldStocks)
      setErrorMessage(error.message || 'Stoktan kullanım kaydedilemedi.')
    }
  }

  const selectedCar = cars.find(car => car.id === selectedId)
  const summary = useMemo(() => ({
    count: cars.length,
    repair: cars.filter(car => car.status === 'tamirde').length,
    ready: cars.filter(car => car.status === 'hazir').length,
    total: cars.reduce((sum, car) => sum + totalCost(car), 0)
  }), [cars])

  return <main className="page">
    <section className="topNav">
      <a className="active" href="/ihale">İhale Sayfasına Geç</a>
      <a href="/stok">Stok Sayfasına Geç</a>
      <button onClick={() => setFormOpen(true)}>+ Araç Ekle</button>
      <button onClick={loadAll}>Yenile</button>
    </section>

    <section className="summaryGrid">
      <div><span>Araçlar</span><strong>{summary.count}</strong></div>
      <div><span>Tamirde</span><strong>{summary.repair}</strong></div>
      <div><span>Hazır</span><strong>{summary.ready}</strong></div>
      <div><span>Toplam Maliyet</span><strong>{formatMoney(summary.total)}</strong></div>
    </section>

    {errorMessage ? <div className="errorBox">{errorMessage}</div> : null}

    <section className="cards">
      {loading ? <div className="empty">Yükleniyor...</div> : null}
      {!loading && cars.length === 0 ? <div className="empty">Araç kaydı yok.</div> : null}
      {cars.map(car => <button className="carCard" key={car.id} onClick={() => setSelectedId(car.id)}>
        <div className="carTop"><h3>{car.title}</h3><span className={`status ${car.status || 'gelecek'}`}>{statusLabels[car.status] || 'Gelecek'}</span></div>
        <p>{[car.brand, car.model, car.plate].filter(Boolean).join(' • ') || 'Araç bilgisi yok'}</p>
        <small>Araç Bedeli: {formatMoney(toNumber(car.purchasePrice))}</small><br />
        <small>Maliyet: {formatMoney(totalCost(car))}</small>
      </button>)}
    </section>

    {formOpen ? <Modal title="Yeni Araç" onClose={() => setFormOpen(false)}>
      <form className="modalForm" onSubmit={saveCar}>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Araç adı" />
        <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Marka" />
        <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Model" />
        <input value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} placeholder="Plaka" />
        <input value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: moneyText(e.target.value) })} placeholder="Araç bedeli - maliyete eklenmez" />
        <button className="primary">Kaydet</button>
      </form>
    </Modal> : null}

    {selectedCar ? <Modal title={selectedCar.title} onClose={() => setSelectedId('')}>
      <div className="detailGrid">
        <select value={selectedCar.status || 'gelecek'} onChange={e => updateCar(selectedCar, { status: e.target.value })}>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <input value={selectedCar.purchasePrice || ''} onChange={e => moneyPatch(selectedCar, 'purchasePrice', e.target.value)} placeholder="Araç bedeli - maliyete eklenmez" />
        <input value={selectedCar.salePrice || ''} onChange={e => moneyPatch(selectedCar, 'salePrice', e.target.value)} placeholder="Satış fiyatı" />
      </div>
      <section className="numbers"><div><span>Araç Bedeli</span><strong>{formatMoney(toNumber(selectedCar.purchasePrice))}</strong></div><div><span>Toplam Maliyet</span><strong>{formatMoney(totalCost(selectedCar))}</strong></div><div><span>Satış</span><strong>{formatMoney(toNumber(selectedCar.salePrice))}</strong></div><div><span>Kâr/Zarar</span><strong className={toNumber(selectedCar.salePrice) - totalCost(selectedCar) >= 0 ? 'good' : 'bad'}>{formatMoney(toNumber(selectedCar.salePrice) - totalCost(selectedCar))}</strong></div></section>
      <section className="box"><h3>Masraflar</h3><div className="line expenseLine"><select value={inputs[`expense-key-${selectedCar.id}`] || 'cardCommission'} onChange={e => setInputs({ ...inputs, [`expense-key-${selectedCar.id}`]: e.target.value })}>{expenseFields.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><input value={inputs[`expense-amount-${selectedCar.id}`] || ''} onChange={e => setInputs({ ...inputs, [`expense-amount-${selectedCar.id}`]: moneyText(e.target.value) })} placeholder="Tutar" /><button onClick={() => addExpense(selectedCar)}>Ekle</button></div>{expenseList(selectedCar).length === 0 ? <p className="muted">Henüz masraf yok.</p> : expenseList(selectedCar).map(item => <div className="row" key={item.key}><div><b>{item.label}</b><small>{formatMoney(item.amount)}</small></div><button onClick={() => clearExpense(selectedCar, item.key)}>×</button></div>)}</section>
      <section className="box"><h3>Gerekli Parçalar</h3><div className="line"><input value={inputs[`need-${selectedCar.id}`] || ''} onChange={e => setInputs({ ...inputs, [`need-${selectedCar.id}`]: e.target.value })} placeholder="Örn: Sol far" /><button onClick={() => addNeeded(selectedCar)}>Ekle</button></div>{(selectedCar.neededParts || []).map(part => <div className="row" key={part.id}><label><input type="checkbox" checked={!!part.done} onChange={() => toggleNeeded(selectedCar, part.id)} /> {part.name}</label><button onClick={() => removeNeeded(selectedCar, part.id)}>×</button></div>)}</section>
      <section className="box"><h3>Alınan Parçalar</h3><select defaultValue="" onChange={e => { if (e.target.value) { useStock(selectedCar, e.target.value); e.target.value = '' } }}><option value="">Stoktan parça seç</option>{stockItems.filter(item => Number(item.quantity || 0) > 0).map(item => <option key={item.id} value={item.id}>{item.brand} - {item.productName} | Stok: {item.quantity}</option>)}</select><div className="line boughtLine"><input value={inputs[`bought-name-${selectedCar.id}`] || ''} onChange={e => setInputs({ ...inputs, [`bought-name-${selectedCar.id}`]: e.target.value })} placeholder="Parça adı" /><input value={inputs[`bought-price-${selectedCar.id}`] || ''} onChange={e => setInputs({ ...inputs, [`bought-price-${selectedCar.id}`]: moneyText(e.target.value) })} placeholder="Fiyat" /><button onClick={() => addBought(selectedCar)}>Ekle</button></div>{(selectedCar.boughtParts || []).map(part => <div className="row" key={part.id}><div><b>{part.name}</b><small>{formatMoney(toNumber(part.price))}</small></div><button onClick={() => removeBought(selectedCar, part.id)}>×</button></div>)}</section>
      <textarea value={selectedCar.notes || ''} onChange={e => updateCar(selectedCar, { notes: e.target.value })} placeholder="Araç notları" />
      <div className="danger"><button onClick={() => deleteCar(selectedCar)}>Aracı Sil</button></div>
    </Modal> : null}

    <style jsx>{`
      .page{min-height:100vh;background:#f4f6fb;color:#151821;padding:22px;font-family:Inter,Arial,sans-serif}.topNav{max-width:1320px;margin:0 auto 14px;display:flex;gap:10px;flex-wrap:wrap}.topNav a,.topNav button{background:#151821;color:#fff;text-decoration:none;border:0;border-radius:999px;padding:13px 18px;font-weight:950;cursor:pointer}.topNav .active{background:#f32334}.summaryGrid,.cards{max-width:1320px;margin:0 auto 14px;display:grid;gap:12px}.summaryGrid{grid-template-columns:repeat(4,1fr)}.summaryGrid div,.carCard,.box{background:#fff;border:1px solid #e5e8ef;border-radius:22px;padding:16px;box-shadow:0 16px 50px rgba(31,35,45,.05)}.summaryGrid span{display:block;color:#687080;font-size:13px;font-weight:800;margin-bottom:7px}.summaryGrid strong{font-size:22px}.cards{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}.carCard{text-align:left;cursor:pointer;color:#151821}.carTop{display:flex;align-items:center;justify-content:space-between;gap:8px}.carCard h3{margin:0;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.carCard p{margin:8px 0;color:#687080;font-size:13px}.status{border-radius:999px;padding:6px 9px;font-size:11px;font-weight:950;background:#eef1f6}.tamirde{background:#e7f0ff;color:#1554b3}.hazir{background:#e8f8ef;color:#0b7434}.satildi{background:#f1e8ff;color:#5d249a}.errorBox,.empty{max-width:1320px;margin:0 auto 14px;background:#fff0f1;color:#b91523;border-radius:16px;padding:14px;font-weight:900}.empty{background:#fff;color:#687080}.modalForm,.detailGrid,.line{display:grid;gap:10px}.modalForm{grid-template-columns:repeat(2,1fr)}.detailGrid{grid-template-columns:repeat(3,1fr);margin-bottom:12px}.numbers{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.numbers div{background:#f8f9fc;border-radius:16px;padding:13px}.numbers span{display:block;color:#687080;font-size:13px;margin-bottom:6px}.good{color:#138a3d}.bad{color:#d12b2b}input,select,textarea{width:100%;border:1px solid #dde2ec;background:#f8f9fc;border-radius:13px;padding:12px;color:#151821}textarea{min-height:80px;margin-top:12px}.primary,.line button,.row button,.danger button{border:0;border-radius:999px;font-weight:950;cursor:pointer}.primary,.line button{background:#f32334;color:#fff;padding:12px 16px}.box{margin-top:12px}.box h3{margin:0 0 10px}.line{grid-template-columns:1fr auto}.expenseLine,.boughtLine{grid-template-columns:1fr 150px auto}.row{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#fff;border:1px solid #e5e8ef;border-radius:14px;padding:10px;margin-top:8px}.row button{background:#eef1f6;width:32px;height:32px}.row small{display:block;color:#687080}.muted{color:#687080;margin:0}.danger{display:flex;justify-content:flex-end;margin-top:12px}.danger button{background:#151821;color:#fff;padding:11px 14px}@media(max-width:760px){.page{padding:14px}.topNav a,.topNav button{flex:1;text-align:center}.summaryGrid,.numbers,.detailGrid,.modalForm{grid-template-columns:1fr 1fr}.cards{grid-template-columns:1fr 1fr}.line,.expenseLine,.boughtLine{grid-template-columns:1fr}.summaryGrid strong{font-size:18px}}
    `}</style>
  </main>
}

function Modal({ title, onClose, children }) {
  return <div className="modalOverlay" onMouseDown={onClose}>
    <section className="modal" onMouseDown={e => e.stopPropagation()}>
      <div className="modalHead"><h2>{title}</h2><button onClick={onClose}>×</button></div>
      {children}
    </section>
    <style jsx>{`
      .modalOverlay{position:fixed;inset:0;z-index:50;background:rgba(10,13,20,.62);display:grid;place-items:center;padding:16px}.modal{width:min(960px,100%);max-height:92vh;overflow:auto;background:#fff;color:#151821;border-radius:28px;padding:20px;box-shadow:0 40px 120px rgba(0,0,0,.35)}.modalHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.modalHead h2{margin:0;font-size:28px}.modalHead button{border:0;background:#eef1f6;border-radius:50%;width:40px;height:40px;font-size:24px;cursor:pointer}@media(max-width:760px){.modalOverlay{padding:8px;align-items:end}.modal{border-radius:24px 24px 0 0;padding:16px}.modalHead h2{font-size:22px}}
    `}</style>
  </div>
}
