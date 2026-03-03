const fs = require('fs')
const path = require('path')

const LOG_DIR = path.join(__dirname, 'logs')
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR)
}

function log(filename, entry) {
  const filePath = path.join(LOG_DIR, filename)
  const timestamp = new Date().toISOString()
  const line = JSON.stringify({ timestamp, ...entry }) + '\n' + '--------------------------------' + '\n'
  fs.appendFileSync(filePath, line)
}

module.exports = { log }
