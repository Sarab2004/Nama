import {
  formatCompanyAddress,
  formatWorkingHoursDisplay,
  getCompanyBrandName,
  getPrimaryEmail,
  getPrimaryPhone,
  getSocialLinkLabel,
  getValidSocialLinks,
  isValidHttpUrl,
  toMailtoHref,
  toTelHref,
} from '@/utilities/companyContact'
import { generateCompanyOrganizationJsonLd } from '@/utilities/generateCompanyStructuredData'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'
import { defaultLocale, fallbackLocale, type Locale } from '@/i18n/config'
import config from '@/payload.config'
import type { CompanyInformation, Media, User } from '@/payload-types'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User
let media: Media
let previousCompany: CompanyInformation

const loadCompany = async (locale: Locale = defaultLocale) =>
  payload.findGlobal({
    slug: 'company-information',
    depth: 1,
    fallbackLocale,
    locale,
  })

const richText = (text: string): NonNullable<CompanyInformation['introduction']> => ({
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

describe('Company Information frontend', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    previousCompany = await payload.findGlobal({
      slug: 'company-information',
      depth: 0,
      overrideAccess: true,
    })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `company-frontend-${Date.now()}@example.test`,
        password: 'company-frontend-password',
      },
      overrideAccess: true,
    })

    const imageBuffer = await sharp({
      create: {
        width: 64,
        height: 32,
        channels: 3,
        background: { r: 20, g: 90, b: 70 },
      },
    })
      .png()
      .toBuffer()

    media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Company frontend logo',
      },
      file: {
        name: `company-frontend-${Date.now()}.png`,
        data: Buffer.from(imageBuffer),
        mimetype: 'image/png',
        size: imageBuffer.byteLength,
      },
      overrideAccess: true,
    })

    await payload.updateGlobal({
      slug: 'company-information',
      data: {
        legalName: 'Nama Industrial Engineering Co.',
        shortName: 'Nama',
        logo: media.id,
        introduction: richText('Nama builds industrial lines.'),
        mission: 'Deliver reliable production systems.',
        vision: 'Lead regional industrial engineering.',
        values: [
          { title: 'Safety', description: 'People first' },
          { title: 'Quality', description: 'Measurable outcomes' },
        ],
        phones: [
          { label: 'Office', number: '+98 21 1234 5678', type: 'landline', isPrimary: true },
          { label: 'Mobile', number: '09121234567', type: 'mobile', isPrimary: false },
        ],
        emails: [
          { label: 'Info', address: 'info@nama.example', isPrimary: true },
          { label: 'Sales', address: 'sales@nama.example', isPrimary: false },
        ],
        address: {
          fullAddress: 'Unit 1, Industrial Ave',
          city: 'Tehran',
          province: 'Tehran',
          postalCode: '1234567890',
        },
        workingHours: [
          { label: 'Sat–Wed', opensAt: '08:00', closesAt: '17:00', isClosed: false },
          { label: 'Friday', isClosed: true },
        ],
        socialLinks: [
          {
            platform: 'linkedin',
            label: 'Nama LinkedIn',
            url: 'https://www.linkedin.com/company/nama-example',
          },
        ],
        location: {
          latitude: 35.6892,
          longitude: 51.389,
          mapUrl: 'https://maps.example.com/nama',
        },
      },
      context: { disableRevalidate: true },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    if (!payload) return

    if (previousCompany) {
      await payload.updateGlobal({
        slug: 'company-information',
        data: {
          legalName: previousCompany.legalName || 'Placeholder Company',
          shortName: previousCompany.shortName,
          logo: typeof previousCompany.logo === 'object' ? previousCompany.logo?.id : previousCompany.logo,
          introduction: previousCompany.introduction,
          mission: previousCompany.mission,
          vision: previousCompany.vision,
          values: previousCompany.values,
          phones: previousCompany.phones,
          emails: previousCompany.emails,
          address: previousCompany.address,
          workingHours: previousCompany.workingHours,
          socialLinks: previousCompany.socialLinks,
          location: previousCompany.location,
        },
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

  it('loads company information for the public frontend', async () => {
    const company = await loadCompany('fa')
    expect(company.legalName).toBe('Nama Industrial Engineering Co.')
    expect(company.shortName).toBe('Nama')
    expect(typeof company.logo === 'object' && company.logo !== null).toBe(true)
  })

  it('resolves brand name and contact helpers', async () => {
    const company = await loadCompany('fa')
    expect(getCompanyBrandName(company)).toBe('Nama')
    expect(getPrimaryPhone(company.phones)?.number).toBe('+98 21 1234 5678')
    expect(getPrimaryEmail(company.emails)?.address).toBe('info@nama.example')
    expect(toTelHref('+98 21 1234 5678')).toBe('tel:+982112345678')
    expect(toMailtoHref('info@nama.example')).toBe('mailto:info@nama.example')
    expect(formatCompanyAddress(company.address)).toContain('Tehran')
  })

  it('falls back to the first valid contact when primary is missing', () => {
    expect(
      getPrimaryPhone([
        { number: '02111111111', isPrimary: false },
        { number: '02122222222', isPrimary: false },
      ])?.number,
    ).toBe('02111111111')
    expect(
      getPrimaryEmail([
        { address: 'a@example.com', isPrimary: false },
        { address: 'b@example.com', isPrimary: false },
      ])?.address,
    ).toBe('a@example.com')
  })

  it('filters invalid social urls and formats working hours', async () => {
    const company = await loadCompany('fa')
    const links = getValidSocialLinks([
      ...(company.socialLinks || []),
      { platform: 'other', label: 'Broken', url: 'not-a-url' },
    ])
    expect(links).toHaveLength(1)
    expect(getSocialLinkLabel(links[0]!)).toBe('Nama LinkedIn')
    expect(isValidHttpUrl(company.location?.mapUrl)).toBe(true)
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isValidHttpUrl('not-a-url')).toBe(false)

    const open = company.workingHours?.[0]
    const closed = company.workingHours?.[1]
    expect(open).toBeTruthy()
    expect(closed).toBeTruthy()
    expect(formatWorkingHoursDisplay(open!, 'Closed')).toBe('08:00 – 17:00')
    expect(formatWorkingHoursDisplay(closed!, 'Closed')).toBe('Closed')
  })

  it('keeps values order and introduction text for about rendering', async () => {
    const company = await loadCompany('fa')
    expect(company.values?.map((row) => row.title)).toEqual(['Safety', 'Quality'])
    expect(lexicalToPlainText(company.introduction)).toBe('Nama builds industrial lines.')
    expect(company.mission).toBeTruthy()
    expect(company.vision).toBeTruthy()
  })

  it('builds Organization JSON-LD without empty fields', async () => {
    const company = await loadCompany('fa')
    const jsonLd = generateCompanyOrganizationJsonLd(company)

    expect(jsonLd['@type']).toBe('Organization')
    expect(jsonLd.name).toBe('Nama')
    expect(jsonLd.legalName).toBe('Nama Industrial Engineering Co.')
    expect(jsonLd.telephone).toEqual(['+98 21 1234 5678', '09121234567'])
    expect(jsonLd.email).toEqual(['info@nama.example', 'sales@nama.example'])
    expect(jsonLd.sameAs).toEqual(['https://www.linkedin.com/company/nama-example'])
    expect(jsonLd.logo).toBeTruthy()
    expect(JSON.stringify(jsonLd)).not.toContain('null')
  })

  it('registers company about and contact blocks on pages', () => {
    const pages = payload.config.collections.find((collection) => collection.slug === 'pages')
    expect(pages).toBeTruthy()

    const collectBlockSlugs = (fields: unknown[], acc: string[] = []): string[] => {
      for (const field of fields) {
        if (!field || typeof field !== 'object') continue
        const record = field as Record<string, unknown>
        if (record.type === 'blocks' && Array.isArray(record.blocks)) {
          for (const block of record.blocks) {
            if (block && typeof block === 'object' && 'slug' in block) {
              acc.push(String((block as { slug: string }).slug))
            }
          }
        }
        if (record.type === 'tabs' && Array.isArray(record.tabs)) {
          for (const tab of record.tabs) {
            if (tab && typeof tab === 'object' && Array.isArray((tab as { fields?: unknown[] }).fields)) {
              collectBlockSlugs((tab as { fields: unknown[] }).fields, acc)
            }
          }
        }
        if (Array.isArray(record.fields)) {
          collectBlockSlugs(record.fields as unknown[], acc)
        }
      }
      return acc
    }

    const slugs = collectBlockSlugs(pages?.fields || [])
    expect(slugs).toContain('companyAbout')
    expect(slugs).toContain('companyContact')
  })

  it('keeps services/projects/clients collections available after company frontend wiring', () => {
    const slugs = payload.config.collections.map((collection) => collection.slug)
    expect(slugs).toEqual(expect.arrayContaining(['services', 'projects', 'clients', 'pages']))
  })
})
