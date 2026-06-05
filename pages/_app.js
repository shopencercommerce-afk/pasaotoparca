import { useEffect } from 'react'

function IhaleUiHelper() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.location.pathname.startsWith('/ihale')) return

    let filter = 'all'
    let vehicles = []

    function esc(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    function cardStatus(card) {
      return (card.querySelector('.status')?.textContent || '').trim().toLocaleLowerCase('tr-TR')
    }

    function neededParts() {
      return vehicles.flatMap(vehicle =>
        (vehicle.neededParts || [])
          .filter(part => !part.done)
          .map(part => ({
            name: part.name || 'Parça adı yok',
            vehicleTitle: vehicle.title || 'Araç adı yok',
            vehiclePlate: vehicle.plate || '',
            vehicleBrand: vehicle.brand || '',
            vehicleModel: vehicle.model || ''
          }))
      )
    }

    async function loadVehicles() {
      try {
        const res = await fetch('/api/ihale')
        const data = await res.json()
        vehicles = Array.isArray(data) ? data : []
        injectPartsButton()
        updatePartsButtonCount()
      } catch (_) {}
    }

    function removeEmptyMessage() {
      document.querySelectorAll('.ihaleFilterEmpty').forEach(el => el.remove())
    }

    function applyFilter() {
      const cards = Array.from(document.querySelectorAll('.miniCarCard'))
      if (!cards.length) return

      removeEmptyMessage()
      let visibleCount = 0

      cards.forEach(card => {
        const status = cardStatus(card)
        const show = filter === 'all' || status === filter
        card.style.display = show ? '' : 'none'
        if (show) visibleCount += 1
      })

      const grid = document.querySelector('.carsGrid')
      if (grid && visibleCount === 0 && filter !== 'all') {
        const empty = document.createElement('div')
        empty.className = 'empty ihaleFilterEmpty'
        empty.innerHTML = `<h2>${filter === 'hazır' ? 'Hazır araç yok.' : 'Tamirde araç yok.'}</h2><p>Bu statüde araç bulunmuyor.</p>`
        grid.appendChild(empty)
      }
    }

    function hideNativeSections() {
      document.querySelectorAll('.homeHint,.moneyGrid,.partnerGrid,.carsPage,.tasksPage').forEach(el => {
        el.style.display = 'none'
      })
    }

    function showNativeSections() {
      document.querySelector('.neededPartsPage')?.remove()
      document.querySelectorAll('.homeHint,.moneyGrid,.partnerGrid,.carsPage,.tasksPage').forEach(el => {
        el.style.display = ''
      })
    }

    function updatePartsButtonCount() {
      const strong = document.querySelector('.neededPartsButton strong')
      if (strong) strong.textContent = String(neededParts().length)
    }

    function injectPartsButton() {
      if (document.querySelector('.neededPartsButton')) return
      const summaryGrid = document.querySelector('.summaryGrid')
      if (!summaryGrid) return

      const button = document.createElement('button')
      button.className = 'summary neededPartsButton'
      button.type = 'button'
      button.innerHTML = `<span>🧩 Alınacak Parçalar</span><strong>${neededParts().length}</strong><small>Tüm araçlar</small>`
      button.addEventListener('click', showNeededPartsPage)
      summaryGrid.insertAdjacentElement('afterend', button)
    }

    function showNeededPartsPage() {
      hideNativeSections()
      document.querySelector('.neededPartsPage')?.remove()

      const parts = neededParts()
      const page = document.createElement('section')
      page.className = 'neededPartsPage'

      const rows = parts.length
        ? parts.map(part => {
            const vehicleText = [part.vehicleBrand, part.vehicleModel, part.vehiclePlate].filter(Boolean).join(' • ')
            return `<div class="neededPartRow"><div><b>${esc(part.name)}</b><small>${esc(part.vehicleTitle)}${vehicleText ? ` • ${esc(vehicleText)}` : ''}</small></div></div>`
          }).join('')
        : '<div class="empty"><h2>Alınacak parça yok.</h2><p>Tüm gerekli parçalar tamamlanmış görünüyor.</p></div>'

      page.innerHTML = `<div class="sectionHead"><button class="backBtn neededPartsBack" type="button">← Ana Ekran</button><div><h2>Alınacak Parçalar</h2><p>Tüm araçların açık parça ihtiyaçları.</p></div></div><div class="neededPartsList">${rows}</div>`

      const summaryGrid = document.querySelector('.summaryGrid')
      summaryGrid?.insertAdjacentElement('afterend', page)
      page.querySelector('.neededPartsBack')?.addEventListener('click', () => {
        page.remove()
        showNativeSections()
      })
    }

    function handleClick(event) {
      const button = event.target.closest('button')
      if (!button) return
      if (button.classList.contains('neededPartsButton') || button.classList.contains('neededPartsBack')) return

      const text = (button.textContent || '').toLocaleLowerCase('tr-TR')
      if (text.includes('araçlar')) filter = 'all'
      if (text.includes('hazır')) filter = 'hazır'
      if (text.includes('tamirde')) filter = 'tamirde'

      document.querySelector('.neededPartsPage')?.remove()
      setTimeout(() => {
        showNativeSections()
        applyFilter()
        injectPartsButton()
        updatePartsButtonCount()
      }, 80)
      setTimeout(applyFilter, 250)
    }

    const observer = new MutationObserver(() => {
      injectPartsButton()
      updatePartsButtonCount()
      applyFilter()
    })

    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', handleClick)
    loadVehicles()
    const timer = setInterval(loadVehicles, 15000)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', handleClick)
      clearInterval(timer)
    }
  }, [])

  return null
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <IhaleUiHelper />
      <Component {...pageProps} />
      <style jsx global>{`
        body .neededPartsButton{
          max-width:1360px;
          margin:0 auto 14px;
          width:100%;
          display:block;
          background:#fff;
          color:#151821;
          border:1px solid #e4e8f1;
          border-radius:22px;
          box-shadow:0 16px 55px rgba(23,27,38,.07);
          padding:16px;
          text-align:left;
        }
        body .neededPartsButton span{
          display:block;
          color:#717989;
          font-size:13px;
          margin-bottom:7px;
        }
        body .neededPartsButton strong{font-size:25px;display:block;}
        body .neededPartsButton small{display:block;color:#8a93a3;margin-top:4px;}
        body .neededPartsPage{
          max-width:1360px;
          margin:0 auto 14px;
        }
        body .neededPartsList{
          display:grid;
          gap:10px;
        }
        body .neededPartRow{
          background:#fff;
          color:#151821;
          border:1px solid #e4e8f1;
          border-radius:18px;
          box-shadow:0 12px 38px rgba(23,27,38,.06);
          padding:13px 14px;
        }
        body .neededPartRow b{
          display:block;
          font-size:16px;
          margin-bottom:5px;
        }
        body .neededPartRow small{
          display:block;
          color:#667085;
          font-size:13px;
          line-height:1.35;
        }
        @media(max-width:980px){
          body .topActions{display:grid !important;grid-template-columns:repeat(3,1fr) !important;gap:8px !important;width:100% !important;}
          body .topActions button{width:100% !important;height:46px !important;min-height:46px !important;padding:0 6px !important;border-radius:16px !important;font-size:14px !important;line-height:1 !important;white-space:nowrap !important;}
          body .topbar{gap:10px !important;margin-bottom:10px !important;}
          body .topbar h1{font-size:34px !important;}
          body .topbar p{margin:6px 0 0 !important;}
        }
        @media(max-width:430px){
          body .topActions button{font-size:13px !important;border-radius:15px !important;}
          body .neededPartsButton{padding:14px;border-radius:20px;}
        }
      `}</style>
    </>
  )
}
