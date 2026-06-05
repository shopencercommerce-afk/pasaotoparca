import prisma from '../../../lib/prisma'

function esc(value) {
  return String(value || '').replace(/'/g, "''")
}

async function listTasks(vehicleId) {
  return prisma.$queryRawUnsafe(`SELECT * FROM VehicleTask WHERE vehicleId='${esc(vehicleId)}' ORDER BY createdAt ASC`)
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const body = req.body || {}
    const vehicleId = String(body.vehicleId || '')
    const tasks = Array.isArray(body.tasks) ? body.tasks : []

    if (!vehicleId) return res.status(400).json({ error: 'vehicleId zorunlu.' })

    await prisma.$executeRawUnsafe(`DELETE FROM VehicleTask WHERE vehicleId='${esc(vehicleId)}'`)

    for (const task of tasks) {
      const title = esc(task.title || '')
      if (!title) continue
      const done = task.done ? 1 : 0
      const assignedTo = esc(task.assignedTo || '')
      await prisma.$executeRawUnsafe(`INSERT INTO VehicleTask (id,title,done,assignedTo,vehicleId) VALUES (UUID(),'${title}',${done},'${assignedTo}','${esc(vehicleId)}')`)
    }

    return res.status(200).json(await listTasks(vehicleId))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
