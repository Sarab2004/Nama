import config from '@/payload.config'
import type { Client, Media, Project, Service, User } from '@/payload-types'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User
let media: Media
let client: Client
let serviceA: Service
let serviceB: Service
let publishedProject: Project
let draftProject: Project

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

describe('Projects collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `projects-test-${Date.now()}@example.test`,
        password: 'projects-test-password',
      },
      overrideAccess: true,
    })

    const imageBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: { r: 40, g: 90, b: 60 },
      },
    })
      .jpeg()
      .toBuffer()

    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Projects test image',
      },
      file: {
        name: `projects-test-${Date.now()}.jpg`,
        data: Buffer.from(imageBuffer),
        mimetype: 'image/jpeg',
        size: imageBuffer.byteLength,
      },
      overrideAccess: true,
    })

    client = await payload.create({
      collection: 'clients',
      data: {
        name: 'Projects Test Client',
        slug: `projects-test-client-${Date.now()}`,
        logo: media.id,
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    const serviceContent = richText('Service content for projects tests')

    serviceA = await payload.create({
      collection: 'services',
      data: {
        title: 'Projects Test Service A',
        slug: `projects-test-service-a-${Date.now()}`,
        shortDescription: 'Service A for projects tests',
        featuredImage: media.id,
        content: serviceContent,
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    serviceB = await payload.create({
      collection: 'services',
      data: {
        title: 'Projects Test Service B',
        slug: `projects-test-service-b-${Date.now()}`,
        shortDescription: 'Service B for projects tests',
        featuredImage: media.id,
        content: serviceContent,
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    publishedProject = await payload.create({
      collection: 'projects',
      data: {
        title: 'Published Project',
        slug: `published-project-${Date.now()}`,
        shortDescription: 'Published project short description',
        client: client.id,
        services: [serviceA.id, serviceB.id],
        executionYear: '۱۴۰۲ تا ۱۴۰۳',
        location: 'تهران، ایران',
        featuredImage: media.id,
        problem: richText('Problem statement'),
        solution: richText('Solution approach'),
        results: richText('Results achieved'),
        gallery: [
          { image: media.id, caption: 'First gallery image' },
          { image: media.id, caption: 'Second gallery image' },
        ],
        testimonial: {
          quote: 'Great partnership.',
          authorName: 'Test Author',
          authorRole: 'Plant Manager',
          document: media.id,
          permissionToPublish: true,
        },
        featured: true,
        displayOrder: 2,
        meta: {
          title: 'SEO Published Project',
          description: 'SEO description for published project',
          image: media.id,
        },
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    draftProject = await payload.create({
      collection: 'projects',
      data: {
        title: 'Draft Project',
        slug: `draft-project-${Date.now()}`,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: false,
      user: admin,
    })
  })

  afterAll(async () => {
    if (!payload) return

    const projectIds = [publishedProject?.id, draftProject?.id].filter(Boolean)
    if (projectIds.length > 0) {
      await payload.delete({
        collection: 'projects',
        where: { id: { in: projectIds } },
        overrideAccess: true,
      })
    }

    const serviceIds = [serviceA?.id, serviceB?.id].filter(Boolean)
    if (serviceIds.length > 0) {
      await payload.delete({
        collection: 'services',
        where: { id: { in: serviceIds } },
        overrideAccess: true,
      })
    }

    if (client?.id) {
      await payload.delete({
        collection: 'clients',
        id: client.id,
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
    expect(payload.config.collections.some(({ slug }) => slug === 'projects')).toBe(true)
  })

  it('allows authenticated creation with client, services, narrative, gallery, and SEO', async () => {
    const stored = await payload.findByID({
      collection: 'projects',
      id: publishedProject.id,
      depth: 0,
      overrideAccess: false,
      user: admin,
    })

    expect(stored.title).toBe('Published Project')
    expect(stored.client).toBe(client.id)
    expect(stored.services).toEqual([serviceA.id, serviceB.id])
    expect(stored.executionYear).toBe('۱۴۰۲ تا ۱۴۰۳')
    expect(stored.location).toBe('تهران، ایران')
    expect(stored.featuredImage).toBe(media.id)
    expect(stored.problem).toBeTruthy()
    expect(stored.solution).toBeTruthy()
    expect(stored.results).toBeTruthy()
    expect(stored.gallery).toHaveLength(2)
    expect(stored.gallery?.[0]?.caption).toBe('First gallery image')
    expect(stored.gallery?.[1]?.caption).toBe('Second gallery image')
    expect(stored.testimonial?.quote).toBe('Great partnership.')
    expect(stored.testimonial?.permissionToPublish).toBe(true)
    expect(stored.featured).toBe(true)
    expect(stored.displayOrder).toBe(2)
    expect(stored.meta?.title).toBe('SEO Published Project')
    expect(Object.keys(stored).includes('clientName')).toBe(false)
    expect(Object.keys(stored).includes('serviceType')).toBe(false)
  })

  it('requires title when publishing and generates a unique slug from title', async () => {
    await expect(
      payload.create({
        collection: 'projects',
        data: {
          slug: `missing-title-${Date.now()}`,
          client: client.id,
          services: [serviceA.id],
          executionYear: '2024',
          _status: 'published',
        } as never,
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    const autoSlugProject = await payload.create({
      collection: 'projects',
      data: {
        title: 'Auto Slug Project',
        generateSlug: true,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: false,
      user: admin,
    })

    expect(autoSlugProject.slug).toBeTruthy()
    expect(autoSlugProject.slug).toMatch(/auto-slug-project/i)

    await expect(
      payload.create({
        collection: 'projects',
        data: {
          title: 'Duplicate Slug Project',
          slug: publishedProject.slug,
          _status: 'draft',
        },
        draft: true,
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    await payload.delete({
      collection: 'projects',
      id: autoSlugProject.id,
      overrideAccess: true,
    })
  })

  it('stores Persian and English executionYear and localized fields', async () => {
    const localized = await payload.create({
      collection: 'projects',
      data: {
        title: 'پروژه محلی‌سازی',
        slug: `localized-project-${Date.now()}`,
        shortDescription: 'خلاصه فارسی',
        client: client.id,
        services: [serviceA.id],
        executionYear: '۱۴۰۲',
        location: 'اصفهان، ایران',
        problem: richText('مسئله فارسی'),
        solution: richText('راهکار فارسی'),
        results: richText('نتایج فارسی'),
        _status: 'published',
      },
      locale: 'fa',
      overrideAccess: false,
      user: admin,
    })

    const updated = await payload.update({
      collection: 'projects',
      id: localized.id,
      data: {
        title: 'Localized Project EN',
        shortDescription: 'English short description',
        executionYear: '2023–2024',
        location: 'Isfahan, Iran',
      },
      locale: 'en',
      overrideAccess: false,
      user: admin,
    })

    expect(updated.title).toBe('Localized Project EN')
    expect(updated.executionYear).toBe('2023–2024')

    const faDoc = await payload.findByID({
      collection: 'projects',
      id: localized.id,
      locale: 'fa',
      overrideAccess: false,
      user: admin,
    })

    expect(faDoc.title).toBe('پروژه محلی‌سازی')
    expect(faDoc.executionYear).toBe('۱۴۰۲')
    expect(faDoc.location).toBe('اصفهان، ایران')

    await payload.delete({
      collection: 'projects',
      id: localized.id,
      overrideAccess: true,
    })
  })

  it('preserves gallery order and default testimonial permission', async () => {
    const galleryProject = await payload.create({
      collection: 'projects',
      data: {
        title: 'Gallery Order Project',
        slug: `gallery-order-${Date.now()}`,
        client: client.id,
        services: [serviceB.id],
        executionYear: '2024',
        gallery: [
          { image: media.id, caption: 'A' },
          { image: media.id, caption: 'B' },
          { image: media.id, caption: 'C' },
        ],
        testimonial: {
          quote: 'Private quote',
        },
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    expect(galleryProject.gallery?.map((row) => row.caption)).toEqual(['A', 'B', 'C'])
    expect(galleryProject.testimonial?.permissionToPublish).toBe(false)

    await payload.delete({
      collection: 'projects',
      id: galleryProject.id,
      overrideAccess: true,
    })
  })

  it('hides drafts from the public API and blocks public writes', async () => {
    const publicDocs = await payload.find({
      collection: 'projects',
      draft: false,
      overrideAccess: false,
      pagination: false,
      where: {
        or: [
          { slug: { equals: publishedProject.slug } },
          { slug: { equals: draftProject.slug } },
        ],
      },
    })

    expect(publicDocs.docs.map((doc) => doc.slug)).toEqual([publishedProject.slug])

    await expect(
      payload.create({
        collection: 'projects',
        data: {
          title: 'Public Create Blocked',
          slug: `public-blocked-${Date.now()}`,
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      payload.update({
        collection: 'projects',
        id: publishedProject.id,
        data: {
          shortDescription: 'Public update blocked',
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('lets authenticated users update and delete projects', async () => {
    const editable = await payload.create({
      collection: 'projects',
      data: {
        title: 'Editable Project',
        slug: `editable-project-${Date.now()}`,
        client: client.id,
        services: [serviceA.id],
        executionYear: '2025',
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    const updated = await payload.update({
      collection: 'projects',
      id: editable.id,
      data: {
        shortDescription: 'Updated by authenticated user',
        featured: true,
      },
      overrideAccess: false,
      user: admin,
    })

    expect(updated.shortDescription).toBe('Updated by authenticated user')
    expect(updated.featured).toBe(true)

    await payload.delete({
      collection: 'projects',
      id: editable.id,
      overrideAccess: false,
      user: admin,
    })

    await expect(
      payload.findByID({
        collection: 'projects',
        id: editable.id,
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })

  it('creates version history for updates', async () => {
    const versioned = await payload.create({
      collection: 'projects',
      data: {
        title: 'Versioned Project',
        slug: `versioned-project-${Date.now()}`,
        client: client.id,
        services: [serviceA.id],
        executionYear: '2022',
        _status: 'published',
      },
      overrideAccess: false,
      user: admin,
    })

    await payload.update({
      collection: 'projects',
      id: versioned.id,
      data: {
        shortDescription: 'Updated description for versions',
      },
      overrideAccess: false,
      user: admin,
    })

    const versions = await payload.findVersions({
      collection: 'projects',
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
      collection: 'projects',
      id: versioned.id,
      overrideAccess: true,
    })
  })

  it('returns inverse joins from clients and services', async () => {
    const clientWithProjects = await payload.findByID({
      collection: 'clients',
      id: client.id,
      depth: 1,
      joins: {
        projects: {
          limit: 20,
        },
      },
      overrideAccess: false,
      user: admin,
    })

    const clientProjectIds =
      clientWithProjects.projects?.docs?.map((doc) => (typeof doc === 'object' ? doc.id : doc)) ?? []
    expect(clientProjectIds).toContain(publishedProject.id)

    const serviceWithProjects = await payload.findByID({
      collection: 'services',
      id: serviceA.id,
      depth: 1,
      joins: {
        relatedProjects: {
          limit: 20,
        },
      },
      overrideAccess: false,
      user: admin,
    })

    const serviceProjectIds =
      serviceWithProjects.relatedProjects?.docs?.map((doc) =>
        typeof doc === 'object' ? doc.id : doc,
      ) ?? []
    expect(serviceProjectIds).toContain(publishedProject.id)
  })
})
