openURL()

function openURL() {
  const url = 'http://localhost:3000'
  const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open')
  require('child_process').exec(start + ' ' + url)
}
