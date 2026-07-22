import type { CompanyInformation } from '@/payload-types'

export type CompanyPhone = NonNullable<NonNullable<CompanyInformation['phones']>[number]>
export type CompanyEmail = NonNullable<NonNullable<CompanyInformation['emails']>[number]>
export type CompanySocialLink = NonNullable<NonNullable<CompanyInformation['socialLinks']>[number]>
export type CompanyWorkingHour = NonNullable<
  NonNullable<CompanyInformation['workingHours']>[number]
>
export type CompanyAddress = NonNullable<CompanyInformation['address']>

/** Display brand: short name when present, otherwise legal name. */
export const getCompanyBrandName = (company: Pick<CompanyInformation, 'legalName' | 'shortName'>) => {
  const short = company.shortName?.trim()
  if (short) return short
  return company.legalName?.trim() || ''
}

export const getValidPhones = (
  phones: CompanyInformation['phones'],
): CompanyPhone[] => {
  if (!Array.isArray(phones)) return []
  return phones.filter((row): row is CompanyPhone => Boolean(row?.number?.trim()))
}

export const getValidEmails = (
  emails: CompanyInformation['emails'],
): CompanyEmail[] => {
  if (!Array.isArray(emails)) return []
  return emails.filter((row): row is CompanyEmail => Boolean(row?.address?.trim()))
}

/** Primary phone, or the first valid row when none is marked primary. */
export const getPrimaryPhone = (phones: CompanyInformation['phones']): CompanyPhone | null => {
  const valid = getValidPhones(phones)
  if (valid.length === 0) return null
  return valid.find((row) => row.isPrimary) || valid[0] || null
}

/** Primary email, or the first valid row when none is marked primary. */
export const getPrimaryEmail = (emails: CompanyInformation['emails']): CompanyEmail | null => {
  const valid = getValidEmails(emails)
  if (valid.length === 0) return null
  return valid.find((row) => row.isPrimary) || valid[0] || null
}

/**
 * Build a `tel:` href. Keeps a leading `+` and strips spaces, dashes, and parentheses.
 * Returns null when no dialable digits remain.
 */
export const toTelHref = (raw: string | null | undefined): string | null => {
  if (!raw?.trim()) return null
  const trimmed = raw.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return null
  return `tel:${hasPlus ? `+${digits}` : digits}`
}

export const toMailtoHref = (raw: string | null | undefined): string | null => {
  const address = raw?.trim()
  if (!address || !address.includes('@')) return null
  return `mailto:${address}`
}

export const isValidHttpUrl = (raw: string | null | undefined): boolean => {
  if (!raw?.trim()) return false
  try {
    const parsed = new URL(raw.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const getValidSocialLinks = (
  links: CompanyInformation['socialLinks'],
): CompanySocialLink[] => {
  if (!Array.isArray(links)) return []
  return links.filter(
    (row): row is CompanySocialLink => Boolean(row?.url && isValidHttpUrl(row.url)),
  )
}

const PLATFORM_LABELS: Record<CompanySocialLink['platform'], string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  telegram: 'Telegram',
  youtube: 'YouTube',
  aparat: 'Aparat',
  x: 'X',
  whatsapp: 'WhatsApp',
  other: 'Social',
}

export const getSocialLinkLabel = (link: CompanySocialLink): string => {
  const custom = link.label?.trim()
  if (custom) return custom
  return PLATFORM_LABELS[link.platform] || PLATFORM_LABELS.other
}

export const formatCompanyAddress = (address: CompanyInformation['address']): string | null => {
  if (!address) return null

  const parts = [
    address.fullAddress?.trim(),
    [address.city?.trim(), address.province?.trim()].filter(Boolean).join('، '),
    address.postalCode?.trim(),
  ].filter((part): part is string => Boolean(part))

  if (parts.length === 0) return null
  return parts.join(' — ')
}

export const hasCompleteCoordinates = (
  location: CompanyInformation['location'],
): location is { latitude: number; longitude: number; mapUrl?: string | null } => {
  return (
    typeof location?.latitude === 'number' &&
    Number.isFinite(location.latitude) &&
    typeof location?.longitude === 'number' &&
    Number.isFinite(location.longitude)
  )
}

export const formatWorkingHoursDisplay = (
  row: CompanyWorkingHour,
  closedLabel: string,
): string => {
  if (row.isClosed) return closedLabel
  const opens = row.opensAt?.trim()
  const closes = row.closesAt?.trim()
  if (opens && closes) return `${opens} – ${closes}`
  if (opens) return opens
  if (closes) return closes
  return ''
}

export const getValidWorkingHours = (
  rows: CompanyInformation['workingHours'],
): CompanyWorkingHour[] => {
  if (!Array.isArray(rows)) return []
  return rows.filter((row): row is CompanyWorkingHour => Boolean(row?.label?.trim()))
}
