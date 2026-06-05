import { useEffect, useMemo, useState } from 'react'

const partners = ['Mustafa', 'Bedirhan', 'Ömer']
const accessCode = process.env.NEXT_PUBLIC_IHALE_ACCESS_CODE || 'pasa2026'

const statusLabels = {
  gelecek: 'Gelecek',
  tamirde: 'Tamirde',
  hazir: 'Hazır',
  satildi: 'Satıldı'
}

const emptyVehicle = {
  title: '',
  brand: '',
  model: '',
  plate: '',
  status: 'gelecek',
  purchasePrice: '',
  auctionCommission: '',
  cardCommission: '',
  notaryCost: '',
  towCost: '',
  repairCost: '',
  otherCost: '',
  salePrice: '',
  notes: '',
  neededParts: [],
  boughtParts: [],
  tasks: []
}

function toNumber(value) {
  return Number(String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0
}

function formatInputMoney(value) {
  const raw = String(value || '').replace(/[^0-9]/g, '')
  return raw ? new Intl.NumberFormat('tr-TR').format(Number(raw)) : ''
}

function formatMoney(value) {
  return `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value || 0)} TL`
}

function normalizeCar(car) {
  return {
    ...emptyVehicle,
    ...car,
    neededParts: car?.neededParts || [],
    boughtParts: car?.boughtParts || [],
    tasks: car?.tasks || []
  }
}

async function readJson(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'İşlem başarısız')
  return data
}

function totalCost(car) {
  const item = normalizeCar(car)
  const parts = item.boughtParts.reduce((sum, part) => sum + toNumber(part.price), 0)

  return (
    toNumber(item.purchasePrice) +
    toNumber(item.auctionCommission) +
    toNumber(item.cardCommission) +
    toNumber(item.notaryCost) +
    toNumber(item.towCost) +
    toNumber(item.repairCost) +
    toNumber(item.otherCost) +
    parts
  )
}

function profit(car) {
  return toNumber(car.salePrice) - totalCost(car)
}

function partnerSpend(car, name) {
  return (car.boughtParts || [])
    .filter(part => part.buyer === name)
    .reduce((sum, part) => sum + toNumber(part.price), 0)
}

function completion(car) {
  const needed = car.neededParts || []
  if (!needed.length) return 'Parça yok'
  return `${needed.filter(part => part.done).length}/${needed.length} parça`
}

function taskCompletion(car) {
  const tasks = car.tasks || []
  if (!tasks.length) return 'Görev yok'
  return `${tasks.filter(task => task.done).length}/${tasks.length} görev`
}

