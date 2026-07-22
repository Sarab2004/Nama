import type { Locale } from '@/i18n/config'

export type ConsultationInquiryType =
  | 'service-consultation'
  | 'project-inquiry'
  | 'partnership'
  | 'general'
  | 'other'

export type ConsultationSourceType =
  | 'contact-page'
  | 'service'
  | 'project'
  | 'client'
  | 'page'
  | 'other'

export type ConsultationPreferredContact = 'phone' | 'email' | 'either'

export type ConsultationRequestInput = {
  fullName?: unknown
  companyName?: unknown
  jobTitle?: unknown
  phone?: unknown
  email?: unknown
  inquiryType?: unknown
  interestedServiceSlugs?: unknown
  relatedProjectSlug?: unknown
  message?: unknown
  preferredContactMethod?: unknown
  preferredContactTime?: unknown
  consentToContact?: unknown
  /** Honeypot — must stay empty */
  website?: unknown
  locale?: unknown
  sourcePath?: unknown
  sourceType?: unknown
  referrer?: unknown
  utm?: unknown
  /** Client-reported form open timestamp (ms) for timing checks */
  formOpenedAt?: unknown
}

export type ConsultationValidationError = {
  field?: string
  message: string
}

export type ConsultationValidationResult =
  | { ok: true; data: NormalizedConsultationRequest }
  | { ok: false; errors: ConsultationValidationError[] }

export type NormalizedConsultationRequest = {
  fullName: string
  companyName?: string
  jobTitle?: string
  phone?: string
  email?: string
  inquiryType: ConsultationInquiryType
  interestedServiceSlugs: string[]
  relatedProjectSlug?: string
  message: string
  preferredContactMethod: ConsultationPreferredContact
  preferredContactTime?: string
  consentToContact: true
  locale: Locale
  sourcePath?: string
  sourceType: ConsultationSourceType
  referrer?: string
  utm?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
  formOpenedAt?: number
}

const INQUIRY_TYPES: ConsultationInquiryType[] = [
  'service-consultation',
  'project-inquiry',
  'partnership',
  'general',
  'other',
]

const SOURCE_TYPES: ConsultationSourceType[] = [
  'contact-page',
  'service',
  'project',
  'client',
  'page',
  'other',
]

const CONTACT_METHODS: ConsultationPreferredContact[] = ['phone', 'email', 'either']

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const stripControlChars = (value: string): string =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')

const isLikelyEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const isLikelyPhone = (value: string): boolean => {
  const digits = value.replace(/[^\d]/g, '')
  return digits.length >= 7 && digits.length <= 15
}

const isHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const sanitizePath = (value: string): string | undefined => {
  if (!value) return undefined
  if (value.length > 500) return undefined
  if (!value.startsWith('/')) return undefined
  if (value.includes('://') || value.includes('<')) return undefined
  return value
}

const sanitizeSlugList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => asString(item))
    .filter((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug))
    .slice(0, 10)
}

const sanitizeUtm = (value: unknown): NormalizedConsultationRequest['utm'] | undefined => {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const next = {
    source: asString(record.source).slice(0, 120) || undefined,
    medium: asString(record.medium).slice(0, 120) || undefined,
    campaign: asString(record.campaign).slice(0, 120) || undefined,
    term: asString(record.term).slice(0, 120) || undefined,
    content: asString(record.content).slice(0, 120) || undefined,
  }
  if (!next.source && !next.medium && !next.campaign && !next.term && !next.content) {
    return undefined
  }
  return next
}

type Messages = {
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
}

