import { createLocalReq, getPayload } from 'payload'
import { headers } from 'next/headers'

import config from '@payload-config'
import { seedCorePublicPages } from '@/endpoints/seed/core-public-pages'

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return new Response('Unauthorized', { status: 403 })

  try {
    const req = await createLocalReq({ user }, payload)
    await seedCorePublicPages({ payload, req })
    return Response.json({ success: true })
  } catch (error) {
    payload.logger.error({ err: error, message: 'Core public pages bootstrap failed' })
    return new Response('Core public pages bootstrap failed.', { status: 500 })
  }
}
