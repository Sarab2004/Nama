import React from 'react'

import type { CompanyInformation } from '@/payload-types'

import { formatCompanyAddress } from '@/utilities/companyContact'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  company: Pick<CompanyInformation, 'address'>
  heading?: string
}

export const CompanyAddress: React.FC<Props> = ({ className, company, heading }) => {
  const formatted = formatCompanyAddress(company.address)
  if (!formatted) return null

  return (
    <div className={cn(className)}>
      {heading ? <h3 className="text-base font-semibold mb-2">{heading}</h3> : null}
      <address className="not-italic text-muted-foreground leading-relaxed m-0">
        {formatted}
      </address>
    </div>
  )
}
