const fs = require('fs')
const path = require('path')

const root = process.cwd()
const outDir = path.join(root, 'out')
const indexFile = path.join(outDir, 'index.html')

if (fs.existsSync(indexFile)) {
  console.log('Next.js static export already exists in /out. Keeping all generated pages, including product detail pages.')
  process.exit(0)
}

throw new Error('Static export failed: out/index.html was not found after next build')
