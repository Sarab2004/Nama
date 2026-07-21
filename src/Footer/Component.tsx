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
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href={`/${activeLocale}`}>
          <Logo alt={dictionary.logo.alt} />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeSelector />
          </div>
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
