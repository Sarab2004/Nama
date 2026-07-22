import config from '@/payload.config'
import { getDictionary } from '@/i18n/dictionaries'
import type { Media, Project, Service, User } from '@/payload-types'
import { ConsultationRequest } from '@/blocks/ConsultationRequest/config'
import { buildConsultationHref } from '@/utilities/buildConsultationHref'
import { submitConsultationRequest } from '@/utilities/submitConsultationRequest'
import { validateConsultationRequestInput } from '@/utilities/validateConsultationRequest'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let admin: User
let media: Media
let clientId: number
let publishedService: Service
let draftService: Service
let publishedProject: Project
let draftProject: Project

const messages = {
  ...getDictionary('en').consultation.validation,
  consentText: getDictionary('en').consultation.consentLabel,
  genericError: getDictionary('en').consultation.errorGeneric,
}

const richText = (text: string) => ({
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

const baseInput = (overrides: Record<string, unknown> = {}) => ({
  fullName: 'Test Applicant',
  phone: '+989121234567',
  message: 'I would like a consultation about industrial services.',
  consentToContact: true,
  locale: 'fa',
  sourcePath: '/fa/contact',
  sourceType: 'contact-page',
  formOpenedAt: Date.now() - 5000,
  website: '',
  ...overrides,
})

describe('Consultation Requests', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `consultation-test-${Date.now()}@example.test`,
        password: 'consultation-test-password',
      },
      overrideAccess: true,
    })

    const imageBuffer = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 3,
        background: { r: 10, g: 60, b: 90 },
      },
    })
      .jpeg()
      .toBuffer()

    media = await payload.create({
      collection: 'media',
      data: { alt: 'Consultation test image' },
      file: {
        name: `consultation-test-${Date.now()}.jpg`,
        data: Buffer.from(imageBuffer),
        mimetype: 'image/jpeg',
        size: imageBuffer.byteLength,
      },
      overrideAccess: true,
    })

    const stamp = Date.now()

    const client = await payload.create({
      collection: 'clients',
      data: {
        name: `Consultation Test Client ${stamp}`,
        slug: `consult-client-${stamp}`,
        logo: media.id,
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: false,
      user: admin,
    })
    clientId = client.id

    publishedService = await payload.create({
      collection: 'services',
      data: {
        title: `Consultation service ${stamp}`,
        slug: `consult-svc-pub-${stamp}`,
        shortDescription: 'Published service for consultation tests',
        featuredImage: media.id,
        content: richText('Published service'),
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: false,
      user: admin,
    })

    draftService = await payload.create({
      collection: 'services',
      data: {
        title: `Draft consultation service ${stamp}`,
        slug: `consult-svc-draft-${stamp}`,
        shortDescription: 'Draft service for consultation tests',
        featuredImage: media.id,
        content: richText('Draft service'),
        _status: 'draft',
      },
      context: { disableRevalidate: true },
      overrideAccess: false,
      user: admin,
    })

    publishedProject = await payload.create({
      collection: 'projects',
      data: {
        title: `Consultation project ${stamp}`,
        slug: `consult-proj-pub-${stamp}`,
        shortDescription: 'Published project',
        featuredImage: media.id,
        client: clientId,
        executionYear: '2024',
        problem: richText('Problem'),
        solution: richText('Solution'),
        results: richText('Results'),
        services: [publishedService.id],
        _status: 'published',
      },
      context: { disableRevalidate: true },
      overrideAccess: false,
      user: admin,
    })

    draftProject = await payload.create({
      collection: 'projects',
      data: {
        title: `Draft consultation project ${stamp}`,
        slug: `consult-proj-draft-${stamp}`,
        shortDescription: 'Draft project',
        featuredImage: media.id,
        client: clientId,
        executionYear: '2024',
        problem: richText('Problem'),
        solution: richText('Solution'),
        results: richText('Results'),
        services: [publishedService.id],
        _status: 'draft',
      },
      context: { disableRevalidate: true },
      overrideAccess: false,
      user: admin,
    })
  }, 120_000)

  afterAll(async () => {
    const created = await payload.find({
      collection: 'consultation-requests',
      limit: 100,
      overrideAccess: true,
      where: {
        fullName: { equals: 'Test Applicant' },
      },
    })

    for (const doc of created.docs) {
      await payload.delete({
        collection: 'consultation-requests',
        id: doc.id,
        overrideAccess: true,
      })
    }

    if (draftProject?.id) {
      await payload.delete({
        collection: 'projects',
        id: draftProject.id,
        overrideAccess: true,
      })
    }
    if (publishedProject?.id) {
      await payload.delete({
        collection: 'projects',
        id: publishedProject.id,
        overrideAccess: true,
      })
    }
    if (draftService?.id) {
      await payload.delete({
        collection: 'services',
        id: draftService.id,
        overrideAccess: true,
      })
    }
    if (publishedService?.id) {
      await payload.delete({
        collection: 'services',
        id: publishedService.id,
        overrideAccess: true,
      })
    }
    if (clientId) {
      await payload.delete({ collection: 'clients', id: clientId, overrideAccess: true })
    }
    if (media?.id) {
      await payload.delete({ collection: 'media', id: media.id, overrideAccess: true })
    }
    if (admin?.id) {
      await payload.delete({ collection: 'users', id: admin.id, overrideAccess: true })
    }
  })

  it('registers the consultation-requests collection', () => {
    expect(payload.collections['consultation-requests']).toBeDefined()
  })

  it('registers ConsultationRequestBlock', () => {
    expect(ConsultationRequest.slug).toBe('consultationRequest')
  })

  it('denies public read of consultation requests', async () => {
    await expect(
      payload.find({
        collection: 'consultation-requests',
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('denies public create on the collection', async () => {
    await expect(
      payload.create({
        collection: 'consultation-requests',
        data: {
          fullName: 'Blocked',
          message: 'Should not create via public access path.',
          consentToContact: true,
          locale: 'fa',
          status: 'new',
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('allows authenticated users to read consultation requests', async () => {
    const created = await payload.create({
      collection: 'consultation-requests',
      data: {
        fullName: 'Test Applicant',
        message: 'Authenticated read fixture message here.',
        consentToContact: true,
        locale: 'en',
        status: 'new',
        phone: '+989121111111',
      },
      overrideAccess: true,
    })

    const result = await payload.find({
      collection: 'consultation-requests',
      overrideAccess: false,
      user: admin,
      where: { id: { equals: created.id } },
    })

    expect(result.docs).toHaveLength(1)
  })

  it('requires fullName', () => {
    const result = validateConsultationRequestInput(baseInput({ fullName: '' }), messages)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((error) => error.field === 'fullName')).toBe(true)
    }
  })

  it('requires message', () => {
    const result = validateConsultationRequestInput(baseInput({ message: '' }), messages)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((error) => error.field === 'message')).toBe(true)
    }
  })

  it('requires phone or email', () => {
    const result = validateConsultationRequestInput(
      baseInput({ phone: '', email: '' }),
      messages,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((error) => error.field === 'contact')).toBe(true)
    }
  })

  it('rejects invalid email', () => {
    const result = validateConsultationRequestInput(
      baseInput({ phone: '', email: 'not-an-email' }),
      messages,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((error) => error.field === 'email')).toBe(true)
    }
  })

  it('requires consentToContact', () => {
    const result = validateConsultationRequestInput(
      baseInput({ consentToContact: false }),
      messages,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.some((error) => error.field === 'consentToContact')).toBe(true)
    }
  })

  it('rejects filled honeypot', () => {
    const result = validateConsultationRequestInput(baseInput({ website: 'http://spam.test' }), messages)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors[0]?.message).toBe(messages.spamRejected)
    }
  })

  it('creates a submission through the controlled endpoint helper', async () => {
    const result = await submitConsultationRequest({
      payload,
      messages,
      input: baseInput({
        email: 'applicant@example.test',
        phone: '',
        utm: { source: 'test', medium: 'vitest', campaign: 'consultation' },
        interestedServiceSlugs: [publishedService.slug!],
        relatedProjectSlug: publishedProject.slug!,
      }),
    })

    expect(result.ok).toBe(true)

    const found = await payload.find({
      collection: 'consultation-requests',
      limit: 1,
      overrideAccess: true,
      sort: '-createdAt',
      where: { email: { equals: 'applicant@example.test' } },
    })

    const doc = found.docs[0]
    expect(doc).toBeDefined()
    expect(doc.status).toBe('new')
    expect(doc.locale).toBe('fa')
    expect(doc.sourcePath).toBe('/fa/contact')
    expect(doc.utm?.source).toBe('test')
    expect(doc.submittedAt).toBeTruthy()
    expect(doc.interestedServices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: publishedService.id }),
      ]),
    )
    const relatedId =
      typeof doc.relatedProject === 'object' && doc.relatedProject
        ? doc.relatedProject.id
        : doc.relatedProject
    expect(relatedId).toBe(publishedProject.id)
  })

  it('does not attach draft services from public slugs', async () => {
    const result = await submitConsultationRequest({
      payload,
      messages,
      input: baseInput({
        email: `draft-svc-${Date.now()}@example.test`,
        phone: '',
        interestedServiceSlugs: [draftService.slug!],
      }),
    })

    expect(result.ok).toBe(true)

    const found = await payload.find({
      collection: 'consultation-requests',
      limit: 1,
      overrideAccess: true,
      sort: '-createdAt',
      where: { email: { contains: 'draft-svc-' } },
    })

    const services = found.docs[0]?.interestedServices || []
    expect(services).toHaveLength(0)
  })

  it('does not attach draft projects from public slugs', async () => {
    const result = await submitConsultationRequest({
      payload,
      messages,
      input: baseInput({
        email: `draft-proj-${Date.now()}@example.test`,
        phone: '',
        relatedProjectSlug: draftProject.slug!,
      }),
    })

    expect(result.ok).toBe(true)

    const found = await payload.find({
      collection: 'consultation-requests',
      limit: 1,
      overrideAccess: true,
      sort: '-createdAt',
      where: { email: { contains: 'draft-proj-' } },
    })

    expect(found.docs[0]?.relatedProject).toBeFalsy()
  })

  it('allows authenticated status and assignment updates with internal notes private to staff', async () => {
    const created = await payload.create({
      collection: 'consultation-requests',
      data: {
        fullName: 'Test Applicant',
        message: 'Workflow update fixture message content.',
        consentToContact: true,
        locale: 'en',
        status: 'new',
        phone: '+989122222222',
        internalNotes: 'Staff-only note',
      },
      overrideAccess: true,
    })

    const updated = await payload.update({
      collection: 'consultation-requests',
      id: created.id,
      data: {
        status: 'contacted',
        assignedTo: admin.id,
        internalNotes: 'Called the applicant',
      },
      overrideAccess: false,
      user: admin,
    })

    expect(updated.status).toBe('contacted')
    const assignedId =
      typeof updated.assignedTo === 'object' && updated.assignedTo
        ? updated.assignedTo.id
        : updated.assignedTo
    expect(assignedId).toBe(admin.id)
    expect(updated.internalNotes).toBe('Called the applicant')
  })

  it('builds service and project CTA context hrefs', () => {
    expect(buildConsultationHref('fa', { serviceSlug: 'machining' })).toBe(
      '/fa/contact?service=machining#consultation',
    )
    expect(buildConsultationHref('en', { projectSlug: 'plant-a' })).toBe(
      '/en/contact?project=plant-a#consultation',
    )
    expect(buildConsultationHref('fa', { hasFormOnPage: true })).toBe('#consultation')
  })

  it('keeps public success payload free of sensitive fields', async () => {
    const result = await submitConsultationRequest({
      payload,
      messages,
      input: baseInput({
        email: `opaque-${Date.now()}@example.test`,
        phone: '',
        internalNotes: 'should never land',
      } as Record<string, unknown>),
    })

    expect(result).toEqual({ ok: true })
    expect(result).not.toHaveProperty('internalNotes')
    expect(result).not.toHaveProperty('id')
  })
})
