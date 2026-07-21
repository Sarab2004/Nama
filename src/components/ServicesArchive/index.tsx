import { cn } from '@/utilities/ui'
import React from 'react'

import { ServiceCard, type ServiceCardData } from '@/components/ServiceCard'

export type Props = {
  emptyMessage: string
  services: ServiceCardData[]
  viewLabel: string
}

export const ServicesArchive: React.FC<Props> = ({ emptyMessage, services, viewLabel }) => {
  if (!services?.length) {
    return (
      <div className="container">
        <p className="text-muted-foreground text-center py-12" role="status">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('container')}>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
        {services.map((service) => {
          if (typeof service !== 'object' || service === null) return null

          return (
            <li key={service.slug}>
              <ServiceCard doc={service} viewLabel={viewLabel} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
