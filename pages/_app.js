import { useEffect } from 'react'

const KEY = 'pasaIhalePanelV2'
const LOADED = 'pasaIhaleLoadedFromApi'

function isIhalePage() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/ihale')
}

function normalizeList(value) {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (_) {
    return []
  }
}

function isDbId(id) {
  return typeof id === 'string' && id.length > 20 && !id.includes('-')
}

async function apiSave(vehicle) {
  if (!vehicle || !vehicle.title) return null
  const method = isDbId(vehicle.id) ? 'PUT' : 'POST'
  const url = method === 'PUT' ? `/api/ihale/${vehicle.id}` : '/api/ihale'
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle)
  })
  if (!res.ok) return null
  return res.json()
}

async function syncIhale() {
  if (!isIhalePage()) return

  if (sessionStorage.getItem(LOADED) !== '1') {
    try {
      const res = await fetch('/api/ihale')
      const data = res.ok ? await res.json() : []
      if (Array.isArray(data)) {
        localStorage.setItem(KEY, JSON.stringify(data))
        sessionStorage.setItem(LOADED, '1')
        window.location.reload()
        return
      }
    } catch (_) {}
  }

  const list = normalizeList(localStorage.getItem(KEY))
  let changed = false
  const nextList = []

  for (const item of list) {
    const saved = await apiSave(item)
    if (saved && saved.id && saved.id !== item.id) {
      nextList.push(saved)
      changed = true
    } else {
      nextList.push(item)
    }
  }

  if (changed) {
    localStorage.setItem(KEY, JSON.stringify(nextList))
    window.location.reload()
  }
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (!isIhalePage()) return
    syncIhale()
    const timer = setInterval(syncIhale, 3000)
    return () => clearInterval(timer)
  }, [])

  return <Component {...pageProps} />
}
