'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Client, Media } from '@/payload-types'

import { Media as MediaComponent } from '@/components/Media'
import { useLocale } from '@/providers/Locale'

export type ClientCardData = Pick<
  Client,
  'id' | 'slug' | 'name' | 'logo' | 'industry' | 'shortDescription'
>

export const ClientCard: React.FC<{
  className?: string
  doc: ClientCardData
  viewLabel: string
}> = ({ className, doc, viewLabel }) => {
  const { dictionary, locale } = useLocale()
  const { cardRef, linkRef } = useClickableCard({})
  const { slug, name, logo, industry, shortDescription } = doc
  const href = `/${locale}/clients/${slug}`
  const resolvedLogo = logo && typeof logo === 'object' ? (logo as Media) : null

  return (
    <article
      className={cn('nama-card overflow-hidden hover:cursor-pointer h-full flex flex-col', className)}
      ref={cardRef}
    >
      <div className="relative w-full aspect-[16/10] bg-muted">
        {resolvedLogo ? (
          <MediaComponent fill imgClassName="object-contain p-6" resource={resolvedLogo} size="33vw" />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            {dictionary.common.noImage}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {name && (
          <h2 className="text-xl font-semibold leading-snug">
            <Link
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={href}
              ref={linkRef}
            >
              {name}
            </Link>
          </h2>
        )}

        {industry && <p className="text-sm text-muted-foreground">{industry}</p>}

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
