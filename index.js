const { app, BrowserWindow, session } = require('electron')
const express = require('express')

const mediaRoutes = require('./routes/media')
const playbackRoutes = require('./routes/playback')
const volumeRoutes = require('./routes/volume')
const { router: cronRoutes, restoreCronJobs } = require('./routes/cron')
const scheduleRoutes = require('./routes/schedule')

const expressAPP = express()
expressAPP.use(express.json())

const port = process.env.PORT || 2266

expressAPP.use(mediaRoutes)
expressAPP.use(playbackRoutes)
expressAPP.use(volumeRoutes)
expressAPP.use(cronRoutes)
expressAPP.use(scheduleRoutes)

function createWindow() {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.includes('youtube.com') || details.url.includes('googlevideo.com')) {
      details.requestHeaders['Referer'] = 'https://www.youtube.com/'
    }
    callback({ requestHeaders: details.requestHeaders })
  })

  expressAPP.listen(port, () => {
    console.log(`Media server listening on port ${port}`)
    restoreCronJobs()
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
