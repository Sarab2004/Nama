import type { Metadata } from 'next/types'

import { ProjectsArchive } from '@/components/ProjectsArchive'
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

export default async function ProjectsPage({ params }: Args = {}) {
  const { locale: localeParam } = params ? await params : {}
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })

  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    draft: false,
    fallbackLocale,
    limit: 100,
    locale,
    overrideAccess: false,
    pagination: false,
    sort: 'displayOrder,title',
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      featuredImage: true,
      executionYear: true,
      location: true,
      client: true,
      services: true,
      displayOrder: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-12">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{dictionary.projects.title}</h1>
          <p>{dictionary.projects.intro}</p>
        </div>
      </div>

      <ProjectsArchive
        emptyMessage={dictionary.projects.empty}
        projects={projects.docs}
        viewLabel={dictionary.projects.viewDetails}
      />
    </div>
  )
}

export async function generateMetadata({ params }: Args = {}): Promise<Metadata> {
  const { locale: localeParam } = params ? await params : {}
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)

  return {
    description: dictionary.projects.metaDescription,
    title: `${dictionary.projects.title} | قالب وب‌سایت صنعتی`,
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
