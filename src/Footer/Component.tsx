import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { CompanyAddress } from '@/components/CompanyAddress'
import { CompanyLogo } from '@/components/CompanyLogo'
import { CompanySocialLinks } from '@/components/CompanySocialLinks'
import { LanguageSelector } from '@/providers/Locale/LanguageSelector'
import type { Locale } from '@/i18n/config'
import { defaultLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import {
  getCompanyBrandName,
  getPrimaryEmail,
  getPrimaryPhone,
  toMailtoHref,
  toTelHref,
} from '@/utilities/companyContact'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getCompanyInformation } from '@/utilities/getCompanyInformation'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'

export async function Footer({ locale }: { locale?: Locale }) {
  const activeLocale = locale || defaultLocale
  const dictionary = getDictionary(activeLocale)

  const [footerData, company] = await Promise.all([
    getCachedGlobal('footer', 1, activeLocale)(),
    getCompanyInformation(activeLocale),
  ])

  const navItems = footerData?.navItems || []
  const brandName = getCompanyBrandName(company)
  const logo = company.logo && typeof company.logo === 'object' ? company.logo : null
  const primaryPhone = getPrimaryPhone(company.phones)
  const primaryEmail = getPrimaryEmail(company.emails)
  const phoneHref = primaryPhone ? toTelHref(primaryPhone.number) : null
  const emailHref = primaryEmail ? toMailtoHref(primaryEmail.address) : null
  const introPlain = lexicalToPlainText(company.introduction)
  const shortIntro =
    introPlain.length > 0
      ? introPlain.length > 160
        ? `${introPlain.slice(0, 157).trim()}…`
        : introPlain
      : null
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-auto">
      <div className="container py-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 min-w-0">
          <Link
            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            href={`/${activeLocale}`}
          >
            <CompanyLogo
              alt={brandName}
              brandName={brandName}
              logo={logo}
              size="footer"
            />
          </Link>
          {brandName ? <p className="font-semibold m-0">{brandName}</p> : null}
          {shortIntro ? (
            <p className="text-sm text-muted-foreground leading-relaxed m-0">{shortIntro}</p>
          ) : null}
        </div>

        {navItems.length > 0 ? (
          <div className="min-w-0">
            <h2 className="text-sm font-semibold mb-4">{dictionary.footer.navigation}</h2>
            <nav aria-label={dictionary.footer.navigation} className="flex flex-col gap-3">
              {navItems.map(({ link }, i) => (
                <CMSLink
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  key={i}
                  {...link}
                />
              ))}
            </nav>
          </div>
        ) : null}

        {(primaryPhone || primaryEmail || company.address) && (
          <div className="min-w-0 space-y-4">
            <h2 className="text-sm font-semibold mb-4">{dictionary.footer.contact}</h2>
            <ul className="list-none p-0 m-0 space-y-2 text-sm">
              {primaryPhone ? (
                <li>
                  {phoneHref ? (
                    <a
                      className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      href={phoneHref}
                    >
                      {primaryPhone.number}
                    </a>
                  ) : (
                    <span>{primaryPhone.number}</span>
                  )}
                </li>
              ) : null}
              {primaryEmail ? (
                <li>
                  {emailHref ? (
                    <a
                      className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      href={emailHref}
                    >
                      {primaryEmail.address}
                    </a>
                  ) : (
                    <span>{primaryEmail.address}</span>
                  )}
                </li>
              ) : null}
            </ul>
            <CompanyAddress company={company} />
          </div>
        )}

        <div className="min-w-0 space-y-4">
          <CompanySocialLinks
            company={company}
            navLabel={dictionary.footer.social}
          />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeSelector />
          </div>
        </div>
      </div>

      <div className="container border-t border-border py-4">
        <p className="text-sm text-muted-foreground m-0">
          © {year}
          {brandName ? ` ${brandName}` : ''}
        </p>
      </div>
    </footer>
  )
}
