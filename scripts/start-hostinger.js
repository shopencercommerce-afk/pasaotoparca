const fs = require('fs')
const { spawn, spawnSync } = require('child_process')

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

if (!fs.existsSync('.next')) {
  console.log('Next.js build folder not found. Running npm run build first...')
  run('npm', ['run', 'build'])
}

const port = process.env.PORT || '3000'
const nextBin = process.platform === 'win32' ? 'node_modules/.bin/next.cmd' : 'node_modules/.bin/next'

const child = spawn(nextBin, ['start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

child.on('exit', code => {
  process.exit(code || 0)
})
