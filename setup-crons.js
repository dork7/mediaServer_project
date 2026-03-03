const SERVER =  'http://localhost:2266'

const jobs = [
  {
    name: 'Post data every minute',
    url: '/',
    method: 'POST',
    body: { key: 'value' },
    intervalSeconds: 10
  },
  // Add more jobs here:
  // {
  //   name: 'Health check',
  //   url: 'https://httpbin.org/get',
  //   method: 'GET',
  //   intervalSeconds: 30
  // },
]

async function createCronJob(job) {
  try {
    const res = await fetch(`${SERVER}/cron`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    })
    const data = await res.json()
    console.log(`[OK] ${job.name} -> id: ${data.id}`)
  } catch (err) {
    console.error(`[FAIL] ${job.name} -> ${err.message}`)
  }
}

async function main() {
  console.log(`Creating ${jobs.length} cron job(s) on ${SERVER}...\n`)
  for (const job of jobs) {
    job.url = SERVER + job.url
    await createCronJob(job)
  }
  console.log('\nDone.')
}

main()
