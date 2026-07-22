import React from 'react'
import { cn } from '@/utilities/ui'

import type { Media as MediaType } from '@/payload-types'

import { CompanyLogo } from '@/components/CompanyLogo'

/**
 * @deprecated Prefer CompanyLogo with Company Information data.
 * Kept as a thin adapter so existing imports keep working during the migration.
 */
interface Props {
  alt?: string
  brandName?: string
  className?: string
  loading?: 'lazy' | 'eager'
  logo?: number | MediaType | null
  priority?: 'auto' | 'high' | 'low' | boolean
}

export const Logo = (props: Props) => {
  const {
    alt = '',
    brandName = '',
    className,
    loading = 'lazy',
    logo = null,
    priority,
  } = props

  const resolvedPriority = priority === true || priority === 'high'

  return (
    <CompanyLogo
      alt={alt || brandName}
      brandName={brandName || alt}
      className={cn(className)}
      loading={loading}
      logo={logo}
      priority={resolvedPriority}
      size="header"
    />
  )
}
