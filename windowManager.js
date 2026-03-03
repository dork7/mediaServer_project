const { BrowserWindow } = require('electron')

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

let winYoutube = null

function getWindow() {
  return winYoutube
}

function setWindow(win) {
  winYoutube = win
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
  winYoutube = win
  return win
}

module.exports = { getWindow, setWindow, createMediaWindow }
