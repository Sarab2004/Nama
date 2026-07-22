import type { Client, Media } from '@/payload-types'

import { getServerSideURL } from './getURL'
import { lexicalToPlainText } from './lexicalToPlainText'

type JsonLd = Record<string, unknown>

const getMediaAbsoluteUrl = (media: number | Media | null | undefined): string | undefined => {
  if (!media || typeof media !== 'object' || !media.url) return undefined

  const serverUrl = getServerSideURL()
  return media.url.startsWith('http') ? media.url : `${serverUrl}${media.url}`
}

/**
 * Client profile pages use schema.org Organization for employer identity.
 * Only populated fields are included; no invented contact data.
 */
export const generateClientJsonLd = (client: Client, pathname: string): JsonLd => {
  const serverUrl = getServerSideURL()
  const url = `${serverUrl}${pathname}`
  const description =
    client.meta?.description ||
    client.shortDescription ||
    lexicalToPlainText(client.description) ||
    undefined
  const logo =
    getMediaAbsoluteUrl(client.meta?.image) || getMediaAbsoluteUrl(client.logo)

  const jsonLd: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: client.name,
    url,
  }

  if (description) {
    jsonLd.description = description
  }

  if (logo) {
    jsonLd.logo = logo
  }

  if (client.website?.trim()) {
    jsonLd.sameAs = [client.website.trim()]
  }

  return jsonLd
}

export const buildClientStructuredDataScripts = (
  client: Client,
  pathname: string,
): JsonLd[] => [generateClientJsonLd(client, pathname)]
