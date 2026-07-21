import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ServiceBreadcrumbs } from '@/components/ServiceBreadcrumbs'
import { ServiceConsultationCTA } from '@/components/ServiceConsultationCTA'
import { Media } from '@/components/Media'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import configPromise from '@payload-config'
import type { Client, Media as MediaType, Project, Service } from '@/payload-types'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React, { cache } from 'react'
import PageClient from './page.client'
import { generateMeta } from '@/utilities/generateMeta'
import { buildProjectStructuredDataScripts } from '@/utilities/generateProjectStructuredData'
import { defaultLocale, fallbackLocale, isLocale, locales, localizePath, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return locales.flatMap((locale) =>
    (projects.docs || []).map(({ slug }) => ({ locale, slug })),
  )
}

type Args = {
  params: Promise<{
    locale?: string
    slug?: string
  }>
}

const resolveClient = (client: Project['client']): Client | null => {
  if (client && typeof client === 'object') return client
  return null
}

const resolvePublishedServices = (services: Project['services']): Service[] => {
  if (!Array.isArray(services)) return []
  return services.filter((service): service is Service => {
    if (!service || typeof service !== 'object') return false
    if (service._status && service._status !== 'published') return false
    return Boolean(service.slug && service.title)
  })
}

const isImageMedia = (media: MediaType) => Boolean(media.mimeType?.startsWith('image/'))

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale: localeParam, slug = '' } = await paramsPromise
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const decodedSlug = decodeURIComponent(slug)
  const url = '/projects/' + decodedSlug
  const project = await queryProjectBySlug({ locale, slug: decodedSlug })
  const dictionary = getDictionary(locale)

  if (!project) return <PayloadRedirects locale={locale} url={url} />

  const client = resolveClient(project.client)
  const publishedServices = resolvePublishedServices(project.services)
  const gallery = (project.gallery || []).filter(
    (row) => row?.image && typeof row.image === 'object',
  )
  const testimonial = project.testimonial
  const showTestimonial = Boolean(testimonial?.permissionToPublish)
  const testimonialDocument =
    showTestimonial && testimonial?.document && typeof testimonial.document === 'object'
      ? testimonial.document
      : null
  const structuredData = buildProjectStructuredDataScripts(project, url)
  const clientLogo =
    client?.logo && typeof client.logo === 'object' ? (client.logo as MediaType) : null

  return (
    <article className="pt-24 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound locale={locale} url={url} />
      {draft && <LivePreviewListener />}

      {structuredData.map((data, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          key={`project-jsonld-${index}`}
          type="application/ld+json"
        />
      ))}

      <div className="container">
        <ServiceBreadcrumbs
          items={[
            { href: '/', label: dictionary.projects.home },
            { href: '/projects', label: dictionary.projects.title },
            { label: project.title },
          ]}
          locale={locale}
        />

        <header className="mb-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-semibold mb-4">{project.title}</h1>
          {project.shortDescription && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {project.shortDescription}
            </p>
          )}
        </header>

        {project.featuredImage && typeof project.featuredImage === 'object' && (
          <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
            <Media fill imgClassName="object-cover" priority resource={project.featuredImage} size="100vw" />
          </div>
        )}

        {(client || project.executionYear || project.location || publishedServices.length > 0) && (
          <section aria-labelledby="project-meta-heading" className="mb-12">
            <h2 className="sr-only" id="project-meta-heading">
              {dictionary.projects.overview}
            </h2>
            <dl className="grid gap-6 md:grid-cols-2 list-none p-0 m-0">
              {client && (
                <div className="nama-card p-5">
                  <dt className="text-sm text-muted-foreground mb-3">{dictionary.projects.client}</dt>
                  <dd className="m-0 flex items-start gap-3">
                    {clientLogo ? (
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-muted">
                        <Media fill imgClassName="object-contain" resource={clientLogo} size="96px" />
                      </span>
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-medium">{client.name}</p>
                      {client.industry && (
                        <p className="text-sm text-muted-foreground mt-1">{client.industry}</p>
                      )}
                      {client.website && (
                        <p className="mt-2">
                          <a
                            className="text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            href={client.website}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {dictionary.projects.visitWebsite}
                          </a>
                        </p>
                      )}
                    </div>
                  </dd>
                </div>
              )}

              {project.executionYear && (
                <div className="nama-card p-5">
                  <dt className="text-sm text-muted-foreground mb-2">
                    {dictionary.projects.executionYear}
                  </dt>
                  <dd className="m-0 font-medium">{project.executionYear}</dd>
                </div>
              )}

              {project.location && (
                <div className="nama-card p-5">
                  <dt className="text-sm text-muted-foreground mb-2">{dictionary.projects.location}</dt>
                  <dd className="m-0 font-medium">{project.location}</dd>
                </div>
              )}

              {publishedServices.length > 0 && (
                <div className="nama-card p-5 md:col-span-2">
                  <dt className="text-sm text-muted-foreground mb-3">
                    {dictionary.projects.relatedServices}
                  </dt>
                  <dd className="m-0">
                    <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                      {publishedServices.map((service) => (
                        <li key={service.id}>
                          <Link
                            className="inline-block rounded-sm bg-muted px-3 py-1.5 text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            href={localizePath(`/services/${service.slug}`, locale)}
                          >
                            {service.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {project.problem && (
          <section aria-labelledby="project-problem-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4" id="project-problem-heading">
              {dictionary.projects.problem}
            </h2>
            <RichText className="max-w-[48rem]" data={project.problem} enableGutter={false} />
          </section>
        )}

        {project.solution && (
          <section aria-labelledby="project-solution-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4" id="project-solution-heading">
              {dictionary.projects.solution}
            </h2>
            <RichText className="max-w-[48rem]" data={project.solution} enableGutter={false} />
          </section>
        )}

        {project.results && (
          <section aria-labelledby="project-results-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4" id="project-results-heading">
              {dictionary.projects.results}
            </h2>
            <RichText className="max-w-[48rem]" data={project.results} enableGutter={false} />
          </section>
        )}

        {gallery.length > 0 && (
          <section aria-labelledby="project-gallery-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" id="project-gallery-heading">
              {dictionary.projects.gallery}
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 list-none p-0 m-0">
              {gallery.map((item, index) => {
                const image = item.image as MediaType
                return (
                  <li key={item.id || `${image.id}-${index}`}>
                    <figure className="m-0">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                        <Media
                          fill
                          imgClassName="object-cover"
                          resource={image}
                          size="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      {item.caption && (
                        <figcaption className="mt-2 text-sm text-muted-foreground">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {showTestimonial &&
          (testimonial?.quote ||
            testimonial?.authorName ||
            testimonial?.authorRole ||
            testimonialDocument) && (
            <section aria-labelledby="project-testimonial-heading" className="mb-12">
              <h2 className="text-2xl font-semibold mb-6" id="project-testimonial-heading">
                {dictionary.projects.testimonial}
              </h2>
              <blockquote className="nama-card p-6 md:p-8 m-0">
                {testimonial?.quote && (
                  <p className="text-lg leading-relaxed mb-4">{testimonial.quote}</p>
                )}
                {(testimonial?.authorName || testimonial?.authorRole) && (
                  <footer className="text-sm text-muted-foreground">
                    {testimonial.authorName && (
                      <cite className="not-italic font-medium text-foreground">
                        {testimonial.authorName}
                      </cite>
                    )}
                    {testimonial.authorName && testimonial.authorRole ? ' — ' : null}
                    {testimonial.authorRole}
                  </footer>
                )}
                {testimonialDocument && (
                  <div className="mt-6">
                    {isImageMedia(testimonialDocument) ? (
                      <div className="relative aspect-[4/3] max-w-md overflow-hidden rounded-lg bg-muted">
                        <Media
                          fill
                          imgClassName="object-contain"
                          resource={testimonialDocument}
                          size="28rem"
                        />
                      </div>
                    ) : testimonialDocument.url ? (
                      <a
                        className="inline-flex text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        href={testimonialDocument.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {dictionary.projects.viewDocument}
                      </a>
                    ) : null}
                  </div>
                )}
              </blockquote>
            </section>
          )}

        <ServiceConsultationCTA
          description={dictionary.projects.ctaDescription}
          label={dictionary.projects.ctaLabel}
          locale={locale}
          title={dictionary.projects.ctaTitle}
        />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale: localeParam, slug = '' } = await paramsPromise
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug({ locale, slug: decodedSlug })

  return generateMeta({
    doc: project,
    pathname: `/projects/${decodedSlug}`,
  })
}

const queryProjectBySlug = cache(async ({ locale, slug }: { locale: Locale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    draft,
    depth: 2,
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

  return result.docs?.[0] || null
})
