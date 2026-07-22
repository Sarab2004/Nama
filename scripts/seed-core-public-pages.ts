import 'dotenv/config'
import { getPayload } from 'payload'

import { seedCorePublicPages } from '../src/endpoints/seed/core-public-pages'
import config from '../src/payload.config'

const run = async () => {
  const payload = await getPayload({ config })
  await seedCorePublicPages({ payload, req: {} as never })
  console.log('Core public pages bootstrapped successfully.')
}

run().catch((error: unknown) => {
  console.error('Core public pages bootstrap failed:', error)
  process.exitCode = 1
})
