import prisma from '../../lib/prisma'

const SETUP_KEY = process.env.SETUP_KEY || 'pasa-setup-2026'

export default async function handler(req, res) {
  if (req.query.key !== SETUP_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS StockItem (
        id VARCHAR(191) NOT NULL,
        brand VARCHAR(191) NOT NULL DEFAULT 'Togg',
        productName VARCHAR(191) NOT NULL,
        partCode VARCHAR(191) NULL,
        quantity INT NOT NULL DEFAULT 1,
        buyPrice DOUBLE NOT NULL DEFAULT 0,
        salePrice DOUBLE NOT NULL DEFAULT 0,
        boughtBy VARCHAR(191) NULL,
        source VARCHAR(191) NULL,
        status VARCHAR(191) NOT NULL DEFAULT 'stok',
        note TEXT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS AuctionVehicle (
        id VARCHAR(191) NOT NULL,
        title VARCHAR(191) NOT NULL,
        plate VARCHAR(191) NULL,
        brand VARCHAR(191) NULL,
        model VARCHAR(191) NULL,
        year VARCHAR(191) NULL,
        status VARCHAR(191) NOT NULL DEFAULT 'gelecek',
        purchasePrice DOUBLE NOT NULL DEFAULT 0,
        auctionCommission DOUBLE NOT NULL DEFAULT 0,
        cardCommission DOUBLE NOT NULL DEFAULT 0,
        notaryCost DOUBLE NOT NULL DEFAULT 0,
        towCost DOUBLE NOT NULL DEFAULT 0,
        repairCost DOUBLE NOT NULL DEFAULT 0,
        otherCost DOUBLE NOT NULL DEFAULT 0,
        salePrice DOUBLE NOT NULL DEFAULT 0,
        notes TEXT NULL,
        createdBy VARCHAR(191) NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS NeededPart (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        done BOOLEAN NOT NULL DEFAULT false,
        addedBy VARCHAR(191) NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        vehicleId VARCHAR(191) NOT NULL,
        INDEX NeededPart_vehicleId_idx(vehicleId),
        PRIMARY KEY (id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS BoughtPart (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        price DOUBLE NOT NULL DEFAULT 0,
        buyer VARCHAR(191) NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        vehicleId VARCHAR(191) NOT NULL,
        INDEX BoughtPart_vehicleId_idx(vehicleId),
        PRIMARY KEY (id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `)

    return res.status(200).json({ ok: true, message: 'Database tables are ready.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ ok: false, error: error.message || 'Database setup failed' })
  }
}
