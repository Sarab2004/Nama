'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

import { useLocale } from '@/providers/Locale'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const { dictionary, locale } = useLocale()
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
          <Logo
            alt={dictionary.logo.alt}
            loading="eager"
            priority="high"
            className="invert dark:invert-0"
          />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
