const { app, BrowserWindow, session } = require('electron')
const express = require('express')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const expressAPP = express()
expressAPP.use(express.json())

const port = process.env.PORT || 2266

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

let winYoutube
const cronJobs = new Map()
let cronJobIdCounter = 1
const CRON_FILE = path.join(__dirname, 'cron-jobs.json')

function saveCronConfig() {
  const configs = []
  for (const [, job] of cronJobs) {
    const { intervalHandle, lastRun, lastStatus, lastError, runCount, ...config } = job
    configs.push(config)
  }
  fs.writeFileSync(CRON_FILE, JSON.stringify(configs, null, 2))
}

function loadCronConfig() {
  try {
    if (fs.existsSync(CRON_FILE)) {
      return JSON.parse(fs.readFileSync(CRON_FILE, 'utf-8'))
    }
  } catch (err) {
    console.error('Failed to load cron config:', err.message)
  }
  return []
}

function startCronJob(config) {
  const { id, name, url, method, headers = {}, body, intervalSeconds, createdAt } = config
  const fetchOptions = { method, headers: { ...headers } }
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
    if (!fetchOptions.headers['Content-Type']) {
      fetchOptions.headers['Content-Type'] = 'application/json'
    }
  }

  const execute = async () => {
    try {
      const response = await fetch(url, fetchOptions)
      const job = cronJobs.get(id)
      if (job) {
        job.lastRun = new Date().toISOString()
        job.lastStatus = response.status
        job.lastError = null
        job.runCount++
      }
      console.log(`[Cron #${id}] ${method} ${url} -> ${response.status}`)
    } catch (err) {
      const job = cronJobs.get(id)
      if (job) {
        job.lastRun = new Date().toISOString()
        job.lastStatus = 'error'
        job.lastError = err.message
        job.runCount++
      }
      console.error(`[Cron #${id}] ${method} ${url} -> ERROR: ${err.message}`)
    }
  }

  const intervalHandle = setInterval(execute, intervalSeconds * 1000)

  cronJobs.set(id, {
    id, name, url, method, headers,
    body: body || null, intervalSeconds, intervalHandle,
    createdAt: createdAt || new Date().toISOString(),
    lastRun: null, lastStatus: null, lastError: null, runCount: 0
  })

  console.log(`[Cron #${id}] Started "${name}" — ${method} ${url} every ${intervalSeconds}s`)
}

