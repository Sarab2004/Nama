import config from '@/payload.config'
import type { Media, Service, User } from '@/payload-types'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User
let media: Media
let publishedService: Service
let draftService: Service

const richText: Service['content'] = {
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
            text: 'Test service content',
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
}

const serviceData = (slug: string) => ({
  title: `Service ${slug}`,
  slug,
  shortDescription: `Short description for ${slug}`,
  featuredImage: media.id,
  content: richText,
  benefits: [
    { title: 'First benefit', description: 'Benefit description' },
    { title: 'Second benefit' },
  ],
  processSteps: [
    { title: 'Discover', description: 'Discovery description' },
    { title: 'Deliver' },
  ],
  audiences: [
    { title: 'Leadership team', description: 'Audience description' },
  ],
  faqs: [
    { question: 'What is included?', answer: richText },
  ],
})

describe('Services collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `services-test-${Date.now()}@example.test`,
        password: 'services-test-password',
      },
      overrideAccess: true,
    })

    const imageBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: { r: 20, g: 80, b: 120 },
      },
    })
      .jpeg()
      .toBuffer()

    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Services test image',
      },
      file: {
        name: `services-test-${Date.now()}.jpg`,
        data: Buffer.from(imageBuffer),
        mimetype: 'image/jpeg',
        size: imageBuffer.byteLength,
      },
      overrideAccess: true,
    })

    publishedService = await payload.create({
      collection: 'services',
      data: {
        ...serviceData(`published-${Date.now()}`),
        _status: 'published',
      },
      context: {
        disableRevalidate: true,
      },
      overrideAccess: false,
      user: admin,
    })

    draftService = await payload.create({
      collection: 'services',
      data: {
        title: 'Draft service',
        slug: `draft-${Date.now()}`,
      },
      context: {
        disableRevalidate: true,
      },
      draft: true,
      overrideAccess: false,
      user: admin,
    })
  })

  afterAll(async () => {
    if (!payload) return

    const serviceIds = [publishedService?.id, draftService?.id].filter(Boolean)
    if (serviceIds.length > 0) {
      await payload.delete({
        collection: 'services',
        where: { id: { in: serviceIds } },
        context: {
          disableRevalidate: true,
        },
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

  it('is registered in the Payload config', () => {
    expect(payload.config.collections.some(({ slug }) => slug === 'services')).toBe(true)
  })

  it('allows authenticated creation and retains structured fields in order', async () => {
    const stored = await payload.findByID({
      collection: 'services',
      id: publishedService.id,
      depth: 0,
      overrideAccess: false,
      user: admin,
    })

    expect(stored.slug).toBe(publishedService.slug)
    expect(stored.featuredImage).toBe(media.id)
    expect(stored.benefits?.map(({ title }) => title)).toEqual(['First benefit', 'Second benefit'])
    expect(stored.processSteps?.map(({ title }) => title)).toEqual(['Discover', 'Deliver'])
    expect(stored.audiences?.[0]?.title).toBe('Leadership team')
    expect(stored.faqs?.[0]?.question).toBe('What is included?')
    expect(stored.meta).toBeDefined()
  })

  it('denies public writes and exposes only published documents publicly', async () => {
    await expect(
      payload.create({
        collection: 'services',
        data: serviceData(`public-write-${Date.now()}`),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    const publicResults = await payload.find({
      collection: 'services',
      where: { id: { in: [publishedService.id, draftService.id] } },
      overrideAccess: false,
    })
    expect(publicResults.docs.map(({ id }) => id)).toEqual([publishedService.id])

    const publicDraft = await payload.findByID({
      collection: 'services',
      id: draftService.id,
      disableErrors: true,
      overrideAccess: false,
    })
    expect(publicDraft).toBeNull()

    await expect(
      payload.update({
        collection: 'services',
        id: publishedService.id,
        data: { title: 'Public update attempt' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(
      payload.delete({
        collection: 'services',
        id: publishedService.id,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('lets authenticated users read drafts, validates published documents, and prevents duplicate slugs', async () => {
    const authenticatedDraft = await payload.findByID({
      collection: 'services',
      id: draftService.id,
      overrideAccess: false,
      user: admin,
    })
    expect(authenticatedDraft._status).toBe('draft')

    await expect(
      payload.create({
        collection: 'services',
        data: { title: 'Missing required fields', slug: `missing-${Date.now()}`, _status: 'published' },
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'services',
        data: serviceData(publishedService.slug),
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    const versions = await payload.findVersions({
      collection: 'services',
      parent: publishedService.id,
      overrideAccess: false,
      user: admin,
    })
    expect(versions.docs.length).toBeGreaterThan(0)
  })
})
