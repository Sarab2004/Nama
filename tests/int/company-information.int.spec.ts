import config from '@/payload.config'
import type { User } from '@/payload-types'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User

const richText = {
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
            text: 'معرفی آزمایشی شرکت ناما',
            version: 1,
          },
        ],
        direction: 'rtl' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
      },
    ],
    direction: 'rtl' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

describe('Company Information global', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `company-info-${Date.now()}@example.test`,
        password: 'company-info-test-password',
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    if (!payload || !admin?.id) return
    await payload.delete({
      collection: 'users',
      id: admin.id,
      overrideAccess: true,
    })
  })

  it('is registered in the Payload config', () => {
    expect(payload.config.globals.some(({ slug }) => slug === 'company-information')).toBe(true)
  })

  it('allows public read and blocks public update', async () => {
    await payload.updateGlobal({
      slug: 'company-information',
      data: {
        legalName: 'شرکت مشاوران توسعه ناما',
        location: {
          latitude: null,
          longitude: null,
          mapUrl: null,
        },
      },
      overrideAccess: false,
      user: admin,
    })

    const publicDoc = await payload.findGlobal({
      slug: 'company-information',
      overrideAccess: false,
    })
    expect(publicDoc.legalName).toBe('شرکت مشاوران توسعه ناما')

    await expect(
      payload.updateGlobal({
        slug: 'company-information',
        data: { legalName: 'دسترسی عمومی ممنوع' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('stores structured identity, contact, hours, social, and location data', async () => {
    const updated = await payload.updateGlobal({
      slug: 'company-information',
      data: {
        legalName: 'شرکت مشاوران توسعه ناما',
        shortName: 'ناما',
        introduction: richText,
        mission: 'ارتقای بهره‌وری سازمانی',
        vision: 'مرجع مشاوره صنعتی ایران',
        values: [
          { title: 'شفافیت', description: 'ارتباط واضح با مشتری' },
          { title: 'کیفیت' },
        ],
        phones: [
          { label: 'دفتر مرکزی', number: '+98 21 0000 0000', type: 'landline', isPrimary: true },
          { label: 'موبایل', number: '09120000000', type: 'mobile', isPrimary: true },
        ],
        emails: [
          { label: 'عمومی', address: 'info@nama.example', isPrimary: true },
          { label: 'فروش', address: 'sales@nama.example', isPrimary: true },
        ],
        address: {
          fullAddress: 'تهران، خیابان آزمایشی، پلاک ۱',
          city: 'تهران',
          province: 'تهران',
          postalCode: '1234567890',
        },
        workingHours: [
          { label: 'شنبه تا چهارشنبه', opensAt: '08:00', closesAt: '17:00', isClosed: false },
          { label: 'جمعه', isClosed: true },
        ],
        socialLinks: [
          { platform: 'linkedin', url: 'https://www.linkedin.com/company/nama-example' },
          { platform: 'other', label: 'سایت شرکتی', url: 'https://nama.example' },
        ],
        location: {
          latitude: 35.6892,
          longitude: 51.389,
          mapUrl: 'https://maps.example/nama',
        },
      },
      overrideAccess: false,
      user: admin,
      locale: 'fa',
    })

    expect(updated.shortName).toBe('ناما')
    expect(updated.mission).toBe('ارتقای بهره‌وری سازمانی')
    expect(updated.vision).toBe('مرجع مشاوره صنعتی ایران')
    expect(updated.values?.map((row) => row.title)).toEqual(['شفافیت', 'کیفیت'])
    expect(updated.phones?.map((row) => row.number)).toEqual(['+98 21 0000 0000', '09120000000'])
    expect(updated.phones?.filter((row) => row.isPrimary)).toHaveLength(1)
    expect(updated.phones?.[0]?.isPrimary).toBe(true)
    expect(updated.emails?.map((row) => row.address)).toEqual([
      'info@nama.example',
      'sales@nama.example',
    ])
    expect(updated.emails?.filter((row) => row.isPrimary)).toHaveLength(1)
    expect(updated.address?.postalCode).toBe('1234567890')
    expect(updated.workingHours?.map((row) => row.label)).toEqual(['شنبه تا چهارشنبه', 'جمعه'])
    expect(updated.workingHours?.[1]?.isClosed).toBe(true)
    expect(updated.socialLinks?.[0]?.platform).toBe('linkedin')
    expect(updated.location?.latitude).toBe(35.6892)
    expect(updated.location?.longitude).toBe(51.389)
  })

  it('rejects invalid email, social URL, coordinates, and unpaired latitude', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'company-information',
        data: {
          legalName: 'شرکت مشاوران توسعه ناما',
          emails: [{ address: 'not-an-email' }],
        },
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    await expect(
      payload.updateGlobal({
        slug: 'company-information',
        data: {
          legalName: 'شرکت مشاوران توسعه ناما',
          socialLinks: [{ platform: 'telegram', url: 'not-a-url' }],
        },
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    await expect(
      payload.updateGlobal({
        slug: 'company-information',
        data: {
          legalName: 'شرکت مشاوران توسعه ناما',
          location: { latitude: 200, longitude: 10 },
        },
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()

    await expect(
      payload.updateGlobal({
        slug: 'company-information',
        data: {
          legalName: 'شرکت مشاوران توسعه ناما',
          location: { latitude: 35.6, longitude: null },
        },
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow()
  })

  it('lets authenticated users read versions while public users cannot', async () => {
    await payload.updateGlobal({
      slug: 'company-information',
      data: {
        legalName: 'شرکت مشاوران توسعه ناما',
        shortName: 'ناما-نسخه',
      },
      overrideAccess: false,
      user: admin,
    })

    const versions = await payload.findGlobalVersions({
      slug: 'company-information',
      overrideAccess: false,
      user: admin,
    })
    expect(versions.docs.length).toBeGreaterThan(0)

    await expect(
      payload.findGlobalVersions({
        slug: 'company-information',
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
