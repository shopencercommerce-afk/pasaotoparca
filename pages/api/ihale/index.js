import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const vehicles = await prisma.auctionVehicle.findMany({
        include: {
          neededParts: true,
          boughtParts: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json(vehicles)
    }

    if (req.method === 'POST') {
      const body = req.body || {}

      const vehicle = await prisma.auctionVehicle.create({
        data: {
          title: body.title || '',
          plate: body.plate || '',
          brand: body.brand || '',
          model: body.model || '',
          year: body.year || '',
          status: body.status || 'gelecek',
          purchasePrice: Number(body.purchasePrice || 0),
          auctionCommission: Number(body.auctionCommission || 0),
          cardCommission: Number(body.cardCommission || 0),
          notaryCost: Number(body.notaryCost || 0),
          towCost: Number(body.towCost || 0),
          repairCost: Number(body.repairCost || 0),
          otherCost: Number(body.otherCost || 0),
          salePrice: Number(body.salePrice || 0),
          notes: body.notes || '',
          createdBy: body.createdBy || ''
        },
        include: {
          neededParts: true,
          boughtParts: true
        }
      })

      return res.status(201).json(vehicle)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Server error' })
  }
}
