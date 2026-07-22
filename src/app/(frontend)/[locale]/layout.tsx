import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { defaultLocale, getDirection, isLocale, type Locale } from '@/i18n/config'
import { Providers } from '@/providers'
import { buildCompanyStructuredDataScripts } from '@/utilities/generateCompanyStructuredData'
import { getCompanyInformation } from '@/utilities/getCompanyInformation'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

type Args = {
  children: React.ReactNode
  params: Promise<{
    locale?: string
  }>
}

export default async function LocaleLayout({ children, params }: Args) {
  const { locale: localeParam } = await params
  if (!isLocale(localeParam)) notFound()

  const locale: Locale = localeParam || defaultLocale
  const { isEnabled } = await draftMode()
  const company = await getCompanyInformation(locale)
  const structuredData = buildCompanyStructuredDataScripts(company)

  return (
    <Providers locale={locale}>
      <div dir={getDirection(locale)} lang={locale}>
        {structuredData.map((data, index) => (
          <script
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
            key={`company-org-jsonld-${index}`}
            type="application/ld+json"
          />
        ))}
        <AdminBar
          adminBarProps={{
            preview: isEnabled,
          }}
        />

        <Header locale={locale} />
        {children}
        <Footer locale={locale} />
      </div>
    </Providers>
  )
}
