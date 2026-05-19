const { spawn, spawnSync } = require('child_process')
const fs = require('fs')

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })

  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

const hasBuild = fs.existsSync('.next/BUILD_ID')
const shouldBuild = process.env.FORCE_BUILD_ON_START === '1' || !hasBuild

if (shouldBuild) {
  console.log('Running Next.js build before start...')
  run('npm', ['run', 'build'])
} else {
  console.log('Using existing Next.js build (.next/BUILD_ID found).')
}

const port = process.env.PORT || '3000'
const nextBin = process.platform === 'win32'
  ? 'node_modules/.bin/next.cmd'
  : 'node_modules/.bin/next'

const child = spawn(nextBin, ['start', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
})

child.on('exit', code => {
  process.exit(code || 0)
})
