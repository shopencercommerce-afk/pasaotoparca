import prisma from '../../../lib/prisma'

function toNumber(value) {
  return Number(String(value || '').replace(',', '.')) || 0
}

export default async function handler(req, res) {
  const { id } = req.query

  try {
    if (req.method === 'PUT') {
      const body = req.body || {}
      const data = {}

      if (body.brand !== undefined) data.brand = body.brand || 'Togg'
      if (body.productName !== undefined) data.productName = String(body.productName || '').trim()
      if (body.partCode !== undefined) data.partCode = body.partCode || ''
      if (body.quantity !== undefined) data.quantity = Number(body.quantity || 1)
      if (body.buyPrice !== undefined) data.buyPrice = toNumber(body.buyPrice)
      if (body.salePrice !== undefined) data.salePrice = toNumber(body.salePrice)
      if (body.boughtBy !== undefined) data.boughtBy = body.boughtBy || ''
      if (body.source !== undefined) data.source = body.source || ''
      if (body.status !== undefined) data.status = body.status || 'stok'
      if (body.note !== undefined) data.note = body.note || ''

      const item = await prisma.stockItem.update({
        where: { id },
        data
      })

      return res.status(200).json(item)
    }

    if (req.method === 'DELETE') {
      await prisma.stockItem.delete({
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
