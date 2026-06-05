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

function vehicleData(body) {
  const data = {}
  if (body.title !== undefined) data.title = String(body.title || '').trim()
  if (body.plate !== undefined) data.plate = body.plate || ''
  if (body.brand !== undefined) data.brand = body.brand || ''
  if (body.model !== undefined) data.model = body.model || ''
  if (body.year !== undefined) data.year = body.year || ''
  if (body.status !== undefined) data.status = body.status || 'gelecek'
  if (body.purchasePrice !== undefined) data.purchasePrice = toNumber(body.purchasePrice)
  if (body.auctionCommission !== undefined) data.auctionCommission = toNumber(body.auctionCommission)
  if (body.cardCommission !== undefined) data.cardCommission = toNumber(body.cardCommission)
  if (body.notaryCost !== undefined) data.notaryCost = toNumber(body.notaryCost)
  if (body.towCost !== undefined) data.towCost = toNumber(body.towCost)
  if (body.repairCost !== undefined) data.repairCost = toNumber(body.repairCost)
  if (body.otherCost !== undefined) data.otherCost = toNumber(body.otherCost)
  if (body.salePrice !== undefined) data.salePrice = toNumber(body.salePrice)
  if (body.notes !== undefined) data.notes = body.notes || ''
  return data
}

export default async function handler(req, res) {
  const { id } = req.query

  try {
    if (req.method === 'PUT') {
      const body = req.body || {}
      const data = vehicleData(body)

      const vehicle = await prisma.$transaction(async tx => {
        await tx.auctionVehicle.update({ where: { id }, data })

        if (Array.isArray(body.neededParts)) {
          await tx.neededPart.deleteMany({ where: { vehicleId: id } })
          if (body.neededParts.length) {
            await tx.neededPart.createMany({
              data: body.neededParts
                .filter(part => String(part.name || '').trim())
                .map(part => ({
                  name: String(part.name || '').trim(),
                  done: Boolean(part.done),
                  addedBy: part.addedBy || '',
                  vehicleId: id
                }))
            })
          }
        }

        if (Array.isArray(body.boughtParts)) {
          await tx.boughtPart.deleteMany({ where: { vehicleId: id } })
          if (body.boughtParts.length) {
            await tx.boughtPart.createMany({
              data: body.boughtParts
                .filter(part => String(part.name || '').trim())
                .map(part => ({
                  name: String(part.name || '').trim(),
                  price: toNumber(part.price),
                  buyer: part.buyer || '',
                  vehicleId: id
                }))
            })
          }
        }

        return tx.auctionVehicle.findUnique({
          where: { id },
          include: includeParts()
        })
      })

      return res.status(200).json(vehicle)
    }

    if (req.method === 'DELETE') {
      await prisma.auctionVehicle.delete({ where: { id } })
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
