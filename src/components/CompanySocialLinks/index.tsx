import React from 'react'

import type { CompanyInformation } from '@/payload-types'

import { getSocialLinkLabel, getValidSocialLinks } from '@/utilities/companyContact'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  company: Pick<CompanyInformation, 'socialLinks'>
  navLabel: string
}

export const CompanySocialLinks: React.FC<Props> = ({ className, company, navLabel }) => {
  const links = getValidSocialLinks(company.socialLinks)
  if (links.length === 0) return null

  return (
    <nav aria-label={navLabel} className={cn(className)}>
      <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
        {links.map((link, index) => {
          const label = getSocialLinkLabel(link)
          return (
            <li key={link.id || `${link.platform}-${index}`}>
              <a
                className="text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                href={link.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
