import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Client, Project } from '../../../payload-types'

import { locales } from '../../../i18n/config'

const revalidatePathSafe = (
  path: string,
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
) => {
  logger.info(`Revalidating client path: ${path}`)
  try {
    revalidatePath(path)
  } catch (err) {
    logger.warn(`Could not revalidate path ${path}: ${err instanceof Error ? err.message : err}`)
  }
}

const revalidateClientPaths = (
  slug: string | null | undefined,
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
) => {
  if (!slug) return

  for (const locale of locales) {
    revalidatePathSafe(`/${locale}/clients/${slug}`, logger)
    revalidatePathSafe(`/${locale}/clients`, logger)
  }
}

const resolveRelatedProjectSlugs = async (
  clientId: number | undefined,
  payload: Payload,
): Promise<string[]> => {
  if (!clientId) return []

  const result = await payload.find({
    collection: 'projects',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      client: {
        equals: clientId,
      },
    },
    select: {
      slug: true,
    },
  })

  return [
    ...new Set(
      result.docs
        .map((project: Pick<Project, 'slug'>) => project.slug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ]
}

const revalidateRelatedProjectPaths = (
  projectSlugs: string[],
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
) => {
  for (const slug of projectSlugs) {
    for (const locale of locales) {
      revalidatePathSafe(`/${locale}/projects/${slug}`, logger)
      revalidatePathSafe(`/${locale}/projects`, logger)
    }
  }
}

export const revalidateClient: CollectionAfterChangeHook<Client> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc._status === 'published') {
    revalidateClientPaths(doc.slug, payload.logger)

    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      revalidateClientPaths(previousDoc.slug, payload.logger)
    }

    const projectSlugs = await resolveRelatedProjectSlugs(doc.id, payload)
    revalidateRelatedProjectPaths(projectSlugs, payload.logger)
  }

  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    revalidateClientPaths(previousDoc.slug, payload.logger)
    const projectSlugs = await resolveRelatedProjectSlugs(previousDoc.id || doc.id, payload)
    revalidateRelatedProjectPaths(projectSlugs, payload.logger)
  }

  return doc
}

export const revalidateClientDelete: CollectionAfterDeleteHook<Client> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    revalidateClientPaths(doc?.slug, payload.logger)
    const projectSlugs = await resolveRelatedProjectSlugs(doc?.id, payload)
    revalidateRelatedProjectPaths(projectSlugs, payload.logger)
  }

  return doc
}