export const validateConsultationRequestInput = (
  input: ConsultationRequestInput,
  messages: Messages,
): ConsultationValidationResult => {
  const errors: ConsultationValidationError[] = []

  // Honeypot filled → silent-looking rejection without leaking internals
  if (asString(input.website)) {
    return { ok: false, errors: [{ message: messages.spamRejected }] }
  }

  const fullName = stripControlChars(asString(input.fullName)).slice(0, 120)
  const companyName = stripControlChars(asString(input.companyName)).slice(0, 160) || undefined
  const jobTitle = stripControlChars(asString(input.jobTitle)).slice(0, 120) || undefined
  const phoneRaw = stripControlChars(asString(input.phone)).slice(0, 40)
  const emailRaw = stripControlChars(asString(input.email)).slice(0, 160).toLowerCase()
  const message = stripControlChars(asString(input.message)).slice(0, 5000)
  const preferredContactTime =
    stripControlChars(asString(input.preferredContactTime)).slice(0, 120) || undefined

  if (!fullName) {
    errors.push({ field: 'fullName', message: messages.fullNameRequired })
  }

  if (!message) {
    errors.push({ field: 'message', message: messages.messageRequired })
  } else if (message.length < 10) {
    errors.push({ field: 'message', message: messages.messageTooShort })
  } else if (message.length > 5000) {
    errors.push({ field: 'message', message: messages.messageTooLong })
  }

  if (!phoneRaw && !emailRaw) {
    errors.push({ field: 'contact', message: messages.contactRequired })
  }
  if (emailRaw && !isLikelyEmail(emailRaw)) {
    errors.push({ field: 'email', message: messages.emailInvalid })
  }
  if (phoneRaw && !isLikelyPhone(phoneRaw)) {
    errors.push({ field: 'phone', message: messages.phoneInvalid })
  }

  if (input.consentToContact !== true && input.consentToContact !== 'true') {
    errors.push({ field: 'consentToContact', message: messages.consentRequired })
  }

  const localeRaw = asString(input.locale)
  const locale: Locale | null = localeRaw === 'fa' || localeRaw === 'en' ? localeRaw : null
  if (!locale) {
    errors.push({ field: 'locale', message: messages.localeInvalid })
  }

  const inquiryType = INQUIRY_TYPES.includes(input.inquiryType as ConsultationInquiryType)
    ? (input.inquiryType as ConsultationInquiryType)
    : 'general'

  const preferredContactMethod = CONTACT_METHODS.includes(
    input.preferredContactMethod as ConsultationPreferredContact,
  )
    ? (input.preferredContactMethod as ConsultationPreferredContact)
    : 'either'

  const sourceType = SOURCE_TYPES.includes(input.sourceType as ConsultationSourceType)
    ? (input.sourceType as ConsultationSourceType)
    : 'other'

  const formOpenedAt =
    typeof input.formOpenedAt === 'number'
      ? input.formOpenedAt
      : typeof input.formOpenedAt === 'string' && /^\d+$/.test(input.formOpenedAt)
        ? Number(input.formOpenedAt)
        : undefined

  // Reject unrealistically fast submits (< 1.2s) when client timestamp is present.
  if (typeof formOpenedAt === 'number' && Number.isFinite(formOpenedAt)) {
    const elapsed = Date.now() - formOpenedAt
    if (elapsed >= 0 && elapsed < 1200) {
      return { ok: false, errors: [{ message: messages.spamRejected }] }
    }
  }

  if (errors.length > 0 || !locale) {
    return { ok: false, errors }
  }

  const referrerRaw = asString(input.referrer).slice(0, 500)
  const referrer = referrerRaw && isHttpUrl(referrerRaw) ? referrerRaw : undefined

  return {
    ok: true,
    data: {
      fullName,
      companyName,
      jobTitle,
      phone: phoneRaw || undefined,
      email: emailRaw || undefined,
      inquiryType,
      interestedServiceSlugs: sanitizeSlugList(input.interestedServiceSlugs),
      relatedProjectSlug: asString(input.relatedProjectSlug) || undefined,
      message,
      preferredContactMethod,
      preferredContactTime,
      consentToContact: true,
      locale,
      sourcePath: sanitizePath(asString(input.sourcePath)),
      sourceType,
      referrer,
      utm: sanitizeUtm(input.utm),
      formOpenedAt,
    },
  }
}
