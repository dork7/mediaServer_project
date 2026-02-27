const express = require('express')

const app = express()
app.use(express.json())

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Media server (browser mode) listening on port ${port}`)
})

app.get('/', (req, res) => {
  const url = req.query.url

  if (!url) {
    return res.json({ status: 'running', message: 'Media server is up. Pass ?url=<URL> to open a page.' })
  }

  console.log('Received URL:', url)

  const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open')
  require('child_process').exec(start + ' "' + url.replace(/"/g, '\\"') + '"')

  res.json({ status: 'opened', url: url })
})

app.post('/', (req, res) => {
  console.log('POST request body:', req.body)
  res.json({ status: 'received', body: req.body })
})
