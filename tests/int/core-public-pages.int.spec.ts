import type { Payload, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { corePublicPageData, seedCorePublicPages } from '@/endpoints/seed/core-public-pages'

const createPayload = () => {
  const docs = new Map<string, { id: number }>()
  const header = { en: { navItems: [] as unknown[] }, fa: { navItems: [] as unknown[] } }
  const footer = { en: { navItems: [] as unknown[] }, fa: { navItems: [] as unknown[] } }
  let nextId = 1

  const payload = {
    find: vi.fn(async ({ where }: { where: { slug: { equals: string } } }) => ({
      docs: docs.has(where.slug.equals) ? [docs.get(where.slug.equals)] : [],
    })),
    create: vi.fn(async ({ data }: { data: { slug: string } }) => {
      const doc = { id: nextId++ }
      docs.set(data.slug, doc)
      return doc
    }),
    update: vi.fn(async () => undefined),
    findGlobal: vi.fn(async ({ slug, locale }: { slug: 'header' | 'footer'; locale: 'en' | 'fa' }) =>
      (slug === 'header' ? header : footer)[locale],
    ),
    updateGlobal: vi.fn(async ({ slug, locale, data }: {
      slug: 'header' | 'footer'
      locale: 'en' | 'fa'
      data: { navItems: unknown[] }
    }) => {
      ;(slug === 'header' ? header : footer)[locale].navItems = data.navItems
    }),
  }

  return { docs, footer, header, payload: payload as unknown as Payload }
}

describe('core public pages bootstrap', () => {
  it('defines published, localized About and Contact page-builder data', () => {
    expect(corePublicPageData.about.en.title).toBe('About Us')
    expect(corePublicPageData.about.fa.title).toBe('درباره ما')
    expect(corePublicPageData.about.en.layout[0]?.blockType).toBe('companyAbout')
    expect(corePublicPageData.contact.en.title).toBe('Contact Us')
    expect(corePublicPageData.contact.fa.title).toBe('تماس با ما')
    expect(corePublicPageData.contact.en.layout.map((block) => block.blockType)).toEqual([
      'companyContact',
      'consultationRequest',
    ])
  })

  it('creates missing pages and empty navigation exactly once', async () => {
    const fixture = createPayload()
    const req = {} as PayloadRequest

    await seedCorePublicPages({ payload: fixture.payload, req })
    await seedCorePublicPages({ payload: fixture.payload, req })

    expect(fixture.docs.size).toBe(2)
    expect(fixture.payload.create).toHaveBeenCalledTimes(2)
    expect(fixture.payload.update).toHaveBeenCalledTimes(2)
    expect(fixture.header.en.navItems).toHaveLength(6)
    expect(fixture.header.fa.navItems).toHaveLength(6)
    expect(fixture.footer.en.navItems).toHaveLength(5)
    expect(fixture.footer.fa.navItems).toHaveLength(5)
  })

  it('does not overwrite pages or non-empty manager navigation', async () => {
    const fixture = createPayload()
    fixture.docs.set('about', { id: 10 })
    fixture.docs.set('contact', { id: 11 })
    fixture.header.en.navItems = [{ link: 'managed' }]
    fixture.footer.en.navItems = [{ link: 'managed' }]

    await seedCorePublicPages({ payload: fixture.payload, req: {} as PayloadRequest })

    expect(fixture.payload.create).not.toHaveBeenCalled()
    expect(fixture.payload.update).not.toHaveBeenCalled()
    expect(fixture.header.en.navItems).toEqual([{ link: 'managed' }])
    expect(fixture.footer.en.navItems).toEqual([{ link: 'managed' }])
  })
})
