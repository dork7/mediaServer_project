const { Router } = require('express')
const { exec } = require('child_process')
const { getWindow } = require('../windowManager')

const router = Router()

router.get('/volume', (req, res) => {
  const level = parseInt(req.query.level, 10)
  const system = req.query.system

  if (isNaN(level) || level < 0) {
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

  const win = getWindow()
  if (!win) {
    return res.status(404).json({ status: 'error', message: 'No media window open' })
  }

  const volume = level / 100
  win.webContents.executeJavaScript(`
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

router.get('/mute', (req, res) => {
  const win = getWindow()
  if (!win) {
    return res.status(404).json({ status: 'error', message: 'No media window open' })
  }

  win.webContents.executeJavaScript(`
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

module.exports = router
