import Link from 'next/link'
import React from 'react'

import { localizePath, type Locale } from '@/i18n/config'

type Crumb = {
  href?: string
  label: string
}

type Props = {
  items: Crumb[]
  locale: Locale
}

export const ServiceBreadcrumbs: React.FC<Props> = ({ items, locale }) => {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href && !isLast ? (
                <Link
                  className="hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  href={localizePath(item.href, locale)}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-foreground' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
