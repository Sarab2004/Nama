'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { LanguageSelector } from '@/providers/Locale/LanguageSelector'
import { useLocale } from '@/providers/Locale'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const { dictionary, locale } = useLocale()

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <LanguageSelector />
      <Link href={`/${locale}/search`}>
        <span className="sr-only">{dictionary.search.title}</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
