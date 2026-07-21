import type { Metadata } from 'next/types'

import { ServicesArchive } from '@/components/ServicesArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { defaultLocale, fallbackLocale, isLocale, locales, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params?: Promise<{
    locale?: string
  }>
}

export default async function ServicesPage({ params }: Args = {}) {
  const { locale: localeParam } = params ? await params : {}
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })

  const services = await payload.find({
    collection: 'services',
    depth: 1,
    draft: false,
    fallbackLocale,
    limit: 100,
    locale,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      shortDescription: true,
      featuredImage: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-12">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{dictionary.services.title}</h1>
          <p>{dictionary.services.intro}</p>
        </div>
      </div>

      <ServicesArchive
        emptyMessage={dictionary.services.empty}
        services={services.docs}
        viewLabel={dictionary.services.viewDetails}
      />
    </div>
  )
}

export async function generateMetadata({ params }: Args = {}): Promise<Metadata> {
  const { locale: localeParam } = params ? await params : {}
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.services.metaDescription,
    title: `${dictionary.services.title} | قالب وب‌سایت صنعتی`,
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
