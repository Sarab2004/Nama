import type { Metadata } from 'next'

import type { Media, Page, Post, Service, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

type MetaDoc = Partial<Page> | Partial<Post> | Partial<Service> | null

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

const getFeaturedImage = (doc: MetaDoc) => {
  if (doc && 'featuredImage' in doc) {
    return doc.featuredImage
  }

  return null
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

  const ogImage = getImageURL(doc?.meta?.image || getFeaturedImage(doc))

  const title = doc?.meta?.title
    ? `${doc.meta.title} | قالب وب‌سایت صنعتی`
    : doc?.title
      ? `${doc.title} | قالب وب‌سایت صنعتی`
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
