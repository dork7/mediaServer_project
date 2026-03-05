const { Router } = require('express')
const { cronJobs, getCronJobId, startCronJob, saveCronConfig } = require('./cron')

const router = Router()
const SERVER =  'http://localhost:2266'

router.post('/schedule', (req, res) => {
  const { urls } = req.body

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ status: 'error', message: 'urls array is required' })
  }

  const now = new Date()
  const scheduled = []

  for (const entry of urls) {
    let url = entry.url
    const time = String(entry.time).padStart(4, '0')
    url = SERVER + '/?url=' + url
    if (!url || !time || time.length !== 4) continue

    const hours = parseInt(time.slice(0, 2), 10)
    const minutes = parseInt(time.slice(2, 4), 10)

    if (hours > 23 || minutes > 59) continue

    const target = new Date(now)
    target.setHours(hours, minutes, 0, 0)
    if (target <= now) target.setDate(target.getDate() + 1)

    const delaySeconds = Math.round((target - now) / 1000)

    const id = getCronJobId()
    const config = {
      id, name: `Schedule #${id}`, url, method: 'GET', headers: {},
      body: null, intervalSeconds: delaySeconds, runOnce: true,
      createdAt: new Date().toISOString()
    }
    startCronJob(config)

    const runsAt = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    scheduled.push({ id, url, time: runsAt, delaySeconds })
  }

  saveCronConfig()
  res.json({ status: 'scheduled', count: scheduled.length, jobs: scheduled })
})

module.exports = router
