import { useEffect, useMemo, useState } from 'react'

const statusLabels = { gelecek: 'Gelecek', tamirde: 'Tamirde', hazir: 'Hazır', satildi: 'Satıldı' }

function toNumber(value) {
  return Number(String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0
}

function formatMoney(value) {
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value || 0)} TL`
}

function totalCost(car) {
  const parts = (car.boughtParts || []).reduce((sum, part) => sum + toNumber(part.price), 0)
  return toNumber(car.purchasePrice) + toNumber(car.auctionCommission) + toNumber(car.cardCommission) + toNumber(car.notaryCost) + toNumber(car.towCost) + toNumber(car.repairCost) + toNumber(car.otherCost) + parts
}

async function readJson(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'İşlem başarısız')
  return data
}

export default function IhalePage() {
  const [cars, setCars] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', brand: '', model: '', plate: '', status: 'gelecek', purchasePrice: '' })

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setErrorMessage('')
    try {
      const [vehicles, stocks] = await Promise.all([
        readJson(await fetch('/api/ihale')),
        readJson(await fetch('/api/stok'))
      ])
      setCars(Array.isArray(vehicles) ? vehicles : [])
      setStockItems(Array.isArray(stocks) ? stocks : [])
    } catch (error) {
      setErrorMessage(error.message || 'Kayıtlar okunamadı.')
    } finally {
      setLoading(false)
    }
  }

  async function addCar(e) {
    e.preventDefault()
    if (!form.title.trim()) return alert('Araç adı yazmalısın.')
    try {
      const created = await readJson(await fetch('/api/ihale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      }))
      setCars(current => [created, ...current])
      setForm({ title: '', brand: '', model: '', plate: '', status: 'gelecek', purchasePrice: '' })
    } catch (error) {
      setErrorMessage(error.message || 'Araç eklenemedi.')
    }
  }

  async function updateCar(car, patch) {
    const oldCars = cars
    const nextCar = { ...car, ...patch }
    setCars(current => current.map(item => item.id === car.id ? nextCar : item))
    try {
      const saved = await readJson(await fetch(`/api/ihale/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextCar)
      }))
      setCars(current => current.map(item => item.id === car.id ? { ...saved, tasks: nextCar.tasks || [] } : item))
    } catch (error) {
      setCars(oldCars)
      setErrorMessage(error.message || 'Araç güncellenemedi.')
    }
  }

  async function useStock(car, stockId) {
    const stock = stockItems.find(item => item.id === stockId)
    if (!stock) return
    const qty = Number(stock.quantity || 0)
    if (qty <= 0) return alert('Bu ürün stokta yok.')

    const nextQty = qty - 1
    const updatedStock = {
      ...stock,
      quantity: nextQty,
      status: nextQty <= 0 ? 'kullanildi' : stock.status,
      note: [stock.note || '', `${new Date().toLocaleString('tr-TR')} - ${car.title} için kullanıldı.`].filter(Boolean).join('\n')
    }
    const nextCar = {
      ...car,
      boughtParts: [
        ...(car.boughtParts || []),
        {
          name: [stock.brand, stock.productName, stock.partCode].filter(Boolean).join(' - '),
          price: stock.buyPrice || stock.salePrice || 0,
          buyer: 'Stoktan'
        }
      ]
    }

    const oldCars = cars
    const oldStocks = stockItems
    setStockItems(current => current.map(item => item.id === stock.id ? updatedStock : item))
    setCars(current => current.map(item => item.id === car.id ? nextCar : item))

    try {
      await readJson(await fetch(`/api/stok/${stock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStock)
      }))
      const saved = await readJson(await fetch(`/api/ihale/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextCar)
      }))
      setCars(current => current.map(item => item.id === car.id ? { ...saved, tasks: nextCar.tasks || [] } : item))
    } catch (error) {
      setCars(oldCars)
      setStockItems(oldStocks)
      setErrorMessage(error.message || 'Stoktan kullanım kaydedilemedi.')
    }
  }

  const summary = useMemo(() => {
    const total = cars.reduce((sum, car) => sum + totalCost(car), 0)
    const sold = cars.filter(car => car.status === 'satildi').reduce((sum, car) => sum + toNumber(car.salePrice), 0)
    return { total, sold, count: cars.length, ready: cars.filter(car => car.status === 'hazir').length }
  }, [cars])

  return <main className="page">
    <section className="switchBar">
      <a className="active" href="/ihale">İhale Sayfasına Geç</a>
      <a href="/stok">Stok Sayfasına Geç</a>
    </section>

    <section className="summaryGrid">
      <div><span>Araç Sayısı</span><strong>{summary.count}</strong></div>
      <div><span>Hazır</span><strong>{summary.ready}</strong></div>
      <div><span>Toplam Maliyet</span><strong>{formatMoney(summary.total)}</strong></div>
      <div><span>Toplam Satış</span><strong>{formatMoney(summary.sold)}</strong></div>
    </section>

    {errorMessage ? <div className="errorBox">{errorMessage}</div> : null}

    <section className="wrap">
      <form className="panel" onSubmit={addCar}>
        <h2>Araç Ekle</h2>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Araç adı" />
        <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Marka" />
        <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Model" />
        <input value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} placeholder="Plaka" />
        <input value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} placeholder="Araç bedeli" />
        <button className="primary">Kaydet</button>
      </form>

      <section className="panel">
        <div className="listHead"><h2>Araçlar</h2><button onClick={loadAll}>Yenile</button></div>
        {loading ? <div className="empty">Yükleniyor...</div> : null}
        {!loading && cars.length === 0 ? <div className="empty">Araç kaydı yok.</div> : null}
        <div className="cards">
          {cars.map(car => <article className="card" key={car.id}>
            <div className="cardTop">
              <h3>{car.title}</h3>
              <select value={car.status || 'gelecek'} onChange={e => updateCar(car, { status: e.target.value })}>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
            </div>
            <p>{[car.brand, car.model, car.plate].filter(Boolean).join(' • ') || 'Araç bilgisi yok'}</p>
            <div className="mini"><span>Maliyet: <b>{formatMoney(totalCost(car))}</b></span><span>Satış: <b>{formatMoney(toNumber(car.salePrice))}</b></span></div>
            <div className="stockUse">
              <select defaultValue="" onChange={e => { if (e.target.value) { useStock(car, e.target.value); e.target.value = '' } }}>
                <option value="">Stoktan parça ekle</option>
                {stockItems.filter(item => Number(item.quantity || 0) > 0).map(item => <option key={item.id} value={item.id}>{item.brand} - {item.productName} | Stok: {item.quantity}</option>)}
              </select>
            </div>
            {(car.boughtParts || []).length ? <ul>{car.boughtParts.map((part, index) => <li key={part.id || index}>{part.name} - {formatMoney(toNumber(part.price))}</li>)}</ul> : null}
          </article>)}
        </div>
      </section>
    </section>

    <style jsx>{`
      .page{min-height:100vh;background:#f4f6fb;color:#151821;padding:22px;font-family:Inter,Arial,sans-serif}.switchBar{max-width:1320px;margin:0 auto 14px;display:flex;gap:10px;flex-wrap:wrap}.switchBar a{background:#151821;color:#fff;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:950}.switchBar .active{background:#f32334}.summaryGrid{max-width:1320px;margin:0 auto 16px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.summaryGrid div,.panel{background:#fff;border:1px solid #e5e8ef;border-radius:22px;padding:18px;box-shadow:0 16px 50px rgba(31,35,45,.05)}.summaryGrid span{display:block;color:#687080;font-size:13px;font-weight:800;margin-bottom:7px}.summaryGrid strong{font-size:22px}.errorBox{max-width:1320px;margin:0 auto 14px;background:#fff0f1;color:#b91523;border-radius:16px;padding:14px;font-weight:900}.wrap{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:360px 1fr;gap:18px;align-items:start}h2{margin:0 0 14px}input,select{width:100%;height:42px;border:1px solid #dde2ec;background:#f8f9fc;border-radius:13px;padding:0 11px;color:#151821;margin-bottom:10px}.primary,.listHead button{border:0;border-radius:999px;font-weight:950;cursor:pointer}.primary{width:100%;height:48px;background:#f32334;color:#fff}.listHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.listHead button{background:#151821;color:#fff;padding:10px 14px}.cards{display:grid;gap:12px}.card{border:1px solid #e5e8ef;border-radius:18px;background:#fbfcff;padding:15px}.cardTop{display:flex;justify-content:space-between;gap:10px;align-items:center}.card h3{margin:0}.card p{margin:8px 0;color:#697386}.mini{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.mini span{background:#eef1f6;border-radius:999px;padding:7px 10px;font-size:13px}.stockUse{margin-top:10px}.empty{background:#f8f9fb;border-radius:16px;padding:16px;color:#687080}ul{margin:10px 0 0;padding-left:20px;color:#4b5563}@media(max-width:980px){.page{padding:14px}.switchBar a{flex:1;text-align:center}.summaryGrid,.wrap{grid-template-columns:1fr}.summaryGrid{grid-template-columns:1fr 1fr}}
    `}</style>
  </main>
}
