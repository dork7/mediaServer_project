const { Router } = require('express')
const { getWindow } = require('../windowManager')

const router = Router()

router.get('/pause', (req, res) => {
  const win = getWindow()
  if (!win) {
    return res.status(404).json({ status: 'error', message: 'No media window open' })
  }

  win.webContents.executeJavaScript(`
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

router.get('/resume', (req, res) => {
  const win = getWindow()
  if (!win) {
    return res.status(404).json({ status: 'error', message: 'No media window open' })
  }

  win.webContents.executeJavaScript(`
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

router.get('/fullscreen', (req, res) => {
  const win = getWindow()
  if (!win) {
    return res.status(404).json({ status: 'error', message: 'No media window open' })
  }

  const isFullScreen = win.isFullScreen()
  win.setFullScreen(!isFullScreen)
  res.json({ status: 'ok', fullscreen: !isFullScreen })
})

module.exports = router
