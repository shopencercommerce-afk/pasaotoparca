import { useEffect, useMemo, useState } from 'react'
import SiteLayout, { formatPrice } from '../components/SiteLayout'

const people = ['Mustafa', 'Bedirhan', 'Ömer']
const brands = ['Togg', 'Tesla']
const statuses = { stok: 'Stokta', satildi: 'Satıldı', kullanildi: 'Kendimiz kullandık' }
const emptyForm = { brand: 'Togg', productName: '', partCode: '', quantity: 1, buyPrice: '', salePrice: '', boughtBy: 'Mustafa', source: '', status: 'stok', note: '' }

function numberValue(value) { return Number(String(value || '').replace(',', '.')) || 0 }
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
      setErrorMessage('Stok kayıtları veritabanından okunamadı.')
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

  const totals = useMemo(() => items.reduce((acc, item) => {
    const qty = numberValue(item.quantity)
    const buy = numberValue(item.buyPrice) * qty
    const sale = numberValue(item.salePrice) * qty
    acc.stockCount += item.status === 'stok' ? qty : 0
    acc.totalCost += buy
    if (item.status === 'satildi') acc.totalSales += sale
    if (item.status === 'satildi') acc.totalProfit += sale - buy
    if (item.status === 'kullanildi') acc.usedCost += buy
    return acc
  }, { stockCount: 0, totalCost: 0, totalSales: 0, totalProfit: 0, usedCost: 0 }), [items])

  function handleChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })) }

  async function addItem(e) {
    e.preventDefault()
    if (!form.productName.trim()) return alert('Ürün adını yazmalısın.')
    setSaving(true)
    setErrorMessage('')
    try {
      const created = await parseResponse(await fetch('/api/stok', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }))
      setItems(prev => [created, ...prev])
      setForm(emptyForm)
    } catch (error) { setErrorMessage(error.message || 'Stok kaydı eklenemedi.') } finally { setSaving(false) }
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

  return <SiteLayout>
    <section className="panelTop">
      <div className="pageSwitch">
        <a href="/ihale">İhale Sayfasına Geç</a>
        <a className="active" href="/stok">Stok Sayfasına Geç</a>
      </div>
      <div className="stockBadge"><strong>{totals.stockCount}</strong><span>Stoktaki adet</span></div>
    </section>

    <section className="summaryGrid">
      <div><span>Toplam Alış</span><strong>{formatPrice(totals.totalCost)}</strong></div>
      <div><span>Toplam Satış</span><strong>{formatPrice(totals.totalSales)}</strong></div>
      <div><span>Kâr / Zarar</span><strong className={totals.totalProfit >= 0 ? 'good' : 'bad'}>{formatPrice(totals.totalProfit)}</strong></div>
      <div><span>Kendi Kullanım</span><strong>{formatPrice(totals.usedCost)}</strong></div>
    </section>

    {errorMessage && <div className="errorBox">{errorMessage}</div>}

    <section className="stockWrap">
      <form className="stockForm" onSubmit={addItem}>
        <h2>Yeni Ürün Ekle</h2>
        <div className="formGrid">
          <label>Marka<select name="brand" value={form.brand} onChange={handleChange}>{brands.map(brand => <option key={brand}>{brand}</option>)}</select></label>
          <label>Ürün adı<input name="productName" value={form.productName} onChange={handleChange} placeholder="Örn: Tesla far beyni" /></label>
          <label>Parça kodu<input name="partCode" value={form.partCode} onChange={handleChange} placeholder="Varsa kod" /></label>
          <label>Adet<input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} /></label>
          <label>Alış fiyatı<input name="buyPrice" type="number" step="0.01" value={form.buyPrice} onChange={handleChange} placeholder="₺" /></label>
          <label>Satış fiyatı<input name="salePrice" type="number" step="0.01" value={form.salePrice} onChange={handleChange} placeholder="₺" /></label>
          <label>Kim aldı?<select name="boughtBy" value={form.boughtBy} onChange={handleChange}>{people.map(person => <option key={person}>{person}</option>)}</select></label>
          <label>Nereden alındı?<input name="source" value={form.source} onChange={handleChange} placeholder="Tedarikçi / şehir" /></label>
          <label>Durum<select name="status" value={form.status} onChange={handleChange}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <label className="wide">Not<input name="note" value={form.note} onChange={handleChange} placeholder="Araç, raf bilgisi vb." /></label>
        </div>
        <button type="submit" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Stoka Ekle'}</button>
      </form>

      <div className="stockList">
        <div className="listHead"><div><h2>Stok Kayıtları</h2><p>{loading ? 'Yükleniyor...' : `${filteredItems.length} kayıt gösteriliyor`}</p></div><button type="button" onClick={loadItems}>Yenile</button></div>
        <div className="filters"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ürün, kod, tedarikçi veya kişi ara" /><select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}><option>Tümü</option>{brands.map(brand => <option key={brand}>{brand}</option>)}</select><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option>Tümü</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
        <div className="cards">
          {!loading && filteredItems.length === 0 && <div className="empty">Henüz kayıt yok.</div>}
          {loading && <div className="empty">Stok kayıtları yükleniyor...</div>}
          {filteredItems.map(item => {
            const qty = numberValue(item.quantity)
            const buyTotal = numberValue(item.buyPrice) * qty
            const saleTotal = numberValue(item.salePrice) * qty
            const profit = saleTotal - buyTotal
            return <article className={qty <= 0 ? 'stockCard emptyStock' : 'stockCard'} key={item.id}>
              <div className="cardTop"><span>{item.brand}</span><select value={item.status} onChange={e => updateItem(item.id, { status: e.target.value })}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
              <h3>{item.productName}</h3>
              <p>{item.partCode ? `Kod: ${item.partCode}` : 'Parça kodu girilmedi'}</p>
              <div className="miniInfo"><span>Adet: <b>{qty}</b></span><span>Alan: <b>{item.boughtBy || '-'}</b></span><span>Kaynak: <b>{item.source || '-'}</b></span></div>
              <div className="priceGrid"><div><small>Alış</small><strong>{formatPrice(buyTotal)}</strong></div><div><small>Satış</small><input value={item.salePrice || ''} onChange={e => updateItem(item.id, { salePrice: e.target.value })} placeholder="₺" /></div><div><small>Kâr/Zarar</small><strong className={profit >= 0 ? 'good' : 'bad'}>{item.status === 'satildi' ? formatPrice(profit) : '-'}</strong></div></div>
              {item.note && <p className="note">{item.note}</p>}
              <button type="button" className="delete" onClick={() => removeItem(item.id)}>Sil</button>
            </article>
          })}
        </div>
      </div>
    </section>

    <style jsx>{`
      .panelTop{max-width:1320px;margin:0 auto;padding:34px 56px 18px;display:flex;align-items:center;justify-content:space-between;gap:16px}.pageSwitch{display:flex;gap:10px;flex-wrap:wrap}.pageSwitch a{background:#151821;color:#fff;border-radius:999px;padding:13px 18px;font-weight:950}.pageSwitch a.active{background:#f32334}.stockBadge{background:#fff;border:1px solid #e5e8ef;border-radius:22px;padding:14px 20px;box-shadow:0 16px 50px rgba(31,35,45,.06)}.stockBadge strong{display:block;font-size:30px}.stockBadge span{color:#687080;font-size:13px;font-weight:800}.summaryGrid{max-width:1320px;margin:0 auto;padding:0 56px 22px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.summaryGrid div,.stockForm,.stockList{background:#fff;border:1px solid #e5e8ef;border-radius:24px;padding:20px;box-shadow:0 18px 56px rgba(31,35,45,.05)}.summaryGrid span{display:block;color:#707682;font-weight:800;font-size:13px;margin-bottom:8px}.summaryGrid strong{font-size:23px}.good{color:#138a3d!important}.bad{color:#d12b2b!important}.errorBox{max-width:1208px;margin:0 auto 18px;background:#fff0f1;color:#b91523;border:1px solid #ffd0d5;border-radius:18px;padding:14px 18px;font-weight:900}.stockWrap{max-width:1320px;margin:0 auto;padding:0 56px 54px;display:grid;grid-template-columns:420px minmax(0,1fr);gap:20px;align-items:start}h2{margin:0 0 16px;font-size:26px}.formGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.formGrid label{display:grid;gap:7px;color:#59606d;font-size:13px;font-weight:900}.formGrid .wide{grid-column:1/-1}input,select{width:100%;height:44px;border:1px solid #dfe3eb;border-radius:14px;background:#f8f9fb;padding:0 12px;color:#252733;outline:none}.stockForm button,.listHead button,.delete{border:0;border-radius:999px;font-weight:950;cursor:pointer}.stockForm button{width:100%;height:50px;margin-top:16px;background:#f32334;color:#fff}.listHead{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:14px}.listHead p{margin:4px 0 0;color:#707682}.listHead button{background:#151821;color:#fff;padding:11px 15px}.filters{display:grid;grid-template-columns:1fr 150px 180px;gap:10px;margin-bottom:14px}.cards{display:grid;gap:12px}.stockCard{border:1px solid #e5e8ef;border-radius:20px;padding:16px;background:#fbfcff}.emptyStock{opacity:.72;background:#f4f5f7}.cardTop{display:flex;justify-content:space-between;gap:10px;align-items:center}.cardTop span{background:#151821;color:#fff;border-radius:999px;padding:7px 10px;font-weight:900;font-size:12px}.stockCard h3{margin:12px 0 6px}.stockCard p{margin:0;color:#697386}.miniInfo{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.miniInfo span{background:#f0f2f6;border-radius:999px;padding:7px 10px;color:#525a66;font-size:13px}.priceGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.priceGrid div{background:#fff;border:1px solid #e5e8ef;border-radius:16px;padding:12px}.priceGrid small{display:block;color:#7a828f;margin-bottom:6px}.note{margin-top:12px!important;background:#fff7e8;border-radius:14px;padding:10px;color:#7a5512!important}.delete{margin-top:12px;background:#fee2e2;color:#991b1b;padding:9px 13px}.empty{background:#f8f9fb;border-radius:18px;padding:18px;color:#687080}@media(max-width:980px){.panelTop{padding:18px 14px;display:grid}.pageSwitch a{text-align:center;flex:1}.summaryGrid,.stockWrap{padding-left:14px;padding-right:14px;grid-template-columns:1fr}.summaryGrid{grid-template-columns:1fr 1fr}.formGrid,.filters,.priceGrid{grid-template-columns:1fr}.stockBadge{width:100%}}
    `}</style>
  </SiteLayout>
}
