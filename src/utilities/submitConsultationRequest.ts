import type { Payload } from 'payload'

import type { Locale } from '@/i18n/config'
import type { ConsultationRequestInput, ConsultationValidationError } from '@/utilities/validateConsultationRequest'
import { validateConsultationRequestInput } from '@/utilities/validateConsultationRequest'

export type SubmitConsultationMessages = {
  fullNameRequired: string
  messageRequired: string
  messageTooShort: string
  messageTooLong: string
  contactRequired: string
  emailInvalid: string
  phoneInvalid: string
  consentRequired: string
  spamRejected: string
  localeInvalid: string
  genericError: string
  consentText: string
}

export type SubmitConsultationResult =
  | { ok: true }
  | { ok: false; status: number; errors: ConsultationValidationError[] }

const isValidSlug = (value: string): boolean => /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(value)

/**
 * Creates a consultation request via Local API after validation.
 * Uses `overrideAccess: true` only here because collection `create` is locked for all roles;
 * public REST/GraphQL create remains denied. Call only from the controlled route handler.
 */
export const submitConsultationRequest = async ({
  payload,
  input,
  messages,
}: {
  payload: Payload
  input: ConsultationRequestInput
  messages: SubmitConsultationMessages
}): Promise<SubmitConsultationResult> => {
  const validated = validateConsultationRequestInput(input, messages)

  if (!validated.ok) {
    const isSpam = validated.errors.some((error) => error.message === messages.spamRejected)
    return {
      ok: false,
      status: isSpam ? 400 : 400,
      errors: validated.errors,
    }
  }

  const data = validated.data

  try {
    const interestedServiceIds = await resolvePublishedServiceIds({
      payload,
      locale: data.locale,
      slugs: data.interestedServiceSlugs,
    })

    const relatedProjectId = data.relatedProjectSlug
      ? await resolvePublishedProjectId({
          payload,
          locale: data.locale,
          slug: data.relatedProjectSlug,
        })
      : undefined

    await payload.create({
      collection: 'consultation-requests',
      data: {
        fullName: data.fullName,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        phone: data.phone,
        email: data.email,
        inquiryType: data.inquiryType,
        interestedServices: interestedServiceIds,
        relatedProject: relatedProjectId,
        message: data.message,
        preferredContactMethod: data.preferredContactMethod,
        preferredContactTime: data.preferredContactTime,
        consentToContact: true,
        consentText: messages.consentText,
        locale: data.locale,
        sourcePath: data.sourcePath,
        sourceType: data.sourceType,
        referrer: data.referrer,
        utm: data.utm,
        status: 'new',
      },
      // Collection create access is false for everyone; this Local API path is the only public entry.
      overrideAccess: true,
    })

    // Email adapter is not configured in payload.config — do not simulate delivery.
    // Submissions must succeed regardless of future notification wiring.

    return { ok: true }
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Failed to create consultation request' })
    return {
      ok: false,
      status: 500,
      errors: [{ message: messages.genericError }],
    }
  }
}

export const resolvePublishedServiceIds = async ({
  payload,
  locale,
  slugs,
}: {
  payload: Payload
  locale: Locale
  slugs: string[]
}): Promise<number[]> => {
  const unique = [...new Set(slugs.filter(isValidSlug))].slice(0, 10)
  if (unique.length === 0) return []

  const result = await payload.find({
    collection: 'services',
    depth: 0,
    draft: false,
    limit: unique.length,
    locale,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [
        { slug: { in: unique } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  return result.docs.map((doc) => doc.id)
}

export const resolvePublishedProjectId = async ({
  payload,
  locale,
  slug,
}: {
  payload: Payload
  locale: Locale
  slug: string
}): Promise<number | undefined> => {
  if (!isValidSlug(slug)) return undefined

  const result = await payload.find({
    collection: 'projects',
    depth: 0,
    draft: false,
    limit: 1,
    locale,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs[0]?.id
}