export default function IhalePage() {
  const [user, setUser] = useState('')
  const [loginName, setLoginName] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [cars, setCars] = useState([])
  const [view, setView] = useState('cars')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [carForm, setCarForm] = useState(emptyVehicle)
  const [partInputs, setPartInputs] = useState({})
  const [taskInputs, setTaskInputs] = useState({})
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setUser(localStorage.getItem('pasaIhaleUser') || '')
    loadCars()
  }, [])

  async function loadCars() {
    setErrorMessage('')

    try {
      const data = await readJson(await fetch('/api/ihale'))
      setCars(Array.isArray(data) ? data.map(normalizeCar) : [])
    } catch (error) {
      setErrorMessage(error.message || 'Araç kayıtları okunamadı.')
    }
  }

  async function persistCar(nextCar, oldCars) {
    setErrorMessage('')

    try {
      const saved = await readJson(await fetch(`/api/ihale/${nextCar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextCar)
      }))

      setCars(current =>
        current.map(car =>
          car.id === saved.id
            ? normalizeCar({ ...saved, tasks: nextCar.tasks || car.tasks || [] })
            : car
        )
      )
    } catch (error) {
      setCars(oldCars)
      setErrorMessage(error.message || 'Araç güncellenemedi.')
    }
  }

  async function persistTasks(carId, tasks, oldCars) {
    setErrorMessage('')

    try {
      const savedTasks = await readJson(await fetch('/api/ihale/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: carId, tasks })
      }))

      setCars(current =>
        current.map(car =>
          car.id === carId ? normalizeCar({ ...car, tasks: savedTasks }) : car
        )
      )
    } catch (error) {
      setCars(oldCars)
      setErrorMessage(error.message || 'Görevler kaydedilemedi.')
    }
  }

  function login(e) {
    e.preventDefault()

    const normalized = loginName.trim().toLocaleLowerCase('tr-TR')
    const found = partners.find(name =>
      name.toLocaleLowerCase('tr-TR') === normalized || (normalized === 'omer' && name === 'Ömer')
    )

    if (!found || loginCode !== accessCode) return alert('Giriş bilgileri hatalı.')

    localStorage.setItem('pasaIhaleUser', found)
    setUser(found)
    loadCars()
  }

  function logout() {
    localStorage.removeItem('pasaIhaleUser')
    setUser('')
    setLoginName('')
    setLoginCode('')
  }

  function updateCar(id, patch) {
    const oldCars = cars
    const nextCars = cars.map(car =>
      car.id === id ? normalizeCar({ ...car, ...patch }) : car
    )

    const nextCar = nextCars.find(car => car.id === id)

    setCars(nextCars)

    if (nextCar) persistCar(nextCar, oldCars)
  }

  function updateTasks(carId, tasks) {
    const oldCars = cars

    const nextCars = cars.map(car =>
      car.id === carId ? normalizeCar({ ...car, tasks }) : car
    )

    setCars(nextCars)
    persistTasks(carId, tasks, oldCars)
  }

  function moneyPatch(id, key, value) {
    updateCar(id, { [key]: formatInputMoney(value) })
  }

  async function saveCar(e) {
    e.preventDefault()

    if (!carForm.title.trim()) return alert('Araç adı yazmalısın.')

    setErrorMessage('')

    try {
      const created = await readJson(await fetch('/api/ihale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...carForm, createdBy: user })
      }))

      const next = normalizeCar(created)

      setCars([next, ...cars])
      setSelectedId(next.id)
      setCarForm(emptyVehicle)
      setFormOpen(false)
      setView('cars')
    } catch (error) {
      setErrorMessage(error.message || 'Araç kaydedilemedi.')
    }
  }

  async function deleteCar(id) {
    if (!confirm('Bu araç kartı silinsin mi?')) return

    const oldCars = cars

    setCars(cars.filter(car => car.id !== id))
    setSelectedId('')

    try {
      await readJson(await fetch(`/api/ihale/${id}`, { method: 'DELETE' }))
    } catch (error) {
      setCars(oldCars)
      setErrorMessage(error.message || 'Araç silinemedi.')
    }
  }

  function addNeededPart(carId) {
    const value = (partInputs[`need-${carId}`] || '').trim()
    if (!value) return

    const car = cars.find(item => item.id === carId)
    if (!car) return

    updateCar(carId, {
      neededParts: [
        ...(car.neededParts || []),
        { name: value, done: false, addedBy: user }
      ]
    })

    setPartInputs({ ...partInputs, [`need-${carId}`]: '' })
  }

  function toggleNeededPart(carId, partId) {
    const car = cars.find(item => item.id === carId)
    if (!car) return

    updateCar(carId, {
      neededParts: (car.neededParts || []).map(part =>
        part.id === partId ? { ...part, done: !part.done } : part
      )
    })
  }

  function removeNeededPart(carId, partId) {
    const car = cars.find(item => item.id === carId)
    if (!car) return

    updateCar(carId, {
      neededParts: (car.neededParts || []).filter(part => part.id !== partId)
    })
  }

  function addBoughtPart(carId) {
    const name = (partInputs[`bought-name-${carId}`] || '').trim()
    const price = partInputs[`bought-price-${carId}`] || ''
    const buyer = partInputs[`bought-buyer-${carId}`] || user

    if (!name) return alert('Alınan parça adı yazmalısın.')

    const car = cars.find(item => item.id === carId)
    if (!car) return

    updateCar(carId, {
      boughtParts: [
        ...(car.boughtParts || []),
        { name, price, buyer }
      ]
    })

    setPartInputs({
      ...partInputs,
      [`bought-name-${carId}`]: '',
      [`bought-price-${carId}`]: '',
      [`bought-buyer-${carId}`]: user
    })
  }

  function removeBoughtPart(carId, partId) {
    const car = cars.find(item => item.id === carId)
    if (!car) return

    updateCar(carId, {
      boughtParts: (car.boughtParts || []).filter(part => part.id !== partId)
    })
  }

  function addTask(carId) {
    const title = (taskInputs[`task-title-${carId}`] || '').trim()
    const assignedTo = taskInputs[`task-user-${carId}`] || user

    if (!title) return alert('Görev yazmalısın.')

    const car = cars.find(item => item.id === carId)
    if (!car) return

    updateTasks(carId, [
      ...(car.tasks || []),
      { title, done: false, assignedTo }
    ])

    setTaskInputs({
      ...taskInputs,
      [`task-title-${carId}`]: '',
      [`task-user-${carId}`]: user
    })
  }

  function toggleTask(carId, taskIndex) {
    const car = cars.find(item => item.id === carId)
    if (!car) return

    updateTasks(
      carId,
      (car.tasks || []).map((task, index) =>
        index === taskIndex ? { ...task, done: !task.done } : task
      )
    )
  }

  function removeTask(carId, taskIndex) {
    const car = cars.find(item => item.id === carId)
    if (!car) return

    updateTasks(
      carId,
      (car.tasks || []).filter((_, index) => index !== taskIndex)
    )
  }

  const selectedCar = cars.find(car => car.id === selectedId)
    ? normalizeCar(cars.find(car => car.id === selectedId))
    : null

  const allTasks = useMemo(() => {
    return cars.flatMap(car =>
      (car.tasks || []).map((task, index) => ({
        ...task,
        index,
        carId: car.id,
        carTitle: car.title,
        carPlate: car.plate,
        carStatus: car.status
      }))
    )
  }, [cars])

  const summary = useMemo(() => {
    const totalInvestment = cars.reduce((sum, car) => sum + totalCost(car), 0)
    const totalSales = cars.reduce((sum, car) => sum + toNumber(car.salePrice), 0)
    const soldProfit = cars.filter(car => car.status === 'satildi').reduce((sum, car) => sum + profit(car), 0)
    const byPartner = partners.map(name => ({
      name,
      spend: cars.reduce((sum, car) => sum + partnerSpend(car, name), 0)
    }))

    const openTasks = allTasks.filter(task => !task.done).length
    const readyCars = cars.filter(car => car.status === 'hazir').length
    const repairCars = cars.filter(car => car.status === 'tamirde').length

    return { totalInvestment, totalSales, soldProfit, byPartner, openTasks, readyCars, repairCars }
  }, [cars, allTasks])

  if (!user) {
    return <main className="loginPage">
      <section className="loginCard">
        <span>GİZLİ PANEL</span>
        <h1>İhale Takip</h1>
        <p>Bu sayfa site içinde görünmez. Yetkili ortak girişi gerektirir.</p>

        <form onSubmit={login}>
          <input value={loginName} onChange={e => setLoginName(e.target.value)} placeholder="Kullanıcı adı" autoFocus />
          <input value={loginCode} onChange={e => setLoginCode(e.target.value)} placeholder="Giriş kodu" type="password" />
          <button>Giriş Yap</button>
        </form>

        <small>Giriş bilgisi olmayan kişiler panele erişemez.</small>
      </section>

      <GlobalStyle />
    </main>
  }

  return <main className="page">
    <header className="topbar">
      <div>
        <span>PAŞA OTO PARÇA</span>
        <h1>İhale Araç Ortak Paneli</h1>
        <p>Giriş yapan: <b>{user}</b> • Kayıtlar veritabanına kaydediliyor.</p>
      </div>

      <div className="topActions">
        <button onClick={() => setFormOpen(true)}>+ Araç Ekle</button>
        <button onClick={loadCars}>Yenile</button>
        <button className="ghost" onClick={logout}>Çıkış</button>
      </div>
    </header>

    {errorMessage ? <div className="errorBox">{errorMessage}</div> : null}

    <section className="summaryGrid">
      <button className={view === 'cars' ? 'summary active' : 'summary'} onClick={() => setView('cars')}>
        <span>🚗 Araçlar</span>
        <strong>{cars.length}</strong>
        <small>Toplam araç</small>
      </button>

      <button className={view === 'tasks' ? 'summary active' : 'summary'} onClick={() => setView('tasks')}>
        <span>📋 Görevler</span>
        <strong>{summary.openTasks}</strong>
        <small>Açık görev</small>
      </button>

      <button className="summary" onClick={() => setView('cars')}>
        <span>🔧 Tamirde</span>
        <strong>{summary.repairCars}</strong>
        <small>Servisteki araç</small>
      </button>

      <button className="summary" onClick={() => setView('cars')}>
        <span>✅ Hazır</span>
        <strong>{summary.readyCars}</strong>
        <small>Satışa hazır</small>
      </button>
    </section>

    <section className="moneyGrid">
      <div><span>Toplam Maliyet</span><strong>{formatMoney(summary.totalInvestment)}</strong></div>
      <div><span>Toplam Satış</span><strong>{formatMoney(summary.totalSales)}</strong></div>
      <div><span>Satılan Kâr/Zarar</span><strong className={summary.soldProfit >= 0 ? 'profit' : 'loss'}>{formatMoney(summary.soldProfit)}</strong></div>
    </section>

    <section className="partnerGrid">
      {summary.byPartner.map(item =>
        <div key={item.name}>
          <span>{item.name} parça harcaması</span>
          <strong>{formatMoney(item.spend)}</strong>
        </div>
      )}
    </section>

    {view === 'cars' ? <section className="carsGrid">
      {cars.length === 0 ? <div className="empty">
        <h2>Henüz araç kartı yok.</h2>
        <p>İlk aracı ekleyerek maliyet, parça ve satış takibine başlayabilirsin.</p>
      </div> : cars.map(rawCar => {
        const car = normalizeCar(rawCar)
        const cost = totalCost(car)
        const carProfit = profit(car)

        return <button className="miniCarCard" key={car.id} onClick={() => setSelectedId(car.id)}>
          <div className="miniTop">
            <span className={`status ${car.status}`}>{statusLabels[car.status]}</span>
            <small>{car.plate || 'Plaka yok'}</small>
          </div>

          <h2>{car.title}</h2>

          <p>{[car.brand, car.model].filter(Boolean).join(' • ') || 'Araç bilgisi eklenmedi'}</p>

          <div className="miniStats">
            <div>
              <span>Maliyet</span>
              <b>{formatMoney(cost)}</b>
            </div>

            <div>
              <span>K/Z</span>
              <b className={carProfit >= 0 ? 'profit' : 'loss'}>{formatMoney(carProfit)}</b>
            </div>
          </div>

          <footer>
            <em>{completion(car)}</em>
            <em>{taskCompletion(car)}</em>
          </footer>
        </button>
      })}
    </section> : null}

    {view === 'tasks' ? <section className="tasksPanel">
      <div className="panelHead">
        <h2>Görevler</h2>
        <p>Araçlara ait yapılacak işler burada listelenir.</p>
      </div>

      {allTasks.length === 0 ? <div className="empty">
        <h2>Henüz görev yok.</h2>
        <p>Araç detayına girip görev ekleyebilirsin.</p>
      </div> : <div className="taskList">
        {allTasks.map(task =>
          <div className={task.done ? 'taskRow doneTask' : 'taskRow'} key={`${task.carId}-${task.index}`}>
            <label>
              <input type="checkbox" checked={!!task.done} onChange={() => toggleTask(task.carId, task.index)} />
              <span>{task.title}</span>
            </label>

            <button onClick={() => setSelectedId(task.carId)}>
              {task.carTitle} {task.carPlate ? `• ${task.carPlate}` : ''}
            </button>
          </div>
        )}
      </div>}
    </section> : null}

    {formOpen ? <Modal title="Yeni Araç Kartı" onClose={() => setFormOpen(false)}>
      <form onSubmit={saveCar} className="carForm simple">
        <input placeholder="Araç adı örn: Model Y Kazalı" value={carForm.title} onChange={e => setCarForm({ ...carForm, title: e.target.value })} />
        <input placeholder="Marka" value={carForm.brand} onChange={e => setCarForm({ ...carForm, brand: e.target.value })} />
        <input placeholder="Model" value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} />
        <input placeholder="Plaka" value={carForm.plate} onChange={e => setCarForm({ ...carForm, plate: e.target.value })} />
        <button>Aracı Kaydet</button>
      </form>
    </Modal> : null}

    {selectedCar ? <CarModal
      car={selectedCar}
      user={user}
      onClose={() => setSelectedId('')}
      updateCar={updateCar}
      deleteCar={deleteCar}
      moneyPatch={moneyPatch}
      addNeededPart={addNeededPart}
      toggleNeededPart={toggleNeededPart}
      removeNeededPart={removeNeededPart}
      addBoughtPart={addBoughtPart}
      removeBoughtPart={removeBoughtPart}
      addTask={addTask}
      toggleTask={toggleTask}
      removeTask={removeTask}
      partInputs={partInputs}
      setPartInputs={setPartInputs}
      taskInputs={taskInputs}
      setTaskInputs={setTaskInputs}
    /> : null}

    <GlobalStyle />
  </main>
}

function Modal({ title, onClose, children }) {
  return <div className="modalOverlay" onMouseDown={onClose}>
    <section className="modal" onMouseDown={e => e.stopPropagation()}>
      <div className="modalHead">
        <h2>{title}</h2>
        <button onClick={onClose}>×</button>
      </div>

      {children}
    </section>
  </div>
}

function CarModal({
  car,
  user,
  onClose,
  updateCar,
  deleteCar,
  moneyPatch,
  addNeededPart,
  toggleNeededPart,
  removeNeededPart,
  addBoughtPart,
  removeBoughtPart,
  addTask,
  toggleTask,
  removeTask,
  partInputs,
  setPartInputs,
  taskInputs,
  setTaskInputs
}) {
  const cost = totalCost(car)
  const carProfit = profit(car)
  const share = car.status === 'satildi' ? carProfit / partners.length : 0

  return <Modal title={car.title} onClose={onClose}>
    <div className="modalSub">
      <span className={`status ${car.status}`}>{statusLabels[car.status]}</span>
      <p>{[car.brand, car.model, car.plate].filter(Boolean).join(' • ') || 'Araç bilgisi eklenmedi'}</p>
    </div>

    <div className="editCosts">
      <label>Statü
        <select value={car.status} onChange={e => updateCar(car.id, { status: e.target.value })}>
          {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>

      <label>Araç Bedeli<input value={car.purchasePrice || ''} onChange={e => moneyPatch(car.id, 'purchasePrice', e.target.value)} placeholder="100.000" /></label>
      <label>Autogong Komisyon<input value={car.auctionCommission || ''} onChange={e => moneyPatch(car.id, 'auctionCommission', e.target.value)} placeholder="15.000" /></label>
      <label>Kredi Kartı Komisyon<input value={car.cardCommission || ''} onChange={e => moneyPatch(car.id, 'cardCommission', e.target.value)} placeholder="7.500" /></label>
      <label>Noter Harç<input value={car.notaryCost || ''} onChange={e => moneyPatch(car.id, 'notaryCost', e.target.value)} placeholder="5.000" /></label>
      <label>Çekici<input value={car.towCost || ''} onChange={e => moneyPatch(car.id, 'towCost', e.target.value)} placeholder="5.000" /></label>
      <label>Tamir<input value={car.repairCost || ''} onChange={e => moneyPatch(car.id, 'repairCost', e.target.value)} placeholder="25.000" /></label>
      <label>Diğer<input value={car.otherCost || ''} onChange={e => moneyPatch(car.id, 'otherCost', e.target.value)} placeholder="10.000" /></label>
      <label>Satış<input value={car.salePrice || ''} onChange={e => moneyPatch(car.id, 'salePrice', e.target.value)} placeholder="450.000" /></label>
    </div>

    <div className="numbers">
      <div><span>Toplam Maliyet</span><strong>{formatMoney(cost)}</strong></div>
      <div><span>Satış</span><strong>{formatMoney(toNumber(car.salePrice))}</strong></div>
      <div><span>Kâr / Zarar</span><strong className={carProfit >= 0 ? 'profit' : 'loss'}>{formatMoney(carProfit)}</strong></div>
      <div><span>Kişi Başı Pay</span><strong>{car.status === 'satildi' ? formatMoney(share) : '-'}</strong></div>
    </div>

    <div className="columns">
      <section>
        <h3>Gerekli Parçalar</h3>

        <div className="addLine">
          <input value={partInputs[`need-${car.id}`] || ''} onChange={e => setPartInputs({ ...partInputs, [`need-${car.id}`]: e.target.value })} placeholder="Örn: Sol far" />
          <button onClick={() => addNeededPart(car.id)}>Ekle</button>
        </div>

        <div className="list">
          {(car.neededParts || []).map(part => <div className="listRow" key={part.id}>
            <label>
              <input type="checkbox" checked={!!part.done} onChange={() => toggleNeededPart(car.id, part.id)} />
              <span className={part.done ? 'done' : ''}>{part.name}</span>
            </label>

            <button onClick={() => removeNeededPart(car.id, part.id)}>×</button>
          </div>)}
        </div>
      </section>

      <section>
        <h3>Alınan Parçalar</h3>

        <div className="buyGrid">
          <input value={partInputs[`bought-name-${car.id}`] || ''} onChange={e => setPartInputs({ ...partInputs, [`bought-name-${car.id}`]: e.target.value })} placeholder="Parça adı" />
          <input value={partInputs[`bought-price-${car.id}`] || ''} onChange={e => setPartInputs({ ...partInputs, [`bought-price-${car.id}`]: formatInputMoney(e.target.value) })} placeholder="Tutar" />

          <select value={partInputs[`bought-buyer-${car.id}`] || user} onChange={e => setPartInputs({ ...partInputs, [`bought-buyer-${car.id}`]: e.target.value })}>
            {partners.map(name => <option key={name}>{name}</option>)}
          </select>

          <button onClick={() => addBoughtPart(car.id)}>Alındı Ekle</button>
        </div>

        <div className="list">
          {(car.boughtParts || []).map(part => <div className="boughtRow" key={part.id}>
            <div>
              <b>{part.name}</b>
              <small>{part.buyer || '-'} aldı</small>
            </div>

            <strong>{formatMoney(toNumber(part.price))}</strong>
            <button onClick={() => removeBoughtPart(car.id, part.id)}>×</button>
          </div>)}
        </div>
      </section>
    </div>

    <section className="tasksBox">
      <h3>Görevler / Yapılacaklar</h3>

      <div className="taskAdd">
        <input value={taskInputs[`task-title-${car.id}`] || ''} onChange={e => setTaskInputs({ ...taskInputs, [`task-title-${car.id}`]: e.target.value })} placeholder="Örn: Kaportacıya gönder" />

        <select value={taskInputs[`task-user-${car.id}`] || user} onChange={e => setTaskInputs({ ...taskInputs, [`task-user-${car.id}`]: e.target.value })}>
          {partners.map(name => <option key={name}>{name}</option>)}
        </select>

        <button onClick={() => addTask(car.id)}>Görev Ekle</button>
      </div>

      <div className="list">
        {(car.tasks || []).map((task, index) => <div className="taskRow" key={task.id || index}>
          <label>
            <input type="checkbox" checked={!!task.done} onChange={() => toggleTask(car.id, index)} />
            <span className={task.done ? 'done' : ''}>{task.title}</span>
          </label>

          <small>{task.assignedTo || '-'}</small>
          <button onClick={() => removeTask(car.id, index)}>×</button>
        </div>)}
      </div>
    </section>

    <textarea className="notes" placeholder="Araç notları" value={car.notes || ''} onChange={e => updateCar(car.id, { notes: e.target.value })} />

    <div className="dangerRow">
      <button onClick={() => deleteCar(car.id)}>Aracı Sil</button>
    </div>
  </Modal>
}

function GlobalStyle() {
  return <style jsx global>{`
*{box-sizing:border-box}
body{margin:0;background:#101218;color:#eef1f7;font-family:Inter,Arial,sans-serif}
button,input,select,textarea{font:inherit}
button{cursor:pointer}
.loginPage{min-height:100vh;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at top,#272c3a,#101218 60%)}
.loginCard{width:min(520px,100%);background:#fff;color:#161922;border-radius:30px;padding:34px;box-shadow:0 30px 90px rgba(0,0,0,.35)}
.loginCard span,.topbar span{color:#f32334;font-size:12px;font-weight:950;letter-spacing:1.5px}
.loginCard h1{font-size:44px;line-height:1;margin:12px 0}
.loginCard p{color:#5c6470;line-height:1.6}
.loginCard form{display:grid;gap:12px;margin:22px 0}
.loginCard input,.loginCard button{height:54px;border-radius:16px;border:1px solid #dde1ea;padding:0 16px}
.loginCard button,.topActions button,.carForm button{border:0;background:#f32334;color:#fff;font-weight:950}
.loginCard small{color:#777;line-height:1.5}
.page{min-height:100vh;padding:22px;background:#f4f6fb;color:#1b1f2a}
.topbar{max-width:1360px;margin:0 auto 16px;display:flex;justify-content:space-between;gap:20px;align-items:flex-end}
.topbar h1{font-size:clamp(30px,4vw,54px);line-height:1;margin:8px 0;color:#151821}
.topbar p{color:#5b6270}
.topActions{display:flex;gap:10px;flex-wrap:wrap}
.topActions button,.ghost{border:0;border-radius:999px;padding:13px 17px;font-weight:950}
.topActions .ghost{background:#151821;color:#fff}
.errorBox{max-width:1360px;margin:0 auto 14px;background:#fee2e2;color:#991b1b;border-radius:18px;padding:14px;font-weight:900}
.summaryGrid,.moneyGrid,.partnerGrid{max-width:1360px;margin:0 auto 14px;display:grid;gap:12px}
.summaryGrid{grid-template-columns:repeat(4,1fr)}
.moneyGrid{grid-template-columns:repeat(3,1fr)}
.partnerGrid{grid-template-columns:repeat(3,1fr)}
.summary,.moneyGrid>div,.partnerGrid>div{background:#fff;color:#151821;border:1px solid #e4e8f1;border-radius:22px;box-shadow:0 16px 55px rgba(23,27,38,.07);padding:16px;text-align:left}
.summary{border:0}
.summary.active{outline:3px solid rgba(243,35,52,.15);border:1px solid #f32334}
.summary span,.moneyGrid span,.partnerGrid span,.numbers span{display:block;color:#717989;font-size:13px;margin-bottom:7px}
.summary strong,.moneyGrid strong,.partnerGrid strong{font-size:25px}
.summary small{display:block;color:#8a93a3;margin-top:4px}
.profit{color:#0b8d3a!important}
.loss{color:#d72737!important}
.carsGrid{max-width:1360px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:12px;align-items:start}
.empty{grid-column:1/-1;background:#fff;color:#151821;border-radius:24px;padding:28px}
.miniCarCard{width:100%;text-align:left;border:0;background:#fff;color:#151821;border-radius:22px;padding:14px;box-shadow:0 14px 50px rgba(23,27,38,.08);min-height:172px;display:flex;flex-direction:column;justify-content:space-between}
.miniTop{display:flex;justify-content:space-between;gap:8px;align-items:center}
.miniTop small{color:#667085;font-weight:800}
.miniCarCard h2{font-size:18px;line-height:1.15;margin:10px 0 4px}
.miniCarCard p{color:#667085;margin:0 0 10px;font-size:13px}
.miniStats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0}
.miniStats div{background:#f7f9fc;border-radius:14px;padding:10px}
.miniStats span{display:block;color:#717989;font-size:11px;margin-bottom:4px}
.miniStats b{font-size:13px}
.miniCarCard footer{display:flex;justify-content:space-between;gap:8px;margin-top:8px}
.miniCarCard em{font-style:normal;color:#717989;font-size:12px;font-weight:850}
.status{display:inline-flex;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:950;background:#eef1f6;color:#303746}
.status.gelecek{background:#fff3cd;color:#7a5500}
.status.tamirde{background:#e7f0ff;color:#1554b3}
.status.hazir{background:#e8f8ef;color:#0b7434}
.status.satildi{background:#f1e8ff;color:#5d249a}
.tasksPanel{max-width:1360px;margin:0 auto;background:#fff;color:#151821;border-radius:26px;padding:22px;box-shadow:0 18px 60px rgba(23,27,38,.08)}
.panelHead h2{margin:0 0 4px;font-size:28px}
.panelHead p{color:#667085;margin:0 0 16px}
.taskList{display:grid;gap:10px}
.taskRow{background:#f8f9fc;border:1px solid #e5e9f2;border-radius:16px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.taskRow label{display:flex;align-items:center;gap:9px;font-weight:850}
.taskRow button{border:0;background:#151821;color:#fff;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:900}
.doneTask{opacity:.65}
.modalOverlay{position:fixed;inset:0;z-index:200;background:rgba(10,13,20,.62);display:grid;place-items:center;padding:20px}
.modal{width:min(1180px,100%);max-height:90vh;overflow:auto;background:#fff;color:#151821;border-radius:30px;box-shadow:0 40px 120px rgba(0,0,0,.35);padding:24px}
.modalHead{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:16px}
.modalHead h2{font-size:32px;line-height:1.05;margin:0}
.modalHead button{border:0;background:#eef1f6;border-radius:50%;width:42px;height:42px;font-size:26px}
.modalSub{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.modalSub p{margin:0;color:#667085}
.carForm.simple{display:grid;grid-template-columns:repeat(4,1fr) auto;gap:12px}
.carForm input,.editCosts input,.editCosts select,.addLine input,.buyGrid input,.buyGrid select,.taskAdd input,.taskAdd select,.notes{border:1px solid #dde2ec;background:#f8f9fc;border-radius:15px;padding:13px;min-width:0;color:#151821}
.carForm button{border-radius:15px;padding:0 18px}
.editCosts{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:18px 0}
.editCosts label{display:grid;gap:6px;color:#6a7280;font-size:12px;font-weight:850}
.numbers{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.numbers div{background:#f7f9fc;border-radius:18px;padding:13px}
.numbers strong{font-size:22px}
.columns{display:grid;grid-template-columns:1fr 1.25fr;gap:16px}
.columns section,.tasksBox{background:#f8f9fc;border:1px solid #e5e9f2;border-radius:22px;padding:16px}
.columns h3,.tasksBox h3{margin:0 0 12px}
.addLine{display:grid;grid-template-columns:1fr auto;gap:8px}
.addLine button,.buyGrid button,.taskAdd button{border:0;background:#151821;color:#fff;border-radius:14px;padding:0 14px;font-weight:900}
.list{display:grid;gap:8px;margin-top:12px}
.listRow,.boughtRow{background:#fff;border:1px solid #e5e9f2;border-radius:15px;padding:11px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.listRow label{display:flex;align-items:center;gap:8px}
.listRow button,.boughtRow button{border:0;background:#eef1f6;border-radius:10px;width:30px;height:30px}
.done{text-decoration:line-through;color:#8891a2}
.buyGrid{display:grid;grid-template-columns:1.4fr .8fr .8fr auto;gap:8px}
.boughtRow div{display:grid;gap:3px}
.boughtRow small{color:#697386}
.boughtRow strong{white-space:nowrap}
.tasksBox{margin-top:16px}
.taskAdd{display:grid;grid-template-columns:1fr .5fr auto;gap:8px}
.notes{width:100%;margin-top:16px;min-height:76px;resize:vertical}
.dangerRow{display:flex;justify-content:flex-end;margin-top:16px}
.dangerRow button{border:0;background:#151821;color:#fff;border-radius:999px;padding:12px 16px;font-weight:900}
@media(max-width:980px){
.page{padding:14px}
.topbar{display:grid}
.summaryGrid{grid-template-columns:repeat(2,1fr)}
.moneyGrid,.partnerGrid,.carsGrid,.carForm.simple,.editCosts,.numbers,.columns,.buyGrid,.taskAdd{grid-template-columns:1fr}
.topActions button{width:100%}
.topActions{width:100%}
.summary strong,.moneyGrid strong,.partnerGrid strong{font-size:21px}
.modalOverlay{padding:8px;align-items:end}
.modal{max-height:92vh;border-radius:24px 24px 0 0;padding:16px}
.modalHead h2{font-size:23px}
.carsGrid{grid-template-columns:repeat(2,1fr);gap:10px}
.miniCarCard{padding:12px;min-height:165px}
.miniCarCard h2{font-size:16px}
.miniStats{grid-template-columns:1fr}
}
@media(max-width:430px){
.carsGrid{grid-template-columns:1fr}
.summaryGrid{grid-template-columns:1fr 1fr}
}
`}</style>
}
