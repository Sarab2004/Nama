import type { Media, Service } from '@/payload-types'

import { getServerSideURL } from './getURL'
import { lexicalToPlainText } from './lexicalToPlainText'

type JsonLd = Record<string, unknown>

const getMediaAbsoluteUrl = (media: number | Media | null | undefined): string | undefined => {
  if (!media || typeof media !== 'object' || !media.url) return undefined

  const serverUrl = getServerSideURL()
  return media.url.startsWith('http') ? media.url : `${serverUrl}${media.url}`
}

export const generateServiceJsonLd = (service: Service, pathname: string): JsonLd => {
  const serverUrl = getServerSideURL()
  const url = `${serverUrl}${pathname}`
  const description = service.meta?.description || service.shortDescription || undefined
  const image =
    getMediaAbsoluteUrl(service.meta?.image) || getMediaAbsoluteUrl(service.featuredImage)

  const jsonLd: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    url,
  }

  if (description) {
    jsonLd.description = description
  }

  if (image) {
    jsonLd.image = image
  }

  return jsonLd
}

export const generateServiceFaqJsonLd = (service: Service): JsonLd | null => {
  const faqs = (service.faqs || []).filter(
    (faq) => faq?.question?.trim() && faq.answer,
  )

  if (faqs.length === 0) return null

  const mainEntity = faqs
    .map((faq) => {
      const text = lexicalToPlainText(faq.answer)
      if (!faq.question?.trim() || !text) return null

      return {
        '@type': 'Question',
        name: faq.question.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text,
        },
      }
    })
    .filter(Boolean)

  if (mainEntity.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
}

export const buildServiceStructuredDataScripts = (
  service: Service,
  pathname: string,
): JsonLd[] => {
  const scripts: JsonLd[] = [generateServiceJsonLd(service, pathname)]
  const faqJsonLd = generateServiceFaqJsonLd(service)
  if (faqJsonLd) scripts.push(faqJsonLd)
  return scripts
}
