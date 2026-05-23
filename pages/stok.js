import { useEffect, useMemo, useState } from 'react'
import SiteLayout, { formatPrice } from '../components/SiteLayout'

const people = ['Mustafa', 'Bedirhan', 'Ömer']
const brands = ['Togg', 'Tesla']
const statuses = {
  stok: 'Stokta',
  satildi: 'Satıldı',
  kullanildi: 'Kendimiz kullandık'
}

const emptyForm = {
  brand: 'Togg',
  productName: '',
  partCode: '',
  quantity: 1,
  buyPrice: '',
  salePrice: '',
  boughtBy: 'Mustafa',
  source: '',
  status: 'stok',
  note: ''
}

function numberValue(value) {
  return Number(String(value || '').replace(',', '.')) || 0
}

async function parseResponse(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error || 'İşlem başarısız oldu')
  }
  return data
}

export default function StokPanel() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [filterBrand, setFilterBrand] = useState('Tümü')
  const [filterStatus, setFilterStatus] = useState('Tümü')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    setErrorMessage('')
    try {
      const response = await fetch('/api/stok')
      const data = await parseResponse(response)
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Stok kayıtları okunamadı', error)
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

  const totals = useMemo(() => {
    return items.reduce((acc, item) => {
      const qty = numberValue(item.quantity) || 1
      const buy = numberValue(item.buyPrice) * qty
      const sale = numberValue(item.salePrice) * qty
      acc.stockCount += item.status === 'stok' ? qty : 0
      acc.totalCost += buy
      if (item.status === 'satildi') acc.totalSales += sale
      if (item.status === 'satildi') acc.totalProfit += sale - buy
      if (item.status === 'kullanildi') acc.usedCost += buy
      return acc
    }, { stockCount: 0, totalCost: 0, totalSales: 0, totalProfit: 0, usedCost: 0 })
  }, [items])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function addItem(e) {
    e.preventDefault()
    if (!form.productName.trim()) return alert('Ürün adını yazmalısın.')

    setSaving(true)
    setErrorMessage('')
    try {
      const response = await fetch('/api/stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const created = await parseResponse(response)
      setItems(prev => [created, ...prev])
      setForm(emptyForm)
    } catch (error) {
      console.error('Stok kaydı eklenemedi', error)
      setErrorMessage(error.message || 'Stok kaydı eklenemedi.')
    } finally {
      setSaving(false)
    }
  }

  async function updateItem(id, patch) {
    setErrorMessage('')
    const oldItems = items
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item))

    try {
      const response = await fetch(`/api/stok/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      })
      const updated = await parseResponse(response)
      setItems(prev => prev.map(item => item.id === id ? updated : item))
    } catch (error) {
      console.error('Stok kaydı güncellenemedi', error)
      setItems(oldItems)
      setErrorMessage(error.message || 'Stok kaydı güncellenemedi.')
    }
  }

  function updateStatus(id, status) {
    updateItem(id, { status })
  }

  function updateSalePrice(id, salePrice) {
    updateItem(id, { salePrice })
  }

  async function removeItem(id) {
    if (!confirm('Bu stok kaydı silinsin mi?')) return

    setErrorMessage('')
    const oldItems = items
    setItems(prev => prev.filter(item => item.id !== id))

    try {
      const response = await fetch(`/api/stok/${id}`, { method: 'DELETE' })
      await parseResponse(response)
    } catch (error) {
      console.error('Stok kaydı silinemedi', error)
      setItems(oldItems)
      setErrorMessage(error.message || 'Stok kaydı silinemedi.')
    }
  }

  return (
    <SiteLayout>
      <section className="stockHero">
        <div>
          <span>PAŞA OTO PARÇA</span>
          <h1>Stok Yönetim Paneli</h1>
          <p>Togg ve Tesla parçalarını; kim aldı, nereden alındı, satış/kullanım durumu ve kâr-zarar hesabı ile veritabanında takip edin.</p>
        </div>
        <div className="heroCard">
          <strong>{totals.stockCount}</strong>
          <small>Stoktaki adet</small>
        </div>
      </section>

      <section className="summaryGrid">
        <div><span>Toplam Alış</span><strong>{formatPrice(totals.totalCost)}</strong></div>
        <div><span>Toplam Satış</span><strong>{formatPrice(totals.totalSales)}</strong></div>
        <div><span>Kâr / Zarar</span><strong className={totals.totalProfit >= 0 ? 'good' : 'bad'}>{formatPrice(totals.totalProfit)}</strong></div>
        <div><span>Kendi Kullanım Maliyeti</span><strong>{formatPrice(totals.usedCost)}</strong></div>
      </section>

      {errorMessage && <div className="errorBox">{errorMessage}</div>}

      <section className="stockWrap">
        <form className="stockForm" onSubmit={addItem}>
          <h2>Yeni ürün ekle</h2>
          <div className="formGrid">
            <label>Marka<select name="brand" value={form.brand} onChange={handleChange}>{brands.map(brand => <option key={brand}>{brand}</option>)}</select></label>
            <label>Ürün adı<input name="productName" value={form.productName} onChange={handleChange} placeholder="Örn: Tesla far beyni" /></label>
            <label>Parça kodu<input name="partCode" value={form.partCode} onChange={handleChange} placeholder="Varsa kod" /></label>
            <label>Adet<input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} /></label>
            <label>Alış fiyatı<input name="buyPrice" type="number" step="0.01" value={form.buyPrice} onChange={handleChange} placeholder="₺" /></label>
            <label>Satış fiyatı<input name="salePrice" type="number" step="0.01" value={form.salePrice} onChange={handleChange} placeholder="₺" /></label>
            <label>Kim aldı?<select name="boughtBy" value={form.boughtBy} onChange={handleChange}>{people.map(person => <option key={person}>{person}</option>)}</select></label>
            <label>Nereden alındı?<input name="source" value={form.source} onChange={handleChange} placeholder="Tedarikçi / çıkmacı / şehir" /></label>
            <label>Durum<select name="status" value={form.status} onChange={handleChange}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <label className="wide">Not<input name="note" value={form.note} onChange={handleChange} placeholder="Araç, müşteri, raf bilgisi vb." /></label>
          </div>
          <button type="submit" disabled={saving}>{saving ? 'Kaydediliyor...' : 'Stoka ekle'}</button>
        </form>

        <div className="stockList">
          <div className="listHead">
            <div>
              <h2>Stok kayıtları</h2>
              <p>{loading ? 'Yükleniyor...' : `${filteredItems.length} kayıt gösteriliyor`}</p>
            </div>
            <button type="button" className="refresh" onClick={loadItems}>Yenile</button>
          </div>

          <div className="filters">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ürün, kod, tedarikçi veya kişi ara" />
            <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}><option>Tümü</option>{brands.map(brand => <option key={brand}>{brand}</option>)}</select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option>Tümü</option>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
          </div>

          <div className="cards">
            {!loading && filteredItems.length === 0 && <div className="empty">Henüz kayıt yok. İlk parçayı soldaki formdan ekleyebilirsin.</div>}
            {loading && <div className="empty">Stok kayıtları veritabanından yükleniyor...</div>}
            {filteredItems.map(item => {
              const qty = numberValue(item.quantity) || 1
              const buyTotal = numberValue(item.buyPrice) * qty
              const saleTotal = numberValue(item.salePrice) * qty
              const profit = saleTotal - buyTotal
              return <article className="stockCard" key={item.id}>
                <div className="cardTop">
                  <span className="brand">{item.brand}</span>
                  <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}>{Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
                </div>
                <h3>{item.productName}</h3>
                <p>{item.partCode ? `Kod: ${item.partCode}` : 'Parça kodu girilmedi'}</p>
                <div className="miniInfo">
                  <span>Adet: <b>{qty}</b></span>
                  <span>Alan: <b>{item.boughtBy || '-'}</b></span>
                  <span>Kaynak: <b>{item.source || '-'}</b></span>
                </div>
                <div className="priceGrid">
                  <div><small>Alış</small><strong>{formatPrice(buyTotal)}</strong></div>
                  <div><small>Satış</small><input value={item.salePrice || ''} onChange={e => updateSalePrice(item.id, e.target.value)} placeholder="₺" /></div>
                  <div><small>Kâr/Zarar</small><strong className={profit >= 0 ? 'good' : 'bad'}>{item.status === 'satildi' ? formatPrice(profit) : '-'}</strong></div>
                </div>
                {item.note && <p className="note">{item.note}</p>}
                <button type="button" className="delete" onClick={() => removeItem(item.id)}>Sil</button>
              </article>
            })}
          </div>
        </div>
      </section>

      <style jsx>{`
        .stockHero{max-width:1320px;margin:0 auto;padding:54px 56px 24px;display:flex;justify-content:space-between;gap:24px;align-items:flex-end}.stockHero span{color:#f32334;font-size:12px;font-weight:950;letter-spacing:1.5px}.stockHero h1{font-size:clamp(42px,5vw,66px);letter-spacing:-2.5px;line-height:1;margin:12px 0}.stockHero p{max-width:760px;color:#5f6570;font-size:18px;line-height:1.7;margin:0}.heroCard{background:#151821;color:#fff;border-radius:30px;padding:28px 34px;min-width:190px;box-shadow:0 26px 70px rgba(0,0,0,.16)}.heroCard strong{display:block;font-size:48px}.heroCard small{color:#cfd3dc}.summaryGrid{max-width:1320px;margin:0 auto;padding:0 56px 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.summaryGrid div{background:#fff;border:1px solid #e5e8ef;border-radius:24px;padding:22px;box-shadow:0 18px 56px rgba(31,35,45,.05)}.summaryGrid span{display:block;color:#707682;font-weight:800;font-size:13px;margin-bottom:8px}.summaryGrid strong{font-size:24px}.good{color:#138a3d!important}.bad{color:#d12b2b!important}.errorBox{max-width:1208px;margin:0 auto 18px;background:#fff0f1;color:#b91523;border:1px solid #ffd0d5;border-radius:18px;padding:14px 18px;font-weight:900}.stockWrap{max-width:1320px;margin:0 auto;padding:0 56px 54px;display:grid;grid-template-columns:430px minmax(0,1fr);gap:22px;align-items:start}.stockForm,.stockList{background:#fff;border:1px solid #e5e8ef;border-radius:30px;padding:24px;box-shadow:0 22px 70px rgba(31,35,45,.06)}h2{margin:0 0 18px;font-size:28px;letter-spacing:-.8px}.formGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.formGrid label{display:grid;gap:7px;color:#59606d;font-size:13px;font-weight:900}.formGrid .wide{grid-column:1/-1}input,select{width:100%;height:46px;border:1px solid #dfe3eb;border-radius:15px;background:#f8f9fb;padding:0 13px;color:#252733;outline:none}input:focus,select:focus{border-color:#f32334;background:#fff}.stockForm button,.refresh,.delete{border:0;border-radius:999px;font-weight:950;cursor:pointer}.stockForm button{width:100%;height:52px;margin-top:18px;background:#151821;color:#fff}.stockForm button:disabled{opacity:.65;cursor:not-allowed}.listHead{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:16px}.listHead p{margin:-8px 0 0;color:#767c87}.refresh{background:#eef2ff;color:#1d3478;padding:12px 16px}.filters{display:grid;grid-template-columns:minmax(0,1fr) 140px 170px;gap:10px;margin-bottom:16px}.cards{display:grid;gap:14px}.empty{border:1px dashed #cdd2dd;border-radius:22px;padding:28px;text-align:center;color:#767c87;background:#fafbfc}.stockCard{border:1px solid #e7eaf1;border-radius:24px;padding:18px;background:#fbfcfd}.cardTop{display:flex;justify-content:space-between;align-items:center;gap:12px}.brand{background:#151821;color:#fff;border-radius:999px;padding:8px 12px;font-weight:950;font-size:12px}.cardTop select{max-width:190px;height:40px}.stockCard h3{font-size:22px;margin:16px 0 6px;letter-spacing:-.6px}.stockCard p{color:#68707c;margin:0 0 12px}.miniInfo{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}.miniInfo span{background:#f1f3f7;border-radius:999px;padding:8px 11px;color:#59606d;font-size:13px}.priceGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.priceGrid>div{background:#fff;border:1px solid #e6e9f0;border-radius:18px;padding:13px}.priceGrid small{display:block;color:#7b818c;font-weight:900;margin-bottom:7px}.priceGrid strong{font-size:18px}.priceGrid input{height:38px;border-radius:12px}.note{background:#fff8df;border:1px solid #f2e2a2;border-radius:16px;padding:11px!important;margin-top:12px!important;color:#695300!important}.delete{margin-top:14px;background:#f4f5f7;color:#707682;padding:10px 14px}@media(max-width:1080px){.stockWrap{grid-template-columns:1fr}.summaryGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:720px){.stockHero{padding:34px 16px 18px;display:block}.stockHero h1{font-size:38px}.stockHero p{font-size:16px}.heroCard{margin-top:18px}.summaryGrid{padding:0 16px 18px;grid-template-columns:1fr}.errorBox{margin:0 16px 18px}.stockWrap{padding:0 16px 34px}.formGrid,.filters,.priceGrid{grid-template-columns:1fr}.stockForm,.stockList{border-radius:24px;padding:18px}.listHead{display:block}.refresh{margin-top:12px}.cardTop{align-items:flex-start;flex-direction:column}.cardTop select{max-width:none}.miniInfo{display:grid}.stockCard h3{font-size:20px}}
      `}</style>
    </SiteLayout>
  )
}
