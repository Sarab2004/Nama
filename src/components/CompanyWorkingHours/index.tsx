import React from 'react'

import type { CompanyInformation } from '@/payload-types'

import {
  formatWorkingHoursDisplay,
  getValidWorkingHours,
} from '@/utilities/companyContact'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  closedLabel: string
  company: Pick<CompanyInformation, 'workingHours'>
  heading?: string
}

export const CompanyWorkingHours: React.FC<Props> = ({
  className,
  closedLabel,
  company,
  heading,
}) => {
  const rows = getValidWorkingHours(company.workingHours)
  if (rows.length === 0) return null

  return (
    <div className={cn(className)}>
      {heading ? <h3 className="text-base font-semibold mb-3">{heading}</h3> : null}
      <dl className="m-0 grid gap-2">
        {rows.map((row, index) => {
          const value = formatWorkingHoursDisplay(row, closedLabel)
          return (
            <div
              className="flex flex-wrap items-baseline justify-between gap-2"
              key={row.id || `${row.label}-${index}`}
            >
              <dt className="font-medium m-0">{row.label}</dt>
              <dd className="m-0 text-muted-foreground">{value || '—'}</dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
