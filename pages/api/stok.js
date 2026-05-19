import prisma from '../../lib/prisma'

function toNumber(value) {
  return Number(String(value || '').replace(',', '.')) || 0
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const items = await prisma.stockItem.findMany({
        orderBy: { createdAt: 'desc' }
      })

      return res.status(200).json(items)
    }

    if (req.method === 'POST') {
      const body = req.body || {}

      const item = await prisma.stockItem.create({
        data: {
          brand: body.brand || 'Togg',
          productName: body.productName || '',
          partCode: body.partCode || '',
          quantity: Number(body.quantity || 1),
          buyPrice: toNumber(body.buyPrice),
          salePrice: toNumber(body.salePrice),
          boughtBy: body.boughtBy || '',
          source: body.source || '',
          status: body.status || 'stok',
          note: body.note || ''
        }
      })

      return res.status(201).json(item)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Server error' })
  }
}
