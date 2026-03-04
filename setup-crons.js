const SERVER = 'http://localhost:2266'

const urls = [
  { url: 'https://www.youtube.com/shorts/a-1lZvvTNOs', intervalSeconds: 30 },
  { url: 'https://www.youtube.com/shorts/a-1lZvvTNOs', intervalSeconds: 30 },
  // Add more URLs here:
  // 'https://httpbin.org/get',
  // { url: 'https://httpbin.org/ip', intervalSeconds: 60 },
]

const defaultInterval = 10

async function main() {
  console.log(`Creating ${urls.length} cron job(s) on ${SERVER}...\n`)
  try {
    const res = await fetch(`${SERVER}/cron/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls, intervalSeconds: defaultInterval })
    })
    const data = await res.json()
    console.log(`[OK] Created ${data.count} job(s):`)
    for (const job of data.jobs) {
      console.log(`  #${job.id} -> ${job.url} every ${job.intervalSeconds}s`)
    }
  } catch (err) {
    console.error(`[FAIL] ${err.message}`)
  }
  console.log('\nDone.')
}

main()
