import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Project, Service } from '../../../payload-types'

import { locales } from '../../../i18n/config'

const revalidatePathSafe = (
  path: string,
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
) => {
  logger.info(`Revalidating project path: ${path}`)
  try {
    revalidatePath(path)
  } catch (err) {
    logger.warn(`Could not revalidate path ${path}: ${err instanceof Error ? err.message : err}`)
  }
}

const revalidateProjectPaths = (
  slug: string | null | undefined,
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
) => {
  if (!slug) return

  for (const locale of locales) {
    revalidatePathSafe(`/${locale}/projects/${slug}`, logger)
    revalidatePathSafe(`/${locale}/projects`, logger)
  }
}

const collectServiceIds = (services: Project['services']): number[] => {
  if (!Array.isArray(services)) return []

  return services
    .map((service) => {
      if (typeof service === 'number') return service
      if (service && typeof service === 'object' && typeof service.id === 'number') return service.id
      return null
    })
    .filter((id): id is number => typeof id === 'number')
}

const collectServiceSlugs = (services: Project['services']): string[] => {
  if (!Array.isArray(services)) return []

  return services
    .map((service) => {
      if (service && typeof service === 'object') return service.slug || null
      return null
    })
    .filter((slug): slug is string => Boolean(slug))
}

const resolveRelatedServiceSlugs = async (
  services: Project['services'],
  payload: Payload,
): Promise<string[]> => {
  const populatedSlugs = collectServiceSlugs(services)
  if (populatedSlugs.length > 0) {
    return [...new Set(populatedSlugs)]
  }

  const ids = collectServiceIds(services)
  if (ids.length === 0) return []

  const result = await payload.find({
    collection: 'services',
    depth: 0,
    limit: ids.length,
    overrideAccess: true,
    pagination: false,
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      slug: true,
    },
  })

  return [
    ...new Set(
      result.docs
        .map((service: Pick<Service, 'slug'>) => service.slug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ]
}

const revalidateRelatedServicePaths = (
  serviceSlugs: string[],
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
) => {
  for (const slug of serviceSlugs) {
    for (const locale of locales) {
      revalidatePathSafe(`/${locale}/services/${slug}`, logger)
    }
  }
}

export const revalidateProject: CollectionAfterChangeHook<Project> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc._status === 'published') {
    revalidateProjectPaths(doc.slug, payload.logger)

    const currentServiceSlugs = await resolveRelatedServiceSlugs(doc.services, payload)
    revalidateRelatedServicePaths(currentServiceSlugs, payload.logger)

    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      revalidateProjectPaths(previousDoc.slug, payload.logger)
    }

    const previousServiceSlugs = await resolveRelatedServiceSlugs(previousDoc?.services, payload)
    revalidateRelatedServicePaths(previousServiceSlugs, payload.logger)
  }

  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    revalidateProjectPaths(previousDoc.slug, payload.logger)
    const previousServiceSlugs = await resolveRelatedServiceSlugs(previousDoc.services, payload)
    revalidateRelatedServicePaths(previousServiceSlugs, payload.logger)
  }

  return doc
}

export const revalidateProjectDelete: CollectionAfterDeleteHook<Project> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    revalidateProjectPaths(doc?.slug, payload.logger)
    const serviceSlugs = await resolveRelatedServiceSlugs(doc?.services, payload)
    revalidateRelatedServicePaths(serviceSlugs, payload.logger)
  }

  return doc
}
