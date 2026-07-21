'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Client, Media, Project, Service } from '@/payload-types'

import { Media as MediaComponent } from '@/components/Media'
import { useLocale } from '@/providers/Locale'

export type ProjectCardData = Pick<
  Project,
  | 'id'
  | 'slug'
  | 'title'
  | 'shortDescription'
  | 'featuredImage'
  | 'executionYear'
  | 'location'
  | 'client'
  | 'services'
>

const resolveClient = (client: ProjectCardData['client']): Client | null => {
  if (client && typeof client === 'object') return client
  return null
}

const resolvePublishedServices = (services: ProjectCardData['services']): Service[] => {
  if (!Array.isArray(services)) return []
  return services.filter((service): service is Service => {
    if (!service || typeof service !== 'object') return false
    if (service._status && service._status !== 'published') return false
    return Boolean(service.slug && service.title)
  })
}

export const ProjectCard: React.FC<{
  className?: string
  doc: ProjectCardData
  viewLabel: string
}> = ({ className, doc, viewLabel }) => {
  const { dictionary, locale } = useLocale()
  const { cardRef, linkRef } = useClickableCard({})
  const { slug, title, shortDescription, featuredImage, executionYear, location, client, services } =
    doc
  const href = `/${locale}/projects/${slug}`
  const resolvedClient = resolveClient(client)
  const publishedServices = resolvePublishedServices(services)
  const clientLogo =
    resolvedClient?.logo && typeof resolvedClient.logo === 'object'
      ? (resolvedClient.logo as Media)
      : null

  return (
    <article
      className={cn('nama-card overflow-hidden hover:cursor-pointer h-full flex flex-col', className)}
      ref={cardRef}
    >
      <div className="relative w-full aspect-[16/10] bg-muted">
        {featuredImage && typeof featuredImage === 'object' ? (
          <MediaComponent fill imgClassName="object-cover" resource={featuredImage} size="33vw" />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            {dictionary.common.noImage}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {title && (
          <h2 className="text-xl font-semibold leading-snug">
            <Link
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={href}
              ref={linkRef}
            >
              {title}
            </Link>
          </h2>
        )}

        {(resolvedClient || executionYear || location) && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {resolvedClient && (
              <span className="inline-flex items-center gap-2 min-w-0">
                {clientLogo ? (
                  <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-sm bg-muted">
                    <MediaComponent fill imgClassName="object-contain" resource={clientLogo} size="48px" />
                  </span>
                ) : null}
                <span className="truncate">{resolvedClient.name}</span>
              </span>
            )}
            {executionYear && <span>{executionYear}</span>}
            {location && <span>{location}</span>}
          </div>
        )}

        {publishedServices.length > 0 && (
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {publishedServices.map((service) => (
              <li key={service.id}>
                <span className="inline-block rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {service.title}
                </span>
              </li>
            ))}
          </ul>
        )}

        {shortDescription && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {shortDescription.replace(/\s/g, ' ')}
          </p>
        )}

        <p className="mt-auto pt-2 text-sm font-medium">
          <Link
            className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={href}
          >
            {viewLabel}
          </Link>
        </p>
      </div>
    </article>
  )
}
