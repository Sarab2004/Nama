'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Service } from '@/payload-types'

import { Media } from '@/components/Media'
import { useLocale } from '@/providers/Locale'

export type ServiceCardData = Pick<Service, 'slug' | 'title' | 'shortDescription' | 'featuredImage'>

export const ServiceCard: React.FC<{
  className?: string
  doc: ServiceCardData
  viewLabel: string
}> = ({ className, doc, viewLabel }) => {
  const { dictionary, locale } = useLocale()
  const { cardRef, linkRef } = useClickableCard({})
  const { slug, title, shortDescription, featuredImage } = doc
  const href = `/${locale}/services/${slug}`

  return (
    <article
      className={cn(
        'nama-card overflow-hidden hover:cursor-pointer h-full flex flex-col',
        className,
      )}
      ref={cardRef}
    >
      <div className="relative w-full aspect-[16/10] bg-muted">
        {featuredImage && typeof featuredImage !== 'string' && typeof featuredImage !== 'number' ? (
          <Media fill imgClassName="object-cover" resource={featuredImage} size="33vw" />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            {dictionary.common.noImage}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {title && (
          <h2 className="text-xl font-semibold leading-snug">
            <Link className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={href} ref={linkRef}>
              {title}
            </Link>
          </h2>
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
