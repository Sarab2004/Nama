import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ProjectCard, type ProjectCardData } from '@/components/ProjectCard'
import { ServiceBreadcrumbs } from '@/components/ServiceBreadcrumbs'
import { ServiceConsultationCTA } from '@/components/ServiceConsultationCTA'
import { Media } from '@/components/Media'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import configPromise from '@payload-config'
import type { Client, Media as MediaType } from '@/payload-types'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import PageClient from './page.client'
import { generateMeta } from '@/utilities/generateMeta'
import { buildClientStructuredDataScripts } from '@/utilities/generateClientStructuredData'
import { defaultLocale, fallbackLocale, isLocale, locales, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const clients = await payload.find({
    collection: 'clients',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return locales.flatMap((locale) =>
    (clients.docs || []).map(({ slug }) => ({ locale, slug })),
  )
}

type Args = {
  params: Promise<{
    locale?: string
    slug?: string
  }>
}

export default async function ClientPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale: localeParam, slug = '' } = await paramsPromise
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const decodedSlug = decodeURIComponent(slug)
  const url = '/clients/' + decodedSlug
  const client = await queryClientBySlug({ locale, slug: decodedSlug })
  const dictionary = getDictionary(locale)

  if (!client) return <PayloadRedirects locale={locale} url={url} />

  const relatedProjects = await queryClientProjects({ clientId: client.id, locale })
  const structuredData = buildClientStructuredDataScripts(client, url)
  const logo = client.logo && typeof client.logo === 'object' ? (client.logo as MediaType) : null

  return (
    <article className="pt-24 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound locale={locale} url={url} />
      {draft && <LivePreviewListener />}

      {structuredData.map((data, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          key={`client-jsonld-${index}`}
          type="application/ld+json"
        />
      ))}

      <div className="container">
        <ServiceBreadcrumbs
          items={[
            { href: '/', label: dictionary.clients.home },
            { href: '/clients', label: dictionary.clients.title },
            { label: client.name },
          ]}
          locale={locale}
        />

        <header className="mb-10 max-w-3xl">
          <div className="mb-6 flex items-start gap-4">
            {logo ? (
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Media fill imgClassName="object-contain p-2" resource={logo} size="160px" />
              </span>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-3xl md:text-5xl font-semibold mb-3">{client.name}</h1>
              {client.industry && (
                <p className="text-muted-foreground">{client.industry}</p>
              )}
            </div>
          </div>

          {client.shortDescription && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {client.shortDescription}
            </p>
          )}

          {client.website && (
            <p className="mt-4">
              <a
                className="text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={client.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                {dictionary.clients.visitWebsite}
              </a>
            </p>
          )}
        </header>

        {client.description && (
          <section aria-labelledby="client-description-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4" id="client-description-heading">
              {dictionary.clients.about}
            </h2>
            <RichText className="max-w-[48rem]" data={client.description} enableGutter={false} />
          </section>
        )}

        {relatedProjects.length > 0 && (
          <section aria-labelledby="client-projects-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" id="client-projects-heading">
              {dictionary.clients.relatedProjects}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
              {relatedProjects.map((project) => (
                <li key={project.id}>
                  <ProjectCard doc={project} viewLabel={dictionary.projects.viewDetails} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <ServiceConsultationCTA
          description={dictionary.clients.ctaDescription}
          label={dictionary.clients.ctaLabel}
          locale={locale}
          title={dictionary.clients.ctaTitle}
        />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale: localeParam, slug = '' } = await paramsPromise
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const decodedSlug = decodeURIComponent(slug)
  const client = await queryClientBySlug({ locale, slug: decodedSlug })

  return generateMeta({
    doc: client,
    pathname: `/clients/${decodedSlug}`,
  })
}

const queryClientBySlug = cache(async ({ locale, slug }: { locale: Locale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'clients',
    draft,
    depth: 1,
    fallbackLocale,
    limit: 1,
    locale,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs?.[0] as Client | undefined) || null
})

const queryClientProjects = cache(
  async ({ clientId, locale }: { clientId: number; locale: Locale }) => {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'projects',
      depth: 1,
      draft: false,
      fallbackLocale,
      limit: 100,
      locale,
      overrideAccess: false,
      pagination: false,
      sort: 'displayOrder,title',
      where: {
        client: {
          equals: clientId,
        },
      },
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

    return result.docs as ProjectCardData[]
  },
)
