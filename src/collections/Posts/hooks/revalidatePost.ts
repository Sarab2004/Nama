import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

import { locales } from '../../../i18n/config'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      for (const locale of locales) {
        const path = `/${locale}/posts/${doc.slug}`
        payload.logger.info(`Revalidating post at path: ${path}`)
        try {
          revalidatePath(path)
        } catch (err) {
          payload.logger.warn(`Could not revalidate path ${path}: ${err instanceof Error ? err.message : err}`)
        }
      }
      try {
        revalidateTag('posts-sitemap', 'max')
      } catch (err) {
        payload.logger.warn(`Could not revalidate tag posts-sitemap: ${err instanceof Error ? err.message : err}`)
      }
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      for (const locale of locales) {
        const oldPath = `/${locale}/posts/${previousDoc.slug}`
        payload.logger.info(`Revalidating old post at path: ${oldPath}`)
        try {
          revalidatePath(oldPath)
        } catch (err) {
          payload.logger.warn(`Could not revalidate path ${oldPath}: ${err instanceof Error ? err.message : err}`)
        }
      }
      try {
        revalidateTag('posts-sitemap', 'max')
      } catch (err) {
        payload.logger.warn(`Could not revalidate tag posts-sitemap: ${err instanceof Error ? err.message : err}`)
      }
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    for (const locale of locales) {
      const path = `/${locale}/posts/${doc?.slug}`
      try {
        revalidatePath(path)
      } catch (err) {
        payload.logger.warn(`Could not revalidate path ${path}: ${err instanceof Error ? err.message : err}`)
      }
    }
    try {
      revalidateTag('posts-sitemap', 'max')
    } catch (err) {
      payload.logger.warn(`Could not revalidate tag posts-sitemap: ${err instanceof Error ? err.message : err}`)
    }
  }

  return doc
}
