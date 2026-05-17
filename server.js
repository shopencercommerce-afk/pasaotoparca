const http = require('http')
const handler = require('serve-handler')

const port = process.env.PORT || 3000

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'out',
    cleanUrls: true,
    trailingSlash: true
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Paşa Oto Parça running on port ${port}`)
})
