import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
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

export default async function Page({ params }: Args = {}) {
  const { locale: localeParam } = params ? await params : {}
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    fallbackLocale,
    limit: 12,
    locale,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{dictionary.posts.title}</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          collectionLabels={{
            plural: dictionary.admin.posts,
            singular: dictionary.admin.post,
          }}
          locale={locale}
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Args = {}): Promise<Metadata> {
  const { locale: localeParam } = params ? await params : {}
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const dictionary = getDictionary(locale)

  return {
    title: `قالب وب‌سایت صنعتی ${dictionary.posts.title}`,
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
