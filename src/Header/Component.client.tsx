'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Media } from '@/payload-types'

import { CompanyLogo } from '@/components/CompanyLogo'
import { HeaderNav } from './Nav'

import { useLocale } from '@/providers/Locale'

interface HeaderClientProps {
  company: {
    brandName: string
    logo: Media | null
  }
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ company, data }) => {
  const { locale } = useLocale()
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) {
      const timer = setTimeout(() => {
        setTheme(headerTheme)
      }, 0)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="site-header sticky top-0 z-20"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container py-5 flex justify-between items-center gap-4">
        <Link
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          href={`/${locale}`}
        >
          <CompanyLogo
            alt={company.brandName}
            brandName={company.brandName}
            loading="eager"
            logo={company.logo}
            priority
            size="header"
          />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
