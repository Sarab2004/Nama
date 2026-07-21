import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { generateMeta } from '@/utilities/generateMeta'
import {
  buildServiceStructuredDataScripts,
  generateServiceFaqJsonLd,
  generateServiceJsonLd,
} from '@/utilities/generateServiceStructuredData'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import config from '@/payload.config'
import type { Media, Service, User } from '@/payload-types'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { PayloadRequest } from 'payload'

let payload: Payload
let admin: User
let media: Media
let publishedService: Service
let draftService: Service

const richText = (text: string): Service['content'] => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    version: 1,
  },
})

describe('Services frontend', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `services-frontend-${Date.now()}@example.test`,
        password: 'services-frontend-password',
      },
      overrideAccess: true,
    })

    const imageBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: { r: 40, g: 90, b: 140 },
      },
    })
      .jpeg()
      .toBuffer()

    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Services frontend test image',
      },
      file: {
        name: `services-frontend-${Date.now()}.jpg`,
        data: Buffer.from(imageBuffer),
        mimetype: 'image/jpeg',
        size: imageBuffer.byteLength,
      },
      overrideAccess: true,
    })

    publishedService = await payload.create({
      collection: 'services',
      data: {
        title: 'Published Frontend Service',
        slug: `published-frontend-service-${Date.now()}`,
        shortDescription: 'Published short description for public listing',
        featuredImage: media.id,
        content: richText('Published service body content'),
        benefits: [{ title: 'Reliable delivery', description: 'On-time execution' }],
        processSteps: [
          { title: 'Assess', description: 'Assess needs' },
          { title: 'Execute', description: 'Execute plan' },
        ],
        audiences: [{ title: 'Plant managers' }],
        faqs: [{ question: 'How long does it take?', answer: richText('Usually four weeks.') }],
        meta: {
          title: 'SEO Published Service',
          description: 'SEO description for published service',
        },
        _status: 'published',
      },
      context: {
        disableRevalidate: true,
      },
      overrideAccess: true,
    })

    draftService = await payload.create({
      collection: 'services',
      data: {
        title: 'Draft Frontend Service',
        slug: `draft-frontend-service-${Date.now()}`,
        shortDescription: 'Draft should stay private',
        featuredImage: media.id,
        content: richText('Draft body'),
        _status: 'draft',
      },
      context: {
        disableRevalidate: true,
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    if (publishedService?.id) {
      await payload.delete({
        collection: 'services',
        id: publishedService.id,
        context: { disableRevalidate: true },
        overrideAccess: true,
      })
    }
    if (draftService?.id) {
      await payload.delete({
        collection: 'services',
        id: draftService.id,
        context: { disableRevalidate: true },
        overrideAccess: true,
      })
    }
    if (media?.id) {
      await payload.delete({
        collection: 'media',
        id: media.id,
        overrideAccess: true,
      })
    }
    if (admin?.id) {
      await payload.delete({
        collection: 'users',
        id: admin.id,
        overrideAccess: true,
      })
    }
  })

  it('lists only published services for public access', async () => {
    const result = await payload.find({
      collection: 'services',
      draft: false,
      overrideAccess: false,
      pagination: false,
      where: {
        or: [
          { slug: { equals: publishedService.slug } },
          { slug: { equals: draftService.slug } },
        ],
      },
    })

    expect(result.docs.map((doc) => doc.slug)).toEqual([publishedService.slug])
  })

  it('hides draft services from public slug lookup', async () => {
    const result = await payload.find({
      collection: 'services',
      draft: false,
      limit: 1,
      overrideAccess: false,
      where: {
        slug: {
          equals: draftService.slug,
        },
      },
    })

    expect(result.docs).toHaveLength(0)
  })

  it('returns draft services when draft mode access is enabled', async () => {
    const result = await payload.find({
      collection: 'services',
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: {
        slug: {
          equals: draftService.slug,
        },
      },
    })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0]?.title).toBe('Draft Frontend Service')
  })

  it('preserves process step order without stored step numbers', () => {
    expect(publishedService.processSteps?.map((step) => step.title)).toEqual([
      'Assess',
      'Execute',
    ])
    expect(publishedService.processSteps?.[0]).not.toHaveProperty('stepNumber')
  })

  it('exposes benefits, audiences, and faqs for detail rendering', () => {
    expect(publishedService.benefits?.[0]?.title).toBe('Reliable delivery')
    expect(publishedService.audiences?.[0]?.title).toBe('Plant managers')
    expect(publishedService.faqs?.[0]?.question).toBe('How long does it take?')
  })

  it('builds preview path for services', () => {
    const path = generatePreviewPath({
      collection: 'services',
      slug: publishedService.slug,
      req: {} as PayloadRequest,
    })

    expect(path).toContain('/next/preview?')
    expect(path).toContain(`path=${encodeURIComponent(`/services/${publishedService.slug}`)}`)
  })

  it('generates metadata with service fallbacks and canonical URL', async () => {
    const meta = await generateMeta({
      doc: {
        title: 'Fallback Title',
        slug: 'fallback-slug',
        shortDescription: 'Fallback description',
        featuredImage: media,
        meta: {},
      },
      pathname: '/services/fallback-slug',
    })

    expect(meta.title).toBe('Fallback Title | قالب وب‌سایت صنعتی')
    expect(meta.description).toBe('Fallback description')
    expect(meta.alternates?.canonical).toContain('/services/fallback-slug')
    expect(meta.openGraph?.images).toBeTruthy()
  })

  it('prefers explicit meta fields when present', async () => {
    const meta = await generateMeta({
      doc: publishedService,
      pathname: `/services/${publishedService.slug}`,
    })

    expect(meta.title).toBe('SEO Published Service | قالب وب‌سایت صنعتی')
    expect(meta.description).toBe('SEO description for published service')
  })

  it('converts lexical rich text to plain text for JSON-LD', () => {
    expect(lexicalToPlainText(richText('Usually four weeks.'))).toBe('Usually four weeks.')
    expect(lexicalToPlainText(null)).toBe('')
  })

  it('builds Service JSON-LD from live service data', () => {
    const jsonLd = generateServiceJsonLd(publishedService, `/services/${publishedService.slug}`)

    expect(jsonLd['@type']).toBe('Service')
    expect(jsonLd.name).toBe(publishedService.title)
    expect(jsonLd.description).toBe('SEO description for published service')
    expect(String(jsonLd.url)).toContain(`/services/${publishedService.slug}`)
  })

  it('builds FAQ JSON-LD only when faqs exist', () => {
    const withFaqs = generateServiceFaqJsonLd(publishedService)
    expect(withFaqs?.['@type']).toBe('FAQPage')
    expect(Array.isArray(withFaqs?.mainEntity)).toBe(true)

    const withoutFaqs = generateServiceFaqJsonLd({
      ...publishedService,
      faqs: [],
    })
    expect(withoutFaqs).toBeNull()
  })

  it('includes FAQ script only when faqs are present', () => {
    const withFaqs = buildServiceStructuredDataScripts(
      publishedService,
      `/services/${publishedService.slug}`,
    )
    expect(withFaqs).toHaveLength(2)

    const withoutFaqs = buildServiceStructuredDataScripts(
      { ...publishedService, faqs: [] },
      `/services/${publishedService.slug}`,
    )
    expect(withoutFaqs).toHaveLength(1)
    expect(withoutFaqs[0]?.['@type']).toBe('Service')
  })
})
