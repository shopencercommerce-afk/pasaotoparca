const fs = require('fs')
const path = require('path')

const root = process.cwd()
const outDir = path.join(root, 'out')
const nextDir = path.join(root, '.next')
const pagesDir = path.join(nextDir, 'server', 'pages')
const nextStaticDir = path.join(nextDir, 'static')
const publicDir = path.join(root, 'public')

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
  }
}

function writePage(sourceName, outputPath) {
  const sourcePath = path.join(pagesDir, sourceName)
  if (!fs.existsSync(sourcePath)) return
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.copyFileSync(sourcePath, outputPath)
}

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

copyRecursive(publicDir, outDir)
copyRecursive(nextStaticDir, path.join(outDir, '_next', 'static'))

writePage('index.html', path.join(outDir, 'index.html'))
writePage('products.html', path.join(outDir, 'products', 'index.html'))
writePage('404.html', path.join(outDir, '404.html'))

if (!fs.existsSync(path.join(outDir, 'index.html'))) {
  throw new Error('Static export failed: out/index.html could not be created')
}

console.log('Static output prepared in /out')
