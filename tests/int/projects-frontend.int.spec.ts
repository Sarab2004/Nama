import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { generateMeta } from '@/utilities/generateMeta'
import { generateProjectJsonLd } from '@/utilities/generateProjectStructuredData'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import config from '@/payload.config'
import type { Client, Media, Project, Service, User } from '@/payload-types'
import { getPayload, type Payload, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User
let media: Media
let client: Client
let service: Service
let publishedProject: Project
let draftProject: Project
let relatedService: Service

const richText = (text: string): NonNullable<Project['problem']> => ({
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

describe('Projects frontend', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `projects-frontend-${Date.now()}@example.test`,
        password: 'projects-frontend-password',
      },
      overrideAccess: true,
    })

    const imageBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: { r: 20, g: 110, b: 90 },
      },
    })
      .jpeg()
      .toBuffer()

    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Projects frontend test image',
      },
      file: {
        name: `projects-frontend-${Date.now()}.jpg`,
        data: Buffer.from(imageBuffer),
        mimetype: 'image/jpeg',
        size: imageBuffer.byteLength,
      },
      overrideAccess: true,
    })

    client = await payload.create({
      collection: 'clients',
      data: {
        name: 'Frontend Client Co',
        slug: `frontend-client-${Date.now()}`,
        logo: media.id,
        industry: 'Energy',
        website: 'https://example.com',
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: true,
    })

    service = await payload.create({
      collection: 'services',
      data: {
        title: 'Frontend Related Service',
        slug: `frontend-related-service-${Date.now()}`,
        shortDescription: 'Service used by projects frontend tests',
        featuredImage: media.id,
        content: richText('Service content'),
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: true,
    })

    relatedService = service

    publishedProject = await payload.create({
      collection: 'projects',
      data: {
        title: 'Published Frontend Project',
        slug: `published-frontend-project-${Date.now()}`,
        shortDescription: 'Published project short description',
        client: client.id,
        services: [service.id],
        executionYear: '۱۴۰۲',
        location: 'تهران، ایران',
        featuredImage: media.id,
        problem: richText('Problem statement'),
        solution: richText('Solution approach'),
        results: richText('Measured results'),
        gallery: [
          { image: media.id, caption: 'Gallery one' },
          { image: media.id, caption: 'Gallery two' },
        ],
        testimonial: {
          quote: 'Excellent delivery.',
          authorName: 'Plant Manager',
          authorRole: 'Operations',
          document: media.id,
          permissionToPublish: true,
        },
        displayOrder: 1,
        meta: {
          title: 'SEO Published Project',
          description: 'SEO description for published project',
          image: media.id,
        },
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: true,
    })

    draftProject = await payload.create({
      collection: 'projects',
      data: {
        title: 'Draft Frontend Project',
        slug: `draft-frontend-project-${Date.now()}`,
        client: client.id,
        services: [service.id],
        executionYear: '2024',
        testimonial: {
          quote: 'Hidden quote',
          permissionToPublish: false,
        },
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

    if (service?.id) {
      await payload.delete({
        collection: 'services',
        id: service.id,
        context: { disableRevalidate: true },
        overrideAccess: true,
      })
    }

    if (client?.id) {
      await payload.delete({
        collection: 'clients',
        id: client.id,
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

  it('lists only published projects for public access', async () => {
    const result = await payload.find({
      collection: 'projects',
      draft: false,
      overrideAccess: false,
      pagination: false,
      sort: 'displayOrder,title',
      where: {
        or: [
          { slug: { equals: publishedProject.slug } },
          { slug: { equals: draftProject.slug } },
        ],
      },
    })

    expect(result.docs.map((doc) => doc.slug)).toEqual([publishedProject.slug])
  })

  it('exposes card fields for published projects', async () => {
    const stored = await payload.findByID({
      collection: 'projects',
      id: publishedProject.id,
      depth: 1,
      overrideAccess: false,
    })

    expect(stored.title).toBe('Published Frontend Project')
    expect(stored.executionYear).toBe('۱۴۰۲')
    expect(stored.location).toBe('تهران، ایران')
    expect(typeof stored.client === 'object' && stored.client !== null).toBe(true)
    if (typeof stored.client === 'object' && stored.client !== null) {
      expect(stored.client.name).toBe('Frontend Client Co')
    }
    expect(Array.isArray(stored.services)).toBe(true)
    expect(stored.slug).toBe(publishedProject.slug)
  })

  it('hides draft projects from public slug lookup', async () => {
    const result = await payload.find({
      collection: 'projects',
      draft: false,
      limit: 1,
      overrideAccess: false,
      where: {
        slug: {
          equals: draftProject.slug,
        },
      },
    })

    expect(result.docs).toHaveLength(0)
  })

  it('returns draft projects when draft mode access is enabled', async () => {
    const result = await payload.find({
      collection: 'projects',
      draft: true,
      limit: 1,
      overrideAccess: true,
      where: {
        slug: {
          equals: draftProject.slug,
        },
      },
    })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0]?.title).toBe('Draft Frontend Project')
  })

  it('preserves gallery order and captions', () => {
    expect(publishedProject.gallery?.map((row) => row.caption)).toEqual([
      'Gallery one',
      'Gallery two',
    ])
  })

  it('stores publishable testimonials and keeps permission false on drafts by default path', () => {
    expect(publishedProject.testimonial?.permissionToPublish).toBe(true)
    expect(publishedProject.testimonial?.quote).toBe('Excellent delivery.')
    expect(draftProject.testimonial?.permissionToPublish).toBe(false)
  })

  it('exposes problem, solution, and results for detail rendering', () => {
    expect(lexicalToPlainText(publishedProject.problem)).toBe('Problem statement')
    expect(lexicalToPlainText(publishedProject.solution)).toBe('Solution approach')
    expect(lexicalToPlainText(publishedProject.results)).toBe('Measured results')
  })

  it('builds preview path for projects', () => {
    const path = generatePreviewPath({
      collection: 'projects',
      slug: publishedProject.slug,
      req: {} as PayloadRequest,
    })

    expect(path).toContain('/next/preview?')
    expect(path).toContain(`path=${encodeURIComponent(`/projects/${publishedProject.slug}`)}`)
  })

  it('generates metadata with project fallbacks and canonical URL', async () => {
    const meta = await generateMeta({
      doc: {
        title: 'Fallback Project',
        slug: 'fallback-project',
        shortDescription: 'Fallback project description',
        featuredImage: media,
        meta: {},
      },
      pathname: '/projects/fallback-project',
    })

    expect(meta.title).toBe('Fallback Project | قالب وب‌سایت صنعتی')
    expect(meta.description).toBe('Fallback project description')
    expect(meta.alternates?.canonical).toContain('/projects/fallback-project')
    expect(meta.openGraph?.images).toBeTruthy()
  })

  it('prefers explicit meta fields when present', async () => {
    const meta = await generateMeta({
      doc: publishedProject,
      pathname: `/projects/${publishedProject.slug}`,
    })

    expect(meta.title).toBe('SEO Published Project | قالب وب‌سایت صنعتی')
    expect(meta.description).toBe('SEO description for published project')
  })

  it('builds CreativeWork JSON-LD from live project data', () => {
    const jsonLd = generateProjectJsonLd(
      publishedProject,
      `/projects/${publishedProject.slug}`,
    )

    expect(jsonLd['@type']).toBe('CreativeWork')
    expect(jsonLd.name).toBe(publishedProject.title)
    expect(jsonLd.description).toBe('SEO description for published project')
    expect(String(jsonLd.url)).toContain(`/projects/${publishedProject.slug}`)
    expect(jsonLd.temporalCoverage).toBe('۱۴۰۲')
  })

  it('finds published related projects for a service and excludes drafts', async () => {
    const related = await payload.find({
      collection: 'projects',
      draft: false,
      overrideAccess: false,
      pagination: false,
      where: {
        services: {
          contains: relatedService.id,
        },
      },
    })

    const slugs = related.docs.map((doc) => doc.slug)
    expect(slugs).toContain(publishedProject.slug)
    expect(slugs).not.toContain(draftProject.slug)
  })

  it('syncs published projects into search and skips drafts', async () => {
    const publishedSearch = await payload.find({
      collection: 'search',
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { 'doc.relationTo': { equals: 'projects' } },
          { slug: { equals: publishedProject.slug } },
        ],
      },
    })

    expect(publishedSearch.docs.length).toBeGreaterThan(0)
    expect(publishedSearch.docs[0]?.slug).toBe(publishedProject.slug)
    expect(publishedSearch.docs[0]?.title).toBe('SEO Published Project')

    const draftSearch = await payload.find({
      collection: 'search',
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { 'doc.relationTo': { equals: 'projects' } },
          { slug: { equals: draftProject.slug } },
        ],
      },
    })

    expect(draftSearch.docs).toHaveLength(0)
  })

  it('registers projects in redirects plugin collections', () => {
    expect(payload.config.collections.some((collection) => collection.slug === 'redirects')).toBe(
      true,
    )

    const redirects = payload.collections.redirects?.config
    const toField = redirects?.fields.find((field) => 'name' in field && field.name === 'to')
    expect(toField).toBeTruthy()
  })
})
