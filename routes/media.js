const { Router } = require('express')
const { exec } = require('child_process')
const { getWindow, setWindow, createMediaWindow } = require('../windowManager')
const { log } = require('../logger')

const router = Router()

router.get('/', (req, res) => {
  const url = req.query.url

  if (!url) {
    return res.json({ status: 'running', message: 'Media server is up. Pass ?url=<URL> to open a page.' })
  }

  log('media.log', { method: 'GET', url, query: req.query })

  exec('pkill chromium', (err) => {
    if (err) console.log('pkill chromium: no matching processes or error')
  })

  console.log('Received URL:', url)

  if (url === 'KILL_app') {
    const win = getWindow()
    if (win) {
      if (!win.isDestroyed()) {
        win.destroy()
      }
      setWindow(null)
    }
    exec('pkill -f chromium', (err) => {
      if (err) console.log('pkill chromium: no matching processes or error')
    })
    return res.json({ status: 'closed', message: 'Window closed' })
  }

  let win = getWindow()
  if (!win) {
    win = createMediaWindow()
  }

  if (url.includes('youtu')) {
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^\s?&]+)/)
    const videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)

    if (shortsMatch && shortsMatch[1]) {
      console.log('Shorts Video ID:', shortsMatch[1])
      win.loadURL('https://www.youtube.com/shorts/' + shortsMatch[1])
    } else if (videoid && videoid[1]) {
      console.log('Video ID:', videoid[1])
      win.loadURL('https://www.youtube.com/watch?v=' + videoid[1])
    } else {
      win.loadURL(url)
    }
  } else {
    win.loadURL(url)
  }

  res.json({ status: 'opened', url: url })
})

router.post('/', (req, res) => {
  log('media.log', { method: 'POST', body: req.body })
  res.json({ status: 'received', body: req.body })
})

module.exports = router


  