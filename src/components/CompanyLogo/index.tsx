import React from 'react'
import { cn } from '@/utilities/ui'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'

type Props = {
  alt: string
  brandName: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  logo?: number | MediaType | null
  priority?: boolean
  /** Compact text fallback sizing for header/footer */
  size?: 'header' | 'footer' | 'block'
}

/**
 * Official company logo from Company Information Media, with text brand fallback.
 * Does not use remote Payload template assets.
 */
export const CompanyLogo: React.FC<Props> = ({
  alt,
  brandName,
  className,
  imgClassName,
  loading = 'lazy',
  logo,
  priority = false,
  size = 'header',
}) => {
  const resource = logo && typeof logo === 'object' ? logo : null
  const frameClass =
    size === 'footer'
      ? 'h-9 w-36 max-w-[10rem]'
      : size === 'block'
        ? 'h-16 w-48 max-w-[12rem]'
        : 'h-[34px] w-[9.375rem] max-w-[9.375rem]'

  if (resource?.url) {
    return (
      <span
        className={cn('relative inline-block shrink-0 overflow-hidden', frameClass, className)}
      >
        <Media
          alt={alt}
          fill
          imgClassName={cn('object-contain object-start', imgClassName)}
          loading={loading}
          priority={priority}
          resource={resource}
          size={size === 'block' ? '192px' : '150px'}
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold tracking-tight text-foreground',
        size === 'block' ? 'text-2xl' : 'text-lg',
        className,
      )}
    >
      {brandName || alt}
    </span>
  )
}
