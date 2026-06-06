import { useEffect, useMemo, useState } from 'react'

const people = ['Mustafa', 'Bedirhan', 'Ömer']
const brands = ['Togg', 'Tesla']
const statuses = { stok: 'Stokta', satildi: 'Satıldı', kullanildi: 'Kendimiz kullandık' }
const emptyForm = { brand: 'Togg', productName: '', partCode: '', quantity: 1, buyPrice: '', salePrice: '', boughtBy: 'Mustafa', source: '', status: 'stok', note: '' }

function numberValue(value) { return Number(String(value || '').replace(',', '.')) || 0 }
function formatPrice(value) { return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value || 0)} TL` }
async function parseResponse(response) { const data = await response.json().catch(() => null); if (!response.ok) throw new Error(data?.error || 'İşlem başarısız oldu'); return data }

export default function StokPanel() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [filterBrand, setFilterBrand] = useState('Tümü')
  const [filterStatus, setFilterStatus] = useState('Tümü')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => { loadItems() }, [])

  async function loadItems() {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await parseResponse(await fetch('/api/stok'))
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      setErrorMessage('Stok kayıtları okunamadı.')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(item => {
      const brandOk = filterBrand === 'Tümü' || item.brand === filterBrand
      const statusOk = filterStatus === 'Tümü' || item.status === filterStatus
      const text = `${item.productName || ''} ${item.partCode || ''} ${item.source || ''} ${item.boughtBy || ''} ${item.note || ''}`.toLowerCase()
      return brandOk && statusOk && (!q || text.includes(q))
    })
  }, [items, filterBrand, filterStatus, query])

  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      const qty = numberValue(item.quantity)
      const buy = numberValue(item.buyPrice) * qty
      const sale = numberValue(item.salePrice) * qty
      if (item.status === 'stok') acc.stockCount += qty
      acc.totalCost += buy
      if (item.status === 'satildi') acc.totalSales += sale
      if (item.status === 'satildi') acc.totalProfit += sale - buy
      if (item.status === 'kullanildi') acc.usedCost += buy
      return acc
    }, { stockCount: 0, totalCost: 0, totalSales: 0, totalProfit: 0, usedCost: 0 })
  }, [items])

  function handleChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }

  async function addItem(e) {
    e.preventDefault()
    if (!form.productName.trim()) return alert('Ürün adını yazmalısın.')
    setSaving(true)
    setErrorMessage('')
    try {
      const created = await parseResponse(await fetch('/api/stok', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }))
      setItems(prev => [created, ...prev])
      setForm(emptyForm)
    } catch (error) {
      setErrorMessage(error.message || 'Stok kaydı eklenemedi.')
    } finally {
      setSaving(false)
    }
  }

  async function updateItem(id, patch) {
    const oldItems = items
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item))
    try {
      const updated = await parseResponse(await fetch(`/api/stok/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }))
      setItems(prev => prev.map(item => item.id === id ? updated : item))
    } catch (error) {
      setItems(oldItems)
      setErrorMessage(error.message || 'Stok kaydı güncellenemedi.')
    }
  }

  async function removeItem(id) {
    if (!confirm('Bu stok kaydı silinsin mi?')) return
    const oldItems = items
    setItems(prev => prev.filter(item => item.id !== id))
    try { await parseResponse(await fetch(`/api/stok/${id}`, { method: 'DELETE' })) } catch (error) { setItems(oldItems); setErrorMessage(error.message || 'Stok kaydı silinemedi.') }
  }

  return <main className="page">
    <section className="switchBar">
      <a href="/ihale">İhale Sayfasına Geç</a>
      <a className="active" href="/stok">Stok Sayfasına Geç</a>
    </section>

    <section className="summaryGrid">
      <div><span>Stoktaki Adet</span><strong>{totals.stockCount}</strong></div>
      <div><span>Toplam Alış</span><strong>{formatPrice(totals.totalCost)}</strong></div>
      <div><span>Toplam Satış</span><strong>{formatPrice(totals.totalSales)}</strong></div>
      <div><span>Kâr / Zarar</span><strong className={totals.totalProfit >= 0 ? 'good' : 'bad'}>{formatPrice(totals.totalProfit)}</strong></div>
    </section>

    {errorMessage ? <div className="errorBox">{errorMessage}</div> : null}

    <section className="stockWrap">
      <form className="panel" onSubmit={addItem}>
        <h2>Yeni Ürün Ekle</h2>
        <div className="formGrid">
          <label>Marka<select name="brand" value={form.brand} onChange={handleChange}>{brands.map(brand => <option key={brand}>{brand}</option>)}</select></label>
          <label>Ürün adı<input name="productName" value={form.productName} onChange={handleChange} /></label>
          <label>Parça kodu<input name="partCode" value={form.partCode} onChange={handleChange} /></label>
          <label>Adet<input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} /></label>
          <label>Alış fiyatı<input name="buyPrice" type="number" step="0.01" value={form.buyPrice} onChange={handleChange} /></label>
          <label>Satış fiyatı<input name="salePrice" type="number" step="0.01" value={form.salePrice} onChange={handleChange} /></label>
          <label>Kim aldı?<select name="boughtBy" value={form.boughtBy} onChange={handleChange}>{people.map(person => <option key={person}>{person}</option>)}</select></label>
          <label>Nereden alındı?<input name="source" value={form.source} onChange={handleChange} /></label>
          <label>Durum<select name="status" value={form.status} onChange={handleChange}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="wide">Not<input name="note" value={form.note} onChange={handleChange} /></label>
        </div>
        <button className="primary" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Stoka Ekle'}</button>
      </form>

      <section className="panel">
        <div className="listHead"><h2>Stok Kayıtları</h2><button onClick={loadItems}>Yenile</button></div>
        <div className="filters"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ara" /><select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}><option>Tümü</option>{brands.map(brand => <option key={brand}>{brand}</option>)}</select><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option>Tümü</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
        <div className="cards">
          {loading ? <div className="empty">Yükleniyor...</div> : null}
          {!loading && filteredItems.length === 0 ? <div className="empty">Kayıt yok.</div> : null}
          {filteredItems.map(item => {
            const qty = numberValue(item.quantity)
            const buyTotal = numberValue(item.buyPrice) * qty
            const saleTotal = numberValue(item.salePrice) * qty
            const profit = saleTotal - buyTotal
            return <article className={qty <= 0 ? 'card emptyStock' : 'card'} key={item.id}>
              <div className="cardTop"><b>{item.brand}</b><select value={item.status} onChange={e => updateItem(item.id, { status: e.target.value })}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
              <h3>{item.productName}</h3>
              <p>{item.partCode ? `Kod: ${item.partCode}` : 'Kod yok'}</p>
              <div className="mini"><span>Adet: <b>{qty}</b></span><span>Alan: <b>{item.boughtBy || '-'}</b></span><span>Kaynak: <b>{item.source || '-'}</b></span></div>
              <div className="priceGrid"><div><small>Alış</small><strong>{formatPrice(buyTotal)}</strong></div><div><small>Satış</small><input value={item.salePrice || ''} onChange={e => updateItem(item.id, { salePrice: e.target.value })} /></div><div><small>Kâr/Zarar</small><strong className={profit >= 0 ? 'good' : 'bad'}>{item.status === 'satildi' ? formatPrice(profit) : '-'}</strong></div></div>
              {item.note ? <p className="note">{item.note}</p> : null}
              <button className="delete" onClick={() => removeItem(item.id)}>Sil</button>
            </article>
          })}
        </div>
      </section>
    </section>

    <style jsx>{`
      .page{min-height:100vh;background:#f4f6fb;color:#151821;padding:22px;font-family:Inter,Arial,sans-serif}.switchBar{max-width:1320px;margin:0 auto 14px;display:flex;gap:10px;flex-wrap:wrap}.switchBar a{background:#151821;color:#fff;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:950}.switchBar .active{background:#f32334}.summaryGrid{max-width:1320px;margin:0 auto 16px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.summaryGrid div,.panel{background:#fff;border:1px solid #e5e8ef;border-radius:22px;padding:18px;box-shadow:0 16px 50px rgba(31,35,45,.05)}.summaryGrid span{display:block;color:#687080;font-size:13px;font-weight:800;margin-bottom:7px}.summaryGrid strong{font-size:22px}.good{color:#138a3d}.bad{color:#d12b2b}.errorBox{max-width:1320px;margin:0 auto 14px;background:#fff0f1;color:#b91523;border-radius:16px;padding:14px;font-weight:900}.stockWrap{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:420px 1fr;gap:18px;align-items:start}h2{margin:0 0 14px}.formGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}label{display:grid;gap:6px;color:#59606d;font-size:13px;font-weight:900}.wide{grid-column:1/-1}input,select{height:42px;border:1px solid #dde2ec;background:#f8f9fc;border-radius:13px;padding:0 11px;color:#151821}.primary,.listHead button,.delete{border:0;border-radius:999px;font-weight:950;cursor:pointer}.primary{width:100%;height:48px;margin-top:14px;background:#f32334;color:#fff}.listHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.listHead button{background:#151821;color:#fff;padding:10px 14px}.filters{display:grid;grid-template-columns:1fr 140px 170px;gap:10px;margin-bottom:12px}.cards{display:grid;gap:12px}.card{border:1px solid #e5e8ef;border-radius:18px;background:#fbfcff;padding:15px}.emptyStock{opacity:.65}.cardTop{display:flex;justify-content:space-between;gap:10px;align-items:center}.cardTop b{background:#151821;color:#fff;border-radius:999px;padding:7px 10px;font-size:12px}.card h3{margin:12px 0 5px}.card p{margin:0;color:#697386}.mini{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.mini span{background:#eef1f6;border-radius:999px;padding:7px 10px;font-size:13px}.priceGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.priceGrid div{background:#fff;border:1px solid #e5e8ef;border-radius:14px;padding:10px}.priceGrid small{display:block;color:#7a828f;margin-bottom:6px}.note{margin-top:12px!important;background:#fff7e8;border-radius:14px;padding:10px;color:#7a5512!important}.delete{margin-top:12px;background:#fee2e2;color:#991b1b;padding:9px 13px}.empty{background:#f8f9fb;border-radius:16px;padding:16px;color:#687080}@media(max-width:980px){.page{padding:14px}.switchBar a{flex:1;text-align:center}.summaryGrid,.stockWrap,.formGrid,.filters,.priceGrid{grid-template-columns:1fr}.summaryGrid{grid-template-columns:1fr 1fr}}
    `}</style>
  </main>
}
