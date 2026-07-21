import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { LanguageSelector } from '@/providers/Locale/LanguageSelector'
import { Logo } from '@/components/Logo/Logo'
import type { Locale } from '@/i18n/config'
import { defaultLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

export async function Footer({ locale }: { locale?: Locale }) {
  const footerData = await getCachedGlobal('footer', 1, locale)()
  const activeLocale = locale || defaultLocale
  const dictionary = getDictionary(activeLocale)

  const navItems = footerData?.navItems || []

  return (
    <footer className="site-footer mt-auto">
      <div className="container py-10 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link
          className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          href={`/${activeLocale}`}
        >
          <Logo alt={dictionary.logo.alt} />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeSelector />
          </div>
          <nav aria-label={dictionary.admin.pages} className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  key={i}
                  {...link}
                />
              )
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
