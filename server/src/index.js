import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'Paşa Oto Parça Backend',
    version: '1.0.0'
  })
})

app.get('/api/auction-vehicles', async (req, res) => {
  try {
    const vehicles = await prisma.auctionVehicle.findMany({
      include: {
        neededParts: true,
        boughtParts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(vehicles)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Araçlar alınamadı.' })
  }
})

app.post('/api/auction-vehicles', async (req, res) => {
  try {
    const body = req.body

    const vehicle = await prisma.auctionVehicle.create({
      data: {
        title: body.title,
        plate: body.plate,
        brand: body.brand,
        model: body.model,
        year: body.year,
        status: body.status || 'gelecek',
        purchasePrice: Number(body.purchasePrice || 0),
        towCost: Number(body.towCost || 0),
        repairCost: Number(body.repairCost || 0),
        otherCost: Number(body.otherCost || 0),
        salePrice: Number(body.salePrice || 0),
        notes: body.notes,
        createdBy: body.createdBy
      }
    })

    res.json(vehicle)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Araç oluşturulamadı.' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
