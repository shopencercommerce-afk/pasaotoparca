import prisma from '../../../lib/prisma'

function toNumber(value) {
  return Number(String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0
}

function formatDate() {
  return new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body || {}
    const vehicleId = String(body.vehicleId || '')
    const stockId = String(body.stockId || '')
    const usedBy = String(body.usedBy || '')
    const qty = Math.max(1, Number(body.quantity || 1))

    if (!vehicleId) return res.status(400).json({ error: 'vehicleId zorunlu.' })
    if (!stockId) return res.status(400).json({ error: 'stockId zorunlu.' })

    const result = await prisma.$transaction(async tx => {
      const vehicle = await tx.auctionVehicle.findUnique({ where: { id: vehicleId } })
      if (!vehicle) throw new Error('Araç bulunamadı.')

      const stock = await tx.stockItem.findUnique({ where: { id: stockId } })
      if (!stock) throw new Error('Stok ürünü bulunamadı.')
      if (Number(stock.quantity || 0) < qty) throw new Error('Stok adedi yetersiz.')

      const vehicleName = [vehicle.plate, vehicle.brand, vehicle.model, vehicle.title].filter(Boolean).join(' - ')
      const useLine = `${formatDate()} - ${qty} adet ${vehicleName} için kullanıldı${usedBy ? ` (${usedBy})` : ''}.`
      const nextNote = [stock.note || '', useLine].filter(Boolean).join('\n')
      const nextQuantity = Number(stock.quantity || 0) - qty

      const updatedStock = await tx.stockItem.update({
        where: { id: stockId },
        data: {
          quantity: nextQuantity,
          note: nextNote,
          status: nextQuantity <= 0 ? 'kullanildi' : stock.status
        }
      })

      const boughtPart = await tx.boughtPart.create({
        data: {
          name: [stock.brand, stock.productName, stock.partCode].filter(Boolean).join(' - '),
          price: toNumber(stock.buyPrice || stock.salePrice || 0),
          buyer: usedBy || 'Stoktan',
          vehicleId
        }
      })

      return { stock: updatedStock, boughtPart }
    })

    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
