import prisma from '../../../lib/prisma'

function toNumber(value) {
  return Number(String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0
}

function includeParts() {
  return {
    neededParts: { orderBy: { createdAt: 'asc' } },
    boughtParts: { orderBy: { createdAt: 'asc' } }
  }
}

async function attachTasks(vehicles) {
  if (!vehicles.length) return vehicles
  const ids = vehicles.map(vehicle => vehicle.id)
  const quotedIds = ids.map(id => `'${String(id).replace(/'/g, "''")}'`).join(',')
  const tasks = await prisma.$queryRawUnsafe(`SELECT * FROM VehicleTask WHERE vehicleId IN (${quotedIds}) ORDER BY createdAt ASC`)
  return vehicles.map(vehicle => ({
    ...vehicle,
    tasks: tasks.filter(task => task.vehicleId === vehicle.id)
  }))
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const vehicles = await prisma.auctionVehicle.findMany({
        include: includeParts(),
        orderBy: { createdAt: 'desc' }
      })

      return res.status(200).json(await attachTasks(vehicles))
    }

    if (req.method === 'POST') {
      const body = req.body || {}

      if (!String(body.title || '').trim()) {
        return res.status(400).json({ error: 'Araç adı zorunlu.' })
      }

      const vehicle = await prisma.auctionVehicle.create({
        data: {
          title: String(body.title || '').trim(),
          plate: body.plate || '',
          brand: body.brand || '',
          model: body.model || '',
          year: body.year || '',
          status: body.status || 'gelecek',
          purchasePrice: toNumber(body.purchasePrice),
          auctionCommission: toNumber(body.auctionCommission),
          cardCommission: toNumber(body.cardCommission),
          notaryCost: toNumber(body.notaryCost),
          towCost: toNumber(body.towCost),
          repairCost: toNumber(body.repairCost),
          otherCost: toNumber(body.otherCost),
          salePrice: toNumber(body.salePrice),
          notes: body.notes || '',
          createdBy: body.createdBy || ''
        },
        include: includeParts()
      })

      return res.status(201).json({ ...vehicle, tasks: [] })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
