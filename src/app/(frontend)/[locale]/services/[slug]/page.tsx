import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ServiceBreadcrumbs } from '@/components/ServiceBreadcrumbs'
import { ServiceConsultationCTA } from '@/components/ServiceConsultationCTA'
import { ServiceFAQ } from '@/components/ServiceFAQ'
import { Media } from '@/components/Media'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import RichText from '@/components/RichText'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import PageClient from './page.client'
import { generateMeta } from '@/utilities/generateMeta'
import { buildServiceStructuredDataScripts } from '@/utilities/generateServiceStructuredData'
import { defaultLocale, fallbackLocale, isLocale, locales, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const services = await payload.find({
    collection: 'services',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return locales.flatMap((locale) =>
    (services.docs || []).map(({ slug }) => ({ locale, slug })),
  )
}

type Args = {
  params: Promise<{
    locale?: string
    slug?: string
  }>
}

export default async function ServicePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale: localeParam, slug = '' } = await paramsPromise
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const decodedSlug = decodeURIComponent(slug)
  const url = '/services/' + decodedSlug
  const service = await queryServiceBySlug({ locale, slug: decodedSlug })
  const dictionary = getDictionary(locale)

  if (!service) return <PayloadRedirects locale={locale} url={url} />

  const benefits = (service.benefits || []).filter((item) => item?.title?.trim())
  const processSteps = (service.processSteps || []).filter((item) => item?.title?.trim())
  const audiences = (service.audiences || []).filter((item) => item?.title?.trim())
  const structuredData = buildServiceStructuredDataScripts(service, url)

  return (
    <article className="pt-24 pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound locale={locale} url={url} />
      {draft && <LivePreviewListener />}

      {structuredData.map((data, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          key={`service-jsonld-${index}`}
          type="application/ld+json"
        />
      ))}

      <div className="container">
        <ServiceBreadcrumbs
          items={[
            { href: '/', label: dictionary.services.home },
            { href: '/services', label: dictionary.services.title },
            { label: service.title },
          ]}
          locale={locale}
        />

        <header className="mb-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-semibold mb-4">{service.title}</h1>
          {service.shortDescription && (
            <p className="text-lg text-muted-foreground leading-relaxed">{service.shortDescription}</p>
          )}
        </header>

        {service.featuredImage && typeof service.featuredImage === 'object' && (
          <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
            <Media fill imgClassName="object-cover" priority resource={service.featuredImage} size="100vw" />
          </div>
        )}

        {service.content && (
          <div className="mb-12">
            <RichText className="max-w-[48rem]" data={service.content} enableGutter={false} />
          </div>
        )}

        {benefits.length > 0 && (
          <section aria-labelledby="service-benefits-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" id="service-benefits-heading">
              {dictionary.services.benefits}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 list-none p-0 m-0">
              {benefits.map((benefit, index) => (
                <li className="nama-card p-5" key={benefit.id || `${benefit.title}-${index}`}>
                  <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
                  {benefit.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {processSteps.length > 0 && (
          <section aria-labelledby="service-steps-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" id="service-steps-heading">
              {dictionary.services.processSteps}
            </h2>
            <ol className="grid gap-4 list-none p-0 m-0">
              {processSteps.map((step, index) => (
                <li
                  className="nama-card p-5 flex gap-4"
                  key={step.id || `${step.title}-${index}`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-primary)]"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      <span className="sr-only">{`${dictionary.services.step} ${index + 1}: `}</span>
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {audiences.length > 0 && (
          <section aria-labelledby="service-audiences-heading" className="mb-12">
            <h2 className="text-2xl font-semibold mb-6" id="service-audiences-heading">
              {dictionary.services.audiences}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 list-none p-0 m-0">
              {audiences.map((audience, index) => (
                <li className="nama-card p-5" key={audience.id || `${audience.title}-${index}`}>
                  <h3 className="text-lg font-medium mb-2">{audience.title}</h3>
                  {audience.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">{audience.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <ServiceFAQ faqs={service.faqs || []} title={dictionary.services.faqs} />

        <ServiceConsultationCTA
          description={dictionary.services.ctaDescription}
          label={dictionary.services.ctaLabel}
          locale={locale}
          title={dictionary.services.ctaTitle}
        />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale: localeParam, slug = '' } = await paramsPromise
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale
  const decodedSlug = decodeURIComponent(slug)
  const service = await queryServiceBySlug({ locale, slug: decodedSlug })

  return generateMeta({
    doc: service,
    pathname: `/services/${decodedSlug}`,
  })
}

const queryServiceBySlug = cache(async ({ locale, slug }: { locale: Locale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'services',
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
