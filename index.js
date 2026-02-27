const { app, BrowserWindow, session } = require('electron')
const express = require('express')

const expressAPP = express()
expressAPP.use(express.json())

const port = process.env.PORT || 2266

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

let winYoutube

function createMediaWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      autoplayPolicy: 'no-user-gesture-required'
    }
  })
  win.maximize()
  win.on('closed', () => { winYoutube = null })
  win.webContents.setUserAgent(CHROME_UA)
  return win
}

function createWindow() {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.includes('youtube.com') || details.url.includes('googlevideo.com')) {
      details.requestHeaders['Referer'] = 'https://www.youtube.com/'
    }
    callback({ requestHeaders: details.requestHeaders })
  })

  expressAPP.listen(port, () => {
    console.log(`Media server listening on port ${port}`)
  })

  expressAPP.get('/', (req, res) => {
    const url = req.query.url

    if (!url) {
      return res.json({ status: 'running', message: 'Media server is up. Pass ?url=<URL> to open a page.' })
    }

    console.log('Received URL:', url)

    if (url === 'KILL_app') {
      if (winYoutube) {
        winYoutube.close()
        winYoutube = null
      }
      return res.json({ status: 'closed', message: 'Window closed' })
    }

    if (url.includes('youtu')) {
      if (!winYoutube) {
        winYoutube = createMediaWindow()
      }

      const videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
      if (videoid && videoid[1]) {
        console.log('Video ID:', videoid[1])
        winYoutube.loadURL('https://www.youtube.com/watch?v=' + videoid[1])
      } else {
        winYoutube.loadURL(url)
      }
    } else {
      if (!winYoutube) {
        winYoutube = createMediaWindow()
      }
      winYoutube.loadURL(url)
    }

    res.json({ status: 'opened', url: url })
  })

  expressAPP.post('/', (req, res) => {
    console.log('POST request body:', req.body)
    res.json({ status: 'received', body: req.body })
  })

  const win = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
  win.hide()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
