import type { Metadata } from 'next'

import type { Client, Media, Page, Post, Project, Service, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

type MetaDoc =
  | Partial<Page>
  | Partial<Post>
  | Partial<Service>
  | Partial<Project>
  | Partial<Client>
  | null

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

const getFallbackImage = (doc: MetaDoc) => {
  if (!doc) return null

  if ('featuredImage' in doc && doc.featuredImage) {
    return doc.featuredImage
  }

  if ('logo' in doc && doc.logo) {
    return doc.logo
  }

  return null
}

const getFallbackTitle = (doc: MetaDoc): string | undefined => {
  if (!doc) return undefined

  if ('title' in doc && typeof doc.title === 'string' && doc.title) {
    return doc.title
  }

  if ('name' in doc && typeof doc.name === 'string' && doc.name) {
    return doc.name
  }

  return undefined
}

const getShortDescription = (doc: MetaDoc) => {
  if (doc && 'shortDescription' in doc && typeof doc.shortDescription === 'string') {
    return doc.shortDescription
  }

  return undefined
}

export const generateMeta = async (args: {
  doc: MetaDoc
  /**
   * Public pathname without locale prefix, e.g. `/services/my-slug`.
   * When provided, sets Open Graph URL and canonical.
   */
  pathname?: string
}): Promise<Metadata> => {
  const { doc, pathname } = args

  const ogImage = getImageURL(doc?.meta?.image || getFallbackImage(doc))
  const fallbackTitle = getFallbackTitle(doc)

  const title = doc?.meta?.title
    ? `${doc.meta.title} | قالب وب‌سایت صنعتی`
    : fallbackTitle
      ? `${fallbackTitle} | قالب وب‌سایت صنعتی`
      : 'قالب وب‌سایت صنعتی'

  const description = doc?.meta?.description || getShortDescription(doc)

  const path =
    pathname ||
    (Array.isArray(doc?.slug) ? `/${doc.slug.join('/')}` : doc?.slug ? `/${doc.slug}` : '/')

  return {
    description,
    ...(pathname
      ? {
          alternates: {
            canonical: `${getServerSideURL()}${pathname}`,
          },
        }
      : {}),
    openGraph: mergeOpenGraph({
      description: description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: path,
    }),
    title,
  }
}
