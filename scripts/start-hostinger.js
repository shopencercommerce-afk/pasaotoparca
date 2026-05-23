const { spawn, spawnSync } = require('child_process')
const fs = require('fs')

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })

  if (result.status !== 0 && !options.allowFailure) {
    process.exit(result.status || 1)
  }

  return result.status === 0
}

const hasBuild = fs.existsSync('.next/BUILD_ID')
const forceBuild = true

if (forceBuild || !hasBuild) {
  console.log('Running Next.js build before start...')
  const buildOk = run('npm', ['run', 'build'], { allowFailure: hasBuild })

  if (!buildOk && hasBuild) {
    console.log('Build failed, but existing .next build was found. Starting existing build to avoid 503.')
  }
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