function restoreCronJobs() {
  const configs = loadCronConfig()
  if (configs.length === 0) return
  console.log(`Restoring ${configs.length} cron job(s) from ${CRON_FILE}`)
  for (const config of configs) {
    startCronJob(config)
    if (config.id >= cronJobIdCounter) {
      cronJobIdCounter = config.id + 1
    }
  }
}

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
    restoreCronJobs()
  })

  expressAPP.get('/', (req, res) => {
    const url = req.query.url

    if (!url) {
      return res.json({ status: 'running', message: 'Media server is up. Pass ?url=<URL> to open a page.' })
    }

    console.log('Received URL:', url)

    if (url === 'KILL_app') {
      if (winYoutube) {
        if (!winYoutube.isDestroyed()) {
          winYoutube.destroy()
        }
        winYoutube = null
      }
      exec('pkill -f chromium', (err) => {
        if (err) console.log('pkill chromium: no matching processes or error')
      })
      return res.json({ status: 'closed', message: 'Window closed' })
    }

    if (!winYoutube) {
      winYoutube = createMediaWindow()
    }

    if (url.includes('youtu')) {
      const videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
      if (videoid && videoid[1]) {
        console.log('Video ID:', videoid[1])
        winYoutube.loadURL('https://www.youtube.com/watch?v=' + videoid[1])
      } else {
        winYoutube.loadURL(url)
      }
    } else {
      winYoutube.loadURL(url)
    }

    res.json({ status: 'opened', url: url })
  })

  expressAPP.get('/volume', (req, res) => {
    const level = parseInt(req.query.level, 10)
    const system = req.query.system

    if (isNaN(level) || level < 0 ) {
      return res.status(400).json({ status: 'error', message: 'Pass ?level=0 to ?level=100. Add &system=true for system volume.' })
    }

    if (system === 'true') {
      const cmd = process.platform === 'linux'
        ? `amixer set Master ${level}%`
        : process.platform === 'darwin'
          ? `osascript -e "set volume output volume ${level}"`
          : null

      if (!cmd) {
        return res.status(400).json({ status: 'error', message: 'System volume not supported on this platform' })
      }

      exec(cmd, (err) => {
        if (err) {
          return res.status(500).json({ status: 'error', message: 'Failed to set system volume', detail: err.message })
        }
        res.json({ status: 'ok', systemVolume: level })
      })
      return
    }

    if (!winYoutube) {
      return res.status(404).json({ status: 'error', message: 'No media window open' })
    }

    const volume = level / 100
    winYoutube.webContents.executeJavaScript(`
      (() => {
        const v = document.querySelector('video');
        if (v) { v.volume = ${volume}; return v.volume; }
        return null;
      })()
    `).then(result => {
      if (result !== null) {
        res.json({ status: 'ok', volume: level })
      } else {
        res.json({ status: 'warning', message: 'No video element found on page' })
      }
    }).catch(() => {
      res.status(500).json({ status: 'error', message: 'Failed to set volume' })
    })
  })

  expressAPP.get('/mute', (req, res) => {
    if (!winYoutube) {
      return res.status(404).json({ status: 'error', message: 'No media window open' })
    }

    winYoutube.webContents.executeJavaScript(`
      (() => {
        const v = document.querySelector('video');
        if (v) { v.muted = !v.muted; return v.muted; }
        return null;
      })()
    `).then(muted => {
      if (muted !== null) {
        res.json({ status: 'ok', muted })
      } else {
        res.json({ status: 'warning', message: 'No video element found on page' })
      }
    }).catch(() => {
      res.status(500).json({ status: 'error', message: 'Failed to toggle mute' })
    })
  })

  expressAPP.get('/pause', (req, res) => {
    if (!winYoutube) {
      return res.status(404).json({ status: 'error', message: 'No media window open' })
    }

    winYoutube.webContents.executeJavaScript(`
      (() => {
        const v = document.querySelector('video');
        if (v) { v.pause(); return true; }
        return false;
      })()
    `).then(ok => {
      res.json({ status: ok ? 'paused' : 'warning', message: ok ? 'Playback paused' : 'No video element found' })
    }).catch(() => {
      res.status(500).json({ status: 'error', message: 'Failed to pause' })
    })
  })

  expressAPP.get('/resume', (req, res) => {
    if (!winYoutube) {
      return res.status(404).json({ status: 'error', message: 'No media window open' })
    }

    winYoutube.webContents.executeJavaScript(`
      (() => {
        const v = document.querySelector('video');
        if (v) { v.play(); return true; }
        return false;
      })()
    `).then(ok => {
      res.json({ status: ok ? 'playing' : 'warning', message: ok ? 'Playback resumed' : 'No video element found' })
    }).catch(() => {
      res.status(500).json({ status: 'error', message: 'Failed to resume' })
    })
  })

  expressAPP.get('/fullscreen', (req, res) => {
    if (!winYoutube) {
      return res.status(404).json({ status: 'error', message: 'No media window open' })
    }

    const isFullScreen = winYoutube.isFullScreen()
    winYoutube.setFullScreen(!isFullScreen)
    res.json({ status: 'ok', fullscreen: !isFullScreen })
  })

  expressAPP.post('/', (req, res) => {
    console.log('POST request body:', req.body)
    res.json({ status: 'received', body: req.body })
  })

  expressAPP.post('/cron', (req, res) => {
    const { url, method = 'GET', headers = {}, body, intervalSeconds, name } = req.body

    if (!url || !intervalSeconds) {
      return res.status(400).json({ status: 'error', message: 'url and intervalSeconds are required' })
    }
    if (intervalSeconds < 1) {
      return res.status(400).json({ status: 'error', message: 'intervalSeconds must be at least 1' })
    }

    const id = cronJobIdCounter++
    const config = {
      id, name: name || `Job #${id}`, url, method, headers,
      body: body || null, intervalSeconds,
      createdAt: new Date().toISOString()
    }

    startCronJob(config)
    saveCronConfig()

    res.json({ status: 'created', id: config.id, name: config.name, intervalSeconds, url, method })
  })

  expressAPP.get('/cron', (req, res) => {
    const jobs = []
    for (const [, job] of cronJobs) {
      const { intervalHandle, ...rest } = job
      jobs.push(rest)
    }
    res.json({ status: 'ok', count: jobs.length, jobs })
  })

  expressAPP.delete('/cron/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)
    const job = cronJobs.get(id)
    if (!job) {
      return res.status(404).json({ status: 'error', message: `Cron job #${id} not found` })
    }
    clearInterval(job.intervalHandle)
    cronJobs.delete(id)
    saveCronConfig()
    res.json({ status: 'deleted', id, name: job.name })
  })

  expressAPP.delete('/cron', (req, res) => {
    const count = cronJobs.size
    for (const [, job] of cronJobs) {
      clearInterval(job.intervalHandle)
    }
    cronJobs.clear()
    saveCronConfig()
    res.json({ status: 'deleted', count })
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
