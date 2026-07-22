import React from 'react'

import type { CompanyInformation, Media as MediaType } from '@/payload-types'

import { CompanyLogo } from '@/components/CompanyLogo'
import { getCompanyBrandName } from '@/utilities/companyContact'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  company: Pick<CompanyInformation, 'legalName' | 'shortName' | 'logo'>
  loading?: 'lazy' | 'eager'
  priority?: boolean
  showName?: boolean
  size?: 'header' | 'footer' | 'block'
}

export const CompanyIdentity: React.FC<Props> = ({
  className,
  company,
  loading,
  priority,
  showName = false,
  size = 'header',
}) => {
  const brandName = getCompanyBrandName(company)
  const alt = brandName || company.legalName
  const logo = company.logo && typeof company.logo === 'object' ? (company.logo as MediaType) : null

  return (
    <span className={cn('inline-flex items-center gap-3 min-w-0', className)}>
      <CompanyLogo
        alt={alt}
        brandName={brandName}
        loading={loading}
        logo={logo}
        priority={priority}
        size={size}
      />
      {showName && brandName ? (
        <span className="truncate font-semibold text-foreground">{brandName}</span>
      ) : null}
    </span>
  )
}
