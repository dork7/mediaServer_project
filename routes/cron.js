const { Router } = require('express')
const fs = require('fs')
const path = require('path')

const router = Router()

const cronJobs = new Map()
let cronJobIdCounter = 1
const CRON_FILE = path.join(__dirname, '..', 'cron-jobs.json')

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

router.post('/cron', (req, res) => {
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
const SERVER =  'http://localhost:2266'

router.post('/cron/batch', (req, res) => {
  const { urls, intervalSeconds = 10 } = req.body

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ status: 'error', message: 'urls array is required' })
  }

  const created = []
  for (const entry of urls) {
    let url = typeof entry === 'string' ? entry : entry.url
    const seconds = (typeof entry === 'object' && entry.intervalSeconds) || intervalSeconds

    url = SERVER + '/?url=' + url

    if (!url) continue

    const id = cronJobIdCounter++
    const config = {
      id, name: `Job #${id}`, url, method: 'GET', headers: {},
      body: null, intervalSeconds: seconds,
      createdAt: new Date().toISOString()
    }
    startCronJob(config)
    created.push({ id, url, intervalSeconds: seconds })
  }

  saveCronConfig()
  res.json({ status: 'created', count: created.length, jobs: created })
})

router.get('/cron', (req, res) => {
  const jobs = []
  for (const [, job] of cronJobs) {
    const { intervalHandle, ...rest } = job
    jobs.push(rest)
  }
  res.json({ status: 'ok', count: jobs.length, jobs })
})

router.delete('/cron/:id', (req, res) => {
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

router.delete('/cron', (req, res) => {
  const count = cronJobs.size
  for (const [, job] of cronJobs) {
    clearInterval(job.intervalHandle)
  }
  cronJobs.clear()
  saveCronConfig()
  res.json({ status: 'deleted', count })
})

module.exports = { router, restoreCronJobs }
