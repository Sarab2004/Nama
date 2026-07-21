import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { seed } from '../src/endpoints/seed'

async function run() {
  const payload = await getPayload({ config })
  await seed({ payload, req: {} as any })
  console.log('Database seeded successfully from CLI.')
  process.exit(0)
}

run().catch((err) => {
  console.error('Seed Error Detail:')
  if (err && err.data) {
    console.error(JSON.stringify(err.data, null, 2))
  } else {
    console.error(err)
  }
  process.exit(1)
})
