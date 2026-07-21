import type { Client, Media, Project } from '@/payload-types'

import { getServerSideURL } from './getURL'
import { lexicalToPlainText } from './lexicalToPlainText'

type JsonLd = Record<string, unknown>

const getMediaAbsoluteUrl = (media: number | Media | null | undefined): string | undefined => {
  if (!media || typeof media !== 'object' || !media.url) return undefined

  const serverUrl = getServerSideURL()
  return media.url.startsWith('http') ? media.url : `${serverUrl}${media.url}`
}

const resolveClient = (client: Project['client']): Client | null => {
  if (client && typeof client === 'object') return client
  return null
}

/**
 * Case-study pages use schema.org CreativeWork: a general, valid type for
 * portfolio/work samples without inventing a custom Payload-stored schema.
 */
export const generateProjectJsonLd = (project: Project, pathname: string): JsonLd => {
  const serverUrl = getServerSideURL()
  const url = `${serverUrl}${pathname}`
  const description =
    project.meta?.description ||
    project.shortDescription ||
    lexicalToPlainText(project.problem) ||
    undefined
  const image =
    getMediaAbsoluteUrl(project.meta?.image) || getMediaAbsoluteUrl(project.featuredImage)
  const client = resolveClient(project.client)

  const jsonLd: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    url,
  }

  if (description) {
    jsonLd.description = description
  }

  if (image) {
    jsonLd.image = image
  }

  if (project.executionYear?.trim()) {
    jsonLd.temporalCoverage = project.executionYear.trim()
  }

  if (client?.name?.trim()) {
    jsonLd.creator = {
      '@type': 'Organization',
      name: client.name.trim(),
      ...(client.website ? { url: client.website } : {}),
    }
  }

  return jsonLd
}

export const buildProjectStructuredDataScripts = (
  project: Project,
  pathname: string,
): JsonLd[] => [generateProjectJsonLd(project, pathname)]
