'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { LanguageSelector } from '@/providers/Locale/LanguageSelector'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { useLocale } from '@/providers/Locale'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const { dictionary, locale } = useLocale()

  return (
    <nav aria-label={dictionary.admin.pages} className="flex gap-3 items-center flex-wrap justify-end">
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            className="text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] font-medium"
            key={i}
            {...link}
            appearance="link"
          />
        )
      })}
      <LanguageSelector />
      <ThemeSelector />
      <Link
        className="inline-flex items-center justify-center rounded-sm p-1 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={`/${locale}/search`}
      >
        <span className="sr-only">{dictionary.search.title}</span>
        <SearchIcon aria-hidden className="w-5" />
      </Link>
    </nav>
  )
}
