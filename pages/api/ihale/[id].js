import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query

  try {
    if (req.method === 'PUT') {
      const body = req.body || {}

      const vehicle = await prisma.auctionVehicle.update({
        where: { id },
        data: {
          title: body.title,
          plate: body.plate,
          brand: body.brand,
          model: body.model,
          year: body.year,
          status: body.status,
          purchasePrice: Number(body.purchasePrice || 0),
          auctionCommission: Number(body.auctionCommission || 0),
          cardCommission: Number(body.cardCommission || 0),
          notaryCost: Number(body.notaryCost || 0),
          towCost: Number(body.towCost || 0),
          repairCost: Number(body.repairCost || 0),
          otherCost: Number(body.otherCost || 0),
          salePrice: Number(body.salePrice || 0),
          notes: body.notes || ''
        }
      })

      return res.status(200).json(vehicle)
    }

    if (req.method === 'DELETE') {
      await prisma.auctionVehicle.delete({
        where: { id }
      })

      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Server error' })
  }
}
