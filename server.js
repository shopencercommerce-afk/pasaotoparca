const http = require('http')
const next = require('next')

const port = Number(process.env.PORT || 3000)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, hostname: '0.0.0.0', port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res))

  server.listen(port, '0.0.0.0', () => {
    console.log(`Paşa Oto Parça running on http://0.0.0.0:${port}`)
  })
})
