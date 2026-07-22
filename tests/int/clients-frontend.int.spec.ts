import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { generateMeta } from '@/utilities/generateMeta'
import { generateClientJsonLd } from '@/utilities/generateClientStructuredData'
import { resolveLinkableClient } from '@/utilities/resolveLinkableClient'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import config from '@/payload.config'
import type { Client, Media, Project, User } from '@/payload-types'
import { getPayload, type Payload, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User
let media: Media
let publishedClient: Client
let draftClient: Client
let publishedProject: Project
let draftProject: Project

const richText = (text: string): NonNullable<Client['description']> => ({
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

describe('Clients frontend', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `clients-frontend-${Date.now()}@example.test`,
        password: 'clients-frontend-password',
      },
      overrideAccess: true,
    })

    const imageBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: { r: 40, g: 100, b: 80 },
      },
    })
      .jpeg()
      .toBuffer()

    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Clients frontend test logo',
      },
      file: {
        name: `clients-frontend-${Date.now()}.jpg`,
        data: Buffer.from(imageBuffer),
        mimetype: 'image/jpeg',
        size: imageBuffer.byteLength,
      },
      overrideAccess: true,
    })

    publishedClient = await payload.create({
      collection: 'clients',
      data: {
        name: 'Published Frontend Client',
        slug: `published-frontend-client-${Date.now()}`,
        logo: media.id,
        industry: 'Manufacturing',
        shortDescription: 'Published client short description',
        description: richText('Full client description'),
        website: 'https://example.com',
        displayOrder: 1,
        meta: {
          title: 'SEO Published Client',
          description: 'SEO description for published client',
          image: media.id,
        },
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: true,
    })

    draftClient = await payload.create({
      collection: 'clients',
      data: {
        name: 'Draft Frontend Client',
        slug: `draft-frontend-client-${Date.now()}`,
        industry: 'Hidden industry',
        website: 'https://draft.example.com',
        _status: 'draft',
      },
      context: { disableRevalidate: true },
      draft: true,
      overrideAccess: true,
    })

    const service = await payload.create({
      collection: 'services',
      data: {
        title: 'Clients Frontend Test Service',
        slug: `clients-frontend-service-${Date.now()}`,
        shortDescription: 'Service required by project fixtures',
        featuredImage: media.id,
        content: richText('Service content'),
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: true,
    })

    publishedProject = await payload.create({
      collection: 'projects',
      data: {
        title: 'Published Client Project',
        slug: `published-client-project-${Date.now()}`,
        shortDescription: 'Published project for client page',
        client: publishedClient.id,
        services: [service.id],
        executionYear: '1403',
        featuredImage: media.id,
        displayOrder: 1,
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: true,
    })

    draftProject = await payload.create({
      collection: 'projects',
      data: {
        title: 'Draft Client Project',
        slug: `draft-client-project-${Date.now()}`,
        client: publishedClient.id,
        services: [service.id],
        executionYear: '1402',
        _status: 'draft',
      },
      context: { disableRevalidate: true },
      draft: true,
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    if (!payload) return

    const projectIds = [publishedProject?.id, draftProject?.id].filter(Boolean)
    if (projectIds.length > 0) {
      await payload.delete({
        collection: 'projects',
        where: { id: { in: projectIds } },
        context: { disableRevalidate: true },
        overrideAccess: true,
      })
    }

    const serviceId =
      typeof publishedProject?.services?.[0] === 'object'
        ? publishedProject.services[0]?.id
        : publishedProject?.services?.[0]
    if (serviceId) {
      await payload.delete({
        collection: 'services',
        id: serviceId,
        context: { disableRevalidate: true },
        overrideAccess: true,
      })
    }

    const clientIds = [publishedClient?.id, draftClient?.id].filter(Boolean)
    if (clientIds.length > 0) {
      await payload.delete({
        collection: 'clients',
        where: { id: { in: clientIds } },
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

  it('lists only published clients for public access', async () => {
    const result = await payload.find({
      collection: 'clients',
      draft: false,
      overrideAccess: false,
      pagination: false,
      sort: 'displayOrder,name',
      where: {
        or: [
          { slug: { equals: publishedClient.slug } },
          { slug: { equals: draftClient.slug } },
        ],
      },
    })

    expect(result.docs.map((doc) => doc.slug)).toEqual([publishedClient.slug])
  })

  it('exposes card fields for published clients', async () => {
    const stored = await payload.findByID({
      collection: 'clients',
      id: publishedClient.id,
      depth: 1,
      overrideAccess: false,
    })

    expect(stored.name).toBe('Published Frontend Client')
    expect(stored.industry).toBe('Manufacturing')
    expect(stored.shortDescription).toBe('Published client short description')
    expect(stored.website).toBe('https://example.com')
    expect(stored.slug).toBe(publishedClient.slug)
    expect(typeof stored.logo === 'object' && stored.logo !== null).toBe(true)
  })

  it('hides draft clients from public slug lookup', async () => {
    const result = await payload.find({
      collection: 'clients',
      draft: false,
      limit: 1,
      overrideAccess: false,
      where: {
        slug: {
          equals: draftClient.slug,
        },
      },
    })

    expect(result.docs).toHaveLength(0)
  })

  it('returns draft clients when draft mode access is enabled', async () => {
    const result = await payload.find({
      collection: 'clients',
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: {
        slug: {
          equals: draftClient.slug,
        },
      },
    })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0]?.name).toBe('Draft Frontend Client')
  })

  it('exposes description for detail rendering', () => {
    expect(lexicalToPlainText(publishedClient.description)).toBe('Full client description')
  })

  it('lists only published projects for a client', async () => {
    const related = await payload.find({
      collection: 'projects',
      draft: false,
      overrideAccess: false,
      pagination: false,
      sort: 'displayOrder,title',
      where: {
        client: {
          equals: publishedClient.id,
        },
      },
    })

    const slugs = related.docs.map((doc) => doc.slug)
    expect(slugs).toContain(publishedProject.slug)
    expect(slugs).not.toContain(draftProject.slug)
  })

  it('builds preview path for clients', () => {
    const path = generatePreviewPath({
      collection: 'clients',
      slug: publishedClient.slug,
      req: {} as PayloadRequest,
    })

    expect(path).toContain('/next/preview?')
    expect(path).toContain(`path=${encodeURIComponent(`/clients/${publishedClient.slug}`)}`)
  })

  it('generates metadata with client name and logo fallbacks', async () => {
    const meta = await generateMeta({
      doc: {
        name: 'Fallback Client',
        slug: 'fallback-client',
        shortDescription: 'Fallback client description',
        logo: media,
        meta: {},
      },
      pathname: '/clients/fallback-client',
    })

    expect(meta.title).toBe('Fallback Client | قالب وب‌سایت صنعتی')
    expect(meta.description).toBe('Fallback client description')
    expect(meta.alternates?.canonical).toContain('/clients/fallback-client')
    expect(meta.openGraph?.images).toBeTruthy()
  })

  it('prefers explicit meta fields when present', async () => {
    const meta = await generateMeta({
      doc: publishedClient,
      pathname: `/clients/${publishedClient.slug}`,
    })

    expect(meta.title).toBe('SEO Published Client | قالب وب‌سایت صنعتی')
    expect(meta.description).toBe('SEO description for published client')
  })

  it('builds Organization JSON-LD from live client data', () => {
    const jsonLd = generateClientJsonLd(publishedClient, `/clients/${publishedClient.slug}`)

    expect(jsonLd['@type']).toBe('Organization')
    expect(jsonLd.name).toBe(publishedClient.name)
    expect(jsonLd.description).toBe('SEO description for published client')
    expect(String(jsonLd.url)).toContain(`/clients/${publishedClient.slug}`)
    expect(jsonLd.sameAs).toEqual(['https://example.com'])
  })

  it('links only published clients with slugs from project pages', () => {
    expect(resolveLinkableClient(publishedClient)?.slug).toBe(publishedClient.slug)
    expect(resolveLinkableClient(draftClient)).toBeNull()
    expect(resolveLinkableClient(publishedClient.id)).toBeNull()
  })

  it('syncs published clients into search and skips drafts', async () => {
    const publishedSearch = await payload.find({
      collection: 'search',
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { 'doc.relationTo': { equals: 'clients' } },
          { slug: { equals: publishedClient.slug } },
        ],
      },
    })

    expect(publishedSearch.docs.length).toBeGreaterThan(0)
    expect(publishedSearch.docs[0]?.slug).toBe(publishedClient.slug)
    expect(publishedSearch.docs[0]?.title).toBe('SEO Published Client')

    const draftSearch = await payload.find({
      collection: 'search',
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { 'doc.relationTo': { equals: 'clients' } },
          { slug: { equals: draftClient.slug } },
        ],
      },
    })

    expect(draftSearch.docs).toHaveLength(0)
  })

  it('registers clients in redirects plugin collections', () => {
    expect(payload.config.collections.some((collection) => collection.slug === 'redirects')).toBe(
      true,
    )

    const redirects = payload.collections.redirects?.config
    const toField = redirects?.fields.find((field) => 'name' in field && field.name === 'to')
    expect(toField).toBeTruthy()
  })
})
