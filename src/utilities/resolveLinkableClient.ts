import type { Client, Project } from '@/payload-types'

/** Published clients with a slug may link to `/clients/[slug]`. */
export const resolveLinkableClient = (
  client: Project['client'] | Client | null | undefined,
): Client | null => {
  if (!client || typeof client !== 'object') return null
  if (client._status && client._status !== 'published') return null
  if (!client.slug || !client.name) return null
  return client
}
