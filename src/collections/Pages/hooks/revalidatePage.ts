import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

import { locales } from '../../../i18n/config'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      for (const locale of locales) {
        const path = doc.slug === 'home' ? `/${locale}` : `/${locale}/${doc.slug}`
        payload.logger.info(`Revalidating page at path: ${path}`)
        try {
          revalidatePath(path)
        } catch (err) {
          payload.logger.warn(`Could not revalidate path ${path}: ${err instanceof Error ? err.message : err}`)
        }
      }
      try {
        revalidateTag('pages-sitemap', 'max')
      } catch (err) {
        payload.logger.warn(`Could not revalidate tag pages-sitemap: ${err instanceof Error ? err.message : err}`)
      }
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      for (const locale of locales) {
        const oldPath = previousDoc.slug === 'home' ? `/${locale}` : `/${locale}/${previousDoc.slug}`
        payload.logger.info(`Revalidating old page at path: ${oldPath}`)
        try {
          revalidatePath(oldPath)
        } catch (err) {
          payload.logger.warn(`Could not revalidate path ${oldPath}: ${err instanceof Error ? err.message : err}`)
        }
      }
      try {
        revalidateTag('pages-sitemap', 'max')
      } catch (err) {
        payload.logger.warn(`Could not revalidate tag pages-sitemap: ${err instanceof Error ? err.message : err}`)
      }
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    for (const locale of locales) {
      const path = doc?.slug === 'home' ? `/${locale}` : `/${locale}/${doc?.slug}`
      try {
        revalidatePath(path)
      } catch (err) {
        payload.logger.warn(`Could not revalidate path ${path}: ${err instanceof Error ? err.message : err}`)
      }
    }
    try {
      revalidateTag('pages-sitemap', 'max')
    } catch (err) {
      payload.logger.warn(`Could not revalidate tag pages-sitemap: ${err instanceof Error ? err.message : err}`)
    }
  }

  return doc
}
