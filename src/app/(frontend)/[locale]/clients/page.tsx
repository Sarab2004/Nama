import type { Metadata } from 'next/types'

import { ClientsArchive } from '@/components/ClientsArchive'
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

export default async function ClientsPage({ params }: Args = {}) {
  const { locale: localeParam } = params ? await params : {}
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })

  const clients = await payload.find({
    collection: 'clients',
    depth: 1,
    draft: false,
    fallbackLocale,
    limit: 100,
    locale,
    overrideAccess: false,
    pagination: false,
    sort: 'displayOrder,name',
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      industry: true,
      shortDescription: true,
      displayOrder: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-12">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{dictionary.clients.title}</h1>
          <p>{dictionary.clients.intro}</p>
        </div>
      </div>

      <ClientsArchive
        clients={clients.docs}
        emptyMessage={dictionary.clients.empty}
        viewLabel={dictionary.clients.viewDetails}
      />
    </div>
  )
}

export async function generateMetadata({ params }: Args = {}): Promise<Metadata> {
  const { locale: localeParam } = params ? await params : {}
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.clients.metaDescription,
    title: `${dictionary.clients.title} | قالب وب‌سایت صنعتی`,
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
