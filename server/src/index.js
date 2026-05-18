import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://pasaotoparca.com'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${FRONTEND_URL}/api/auth/google/callback`

app.use(cors())
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

function number(value) {
  return Number(String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '')) || 0
}

function publicUser(user) {
  if (!user) return null
  const { password, ...safe } = user
  return safe
}

function signUser(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' })
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Giriş gerekli.' })
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı.' })
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Oturum geçersiz.' })
  }
}

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'Paşa Oto Parça Backend', version: '1.0.0' })
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.get('/api/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.status(500).send('GOOGLE_CLIENT_ID eksik.')
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account'
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const code = req.query.code
    if (!code) return res.redirect(`${FRONTEND_URL}/account?login=google_error`)

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token error:', tokenData)
      return res.redirect(`${FRONTEND_URL}/account?login=google_error`)
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const profile = await profileResponse.json()

    if (!profile.email) return res.redirect(`${FRONTEND_URL}/account?login=google_no_email`)

    let user = await prisma.user.findUnique({ where: { email: profile.email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.name || profile.email.split('@')[0],
          email: profile.email,
          phone: '',
          password: null,
          role: 'customer'
        }
      })
    }

    const token = signUser(user)
    res.redirect(`${FRONTEND_URL}/account?token=${encodeURIComponent(token)}&login=google_success`)
  } catch (error) {
    console.error(error)
    res.redirect(`${FRONTEND_URL}/account?login=google_error`)
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const body = req.body
    if (!body.name || !body.email || !body.password) return res.status(400).json({ error: 'Ad, e-posta ve şifre zorunlu.' })
    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) return res.status(409).json({ error: 'Bu e-posta ile kayıt var.' })
    const password = await bcrypt.hash(body.password, 10)
    const user = await prisma.user.create({ data: { name: body.name, email: body.email, phone: body.phone || '', password, role: body.role || 'customer' } })
    res.json({ user: publicUser(user), token: signUser(user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Kayıt oluşturulamadı.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' })
    res.json({ user: publicUser(user), token: signUser(user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Giriş yapılamadı.' })
  }
})

app.get('/api/me', auth, async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } })
  res.json({ user: publicUser(req.user), orders })
})

app.post('/api/orders', auth, async (req, res) => {
  try {
    const body = req.body
    const order = await prisma.order.create({ data: { userId: req.user.id, status: body.status || 'pending', total: number(body.total) } })
    res.json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Sipariş oluşturulamadı.' })
  }
})

app.get('/api/auction-vehicles', async (req, res) => {
  try {
    const vehicles = await prisma.auctionVehicle.findMany({ include: { neededParts: true, boughtParts: true }, orderBy: { createdAt: 'desc' } })
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
        plate: body.plate || '',
        brand: body.brand || '',
        model: body.model || '',
        year: body.year || '',
        status: body.status || 'gelecek',
        purchasePrice: number(body.purchasePrice),
        towCost: number(body.towCost),
        repairCost: number(body.repairCost),
        otherCost: number(body.otherCost),
        salePrice: number(body.salePrice),
        notes: body.notes || '',
        createdBy: body.createdBy || ''
      },
      include: { neededParts: true, boughtParts: true }
    })
    res.json(vehicle)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Araç oluşturulamadı.' })
  }
})

app.put('/api/auction-vehicles/:id', async (req, res) => {
  try {
    const body = req.body
    const data = {}
    for (const key of ['title', 'plate', 'brand', 'model', 'year', 'status', 'notes']) if (body[key] !== undefined) data[key] = body[key]
    for (const key of ['purchasePrice', 'towCost', 'repairCost', 'otherCost', 'salePrice']) if (body[key] !== undefined) data[key] = number(body[key])
    const vehicle = await prisma.auctionVehicle.update({ where: { id: req.params.id }, data, include: { neededParts: true, boughtParts: true } })
    res.json(vehicle)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Araç güncellenemedi.' })
  }
})

app.delete('/api/auction-vehicles/:id', async (req, res) => {
  try {
    await prisma.auctionVehicle.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Araç silinemedi.' })
  }
})

app.post('/api/auction-vehicles/:id/needed-parts', async (req, res) => {
  try {
    const part = await prisma.neededPart.create({ data: { vehicleId: req.params.id, name: req.body.name, addedBy: req.body.addedBy || '', done: Boolean(req.body.done) } })
    res.json(part)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Parça eklenemedi.' })
  }
})

app.put('/api/needed-parts/:id', async (req, res) => {
  try {
    const part = await prisma.neededPart.update({ where: { id: req.params.id }, data: { done: Boolean(req.body.done) } })
    res.json(part)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Parça güncellenemedi.' })
  }
})

app.delete('/api/needed-parts/:id', async (req, res) => {
  try {
    await prisma.neededPart.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Parça silinemedi.' })
  }
})

app.post('/api/auction-vehicles/:id/bought-parts', async (req, res) => {
  try {
    const part = await prisma.boughtPart.create({ data: { vehicleId: req.params.id, name: req.body.name, price: number(req.body.price), buyer: req.body.buyer || '' } })
    res.json(part)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Alınan parça eklenemedi.' })
  }
})

app.delete('/api/bought-parts/:id', async (req, res) => {
  try {
    await prisma.boughtPart.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Alınan parça silinemedi.' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
