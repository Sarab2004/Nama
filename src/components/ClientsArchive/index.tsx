import { cn } from '@/utilities/ui'
import React from 'react'

import { ClientCard, type ClientCardData } from '@/components/ClientCard'

export type Props = {
  clients: ClientCardData[]
  emptyMessage: string
  viewLabel: string
}

export const ClientsArchive: React.FC<Props> = ({ clients, emptyMessage, viewLabel }) => {
  if (!clients?.length) {
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
        {clients.map((client) => {
          if (typeof client !== 'object' || client === null) return null

          return (
            <li key={client.id || client.slug}>
              <ClientCard doc={client} viewLabel={viewLabel} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
