import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Service } from '../../../payload-types'

import { locales } from '../../../i18n/config'

const revalidateServicePaths = (slug: string | null | undefined, logger: { info: (msg: string) => void; warn: (msg: string) => void }) => {
  if (!slug) return

  for (const locale of locales) {
    const detailPath = `/${locale}/services/${slug}`
    const listPath = `/${locale}/services`

    logger.info(`Revalidating service at path: ${detailPath}`)
    try {
      revalidatePath(detailPath)
    } catch (err) {
      logger.warn(
        `Could not revalidate path ${detailPath}: ${err instanceof Error ? err.message : err}`,
      )
    }

    try {
      revalidatePath(listPath)
    } catch (err) {
      logger.warn(
        `Could not revalidate path ${listPath}: ${err instanceof Error ? err.message : err}`,
      )
    }
  }
}

export const revalidateService: CollectionAfterChangeHook<Service> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc._status === 'published') {
    revalidateServicePaths(doc.slug, payload.logger)

    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      revalidateServicePaths(previousDoc.slug, payload.logger)
    }
  }

  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    revalidateServicePaths(previousDoc.slug, payload.logger)
  }

  return doc
}

export const revalidateServiceDelete: CollectionAfterDeleteHook<Service> = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    revalidateServicePaths(doc?.slug, payload.logger)
  }

  return doc
}
