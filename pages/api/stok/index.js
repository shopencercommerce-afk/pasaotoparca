import prisma from '../../../lib/prisma'

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

      if (!body.productName || !String(body.productName).trim()) {
        return res.status(400).json({ error: 'productName is required' })
      }

      const item = await prisma.stockItem.create({
        data: {
          brand: body.brand || 'Togg',
          productName: String(body.productName).trim(),
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
