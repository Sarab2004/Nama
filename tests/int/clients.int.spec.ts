import config from '@/payload.config'
import type { Client, Media, User } from '@/payload-types'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User
let media: Media
let publishedClient: Client
let draftClient: Client

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

describe('Clients collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `clients-test-${Date.now()}@example.test`,
        password: 'clients-test-password',
      },
      overrideAccess: true,
    })

    const imageBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: { r: 90, g: 40, b: 40 },
      },
    })
      .jpeg()
      .toBuffer()

    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Clients test logo',
      },
      file: {
        name: `clients-test-${Date.now()}.jpg`,
        data: Buffer.from(imageBuffer),
        mimetype: 'image/jpeg',
        size: imageBuffer.byteLength,
      },
      overrideAccess: true,
    })

    publishedClient = await payload.create({
      collection: 'clients',
      data: {
        name: 'Published Client Co',
        slug: `published-client-${Date.now()}`,
        logo: media.id,
        industry: 'Energy',
        shortDescription: 'Published client short description',
        description: richText('Published client full description'),
        website: 'https://example.com',
        featured: true,
        displayOrder: 1,
        meta: {
          title: 'SEO Published Client',
          description: 'SEO description for published client',
          image: media.id,
        },
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    draftClient = await payload.create({
      collection: 'clients',
      data: {
        name: 'Draft Client Co',
        slug: `draft-client-${Date.now()}`,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: false,
      user: admin,
    })
  })

  afterAll(async () => {
    if (!payload) return

    const clientIds = [publishedClient?.id, draftClient?.id].filter(Boolean)
    if (clientIds.length > 0) {
      await payload.delete({
        collection: 'clients',
        where: { id: { in: clientIds } },
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
    expect(payload.config.collections.some(({ slug }) => slug === 'clients')).toBe(true)
  })

  it('allows authenticated creation with logo, SEO, and structured fields', async () => {
    const stored = await payload.findByID({
      collection: 'clients',
      id: publishedClient.id,
      depth: 0,
      overrideAccess: false,
      user: admin,
    })

    expect(stored.name).toBe('Published Client Co')
    expect(stored.logo).toBe(media.id)
    expect(stored.industry).toBe('Energy')
    expect(stored.website).toBe('https://example.com')
    expect(stored.featured).toBe(true)
    expect(stored.displayOrder).toBe(1)
    expect(stored.meta?.title).toBe('SEO Published Client')
    expect(stored.meta?.description).toBe('SEO description for published client')
  })

  it('requires name and generates a unique slug from name', async () => {
    // Drafts may omit required fields; publishing enforces required `name`.
    await expect(
      payload.create({
        collection: 'clients',
        data: {
          slug: `missing-name-${Date.now()}`,
          _status: 'published',
        } as never,
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    const autoSlugClient = await payload.create({
      collection: 'clients',
      data: {
        name: 'Auto Slug Client',
        generateSlug: true,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: false,
      user: admin,
    })

    expect(autoSlugClient.slug).toBeTruthy()
    expect(autoSlugClient.slug).toMatch(/auto-slug-client/i)

    await expect(
      payload.create({
        collection: 'clients',
        data: {
          name: 'Duplicate Slug Client',
          slug: publishedClient.slug,
          _status: 'draft',
        },
        draft: true,
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    await payload.delete({
      collection: 'clients',
      id: autoSlugClient.id,
      overrideAccess: true,
    })
  })

  it('rejects invalid website URLs and negative displayOrder', async () => {
    await expect(
      payload.create({
        collection: 'clients',
        data: {
          name: 'Bad Website Client',
          slug: `bad-website-${Date.now()}`,
          website: 'not-a-url',
          _status: 'published',
        },
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    await expect(
      payload.create({
        collection: 'clients',
        data: {
          name: 'Negative Order Client',
          slug: `negative-order-${Date.now()}`,
          displayOrder: -1,
          _status: 'published',
        },
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()
  })

  it('hides drafts from the public API and exposes published clients', async () => {
    const publicDocs = await payload.find({
      collection: 'clients',
      draft: false,
      overrideAccess: false,
      pagination: false,
      where: {
        or: [
          { slug: { equals: publishedClient.slug } },
          { slug: { equals: draftClient.slug } },
        ],
      },
    })

    expect(publicDocs.docs.map((doc) => doc.slug)).toEqual([publishedClient.slug])

    await expect(
      payload.create({
        collection: 'clients',
        data: {
          name: 'Public Create Blocked',
          slug: `public-blocked-${Date.now()}`,
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('stores localized fields and lets authenticated users update and delete', async () => {
    const localized = await payload.create({
      collection: 'clients',
      data: {
        name: 'نام کارفرما',
        slug: `localized-client-${Date.now()}`,
        industry: 'صنعت',
        shortDescription: 'توضیح کوتاه فارسی',
        _status: 'published',
      },
      locale: 'fa',
      overrideAccess: false,
      user: admin,
    })

    const updated = await payload.update({
      collection: 'clients',
      id: localized.id,
      data: {
        name: 'Localized Client EN',
        industry: 'Industry',
        shortDescription: 'English short description',
      },
      locale: 'en',
      overrideAccess: false,
      user: admin,
    })

    expect(updated.name).toBe('Localized Client EN')

    const faDoc = await payload.findByID({
      collection: 'clients',
      id: localized.id,
      locale: 'fa',
      overrideAccess: false,
      user: admin,
    })

    expect(faDoc.name).toBe('نام کارفرما')
    expect(faDoc.industry).toBe('صنعت')

    await payload.delete({
      collection: 'clients',
      id: localized.id,
      overrideAccess: false,
      user: admin,
    })

    await expect(
      payload.findByID({
        collection: 'clients',
        id: localized.id,
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('creates version history for updates', async () => {
    const versioned = await payload.create({
      collection: 'clients',
      data: {
        name: 'Versioned Client',
        slug: `versioned-client-${Date.now()}`,
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    await payload.update({
      collection: 'clients',
      id: versioned.id,
      data: {
        shortDescription: 'Updated description for versions',
      },
      overrideAccess: false,
      user: admin,
    })

    const versions = await payload.findVersions({
      collection: 'clients',
      where: {
        parent: {
          equals: versioned.id,
        },
      },
      overrideAccess: false,
      user: admin,
    })

    expect(versions.totalDocs).toBeGreaterThan(0)

    await payload.delete({
      collection: 'clients',
      id: versioned.id,
      overrideAccess: true,
    })
  })
})
