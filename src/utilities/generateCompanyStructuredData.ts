import type { CompanyInformation, Media } from '@/payload-types'

import {
  formatCompanyAddress,
  getCompanyBrandName,
  getValidEmails,
  getValidPhones,
  getValidSocialLinks,
  hasCompleteCoordinates,
  isValidHttpUrl,
} from '@/utilities/companyContact'
import { getServerSideURL } from '@/utilities/getURL'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'

type JsonLd = Record<string, unknown>

const getMediaAbsoluteUrl = (media: number | Media | null | undefined): string | undefined => {
  if (!media || typeof media !== 'object' || !media.url) return undefined
  const serverUrl = getServerSideURL()
  return media.url.startsWith('http') ? media.url : `${serverUrl}${media.url}`
}

/**
 * Site-wide Organization JSON-LD from Company Information.
 * Distinct from Client page Organization schemas (those describe employers).
 */
export const generateCompanyOrganizationJsonLd = (company: CompanyInformation): JsonLd => {
  const serverUrl = getServerSideURL()
  const brandName = getCompanyBrandName(company)
  const description =
    lexicalToPlainText(company.introduction) || undefined
  const logo = getMediaAbsoluteUrl(company.logo)
  const phones = getValidPhones(company.phones).map((row) => row.number.trim())
  const emails = getValidEmails(company.emails).map((row) => row.address.trim())
  const sameAs = getValidSocialLinks(company.socialLinks).map((row) => row.url.trim())
  const streetAddress = company.address?.fullAddress?.trim()
  const addressLocality = company.address?.city?.trim()
  const addressRegion = company.address?.province?.trim()
  const postalCode = company.address?.postalCode?.trim()
  const formattedAddress = formatCompanyAddress(company.address)

  const jsonLd: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandName || company.legalName,
    url: serverUrl,
  }

  if (company.legalName?.trim() && company.legalName.trim() !== jsonLd.name) {
    jsonLd.legalName = company.legalName.trim()
  }

  if (description) {
    jsonLd.description = description
  }

  if (logo) {
    jsonLd.logo = logo
  }

  if (phones.length === 1) {
    jsonLd.telephone = phones[0]
  } else if (phones.length > 1) {
    jsonLd.telephone = phones
  }

  if (emails.length === 1) {
    jsonLd.email = emails[0]
  } else if (emails.length > 1) {
    jsonLd.email = emails
  }

  if (sameAs.length > 0) {
    jsonLd.sameAs = sameAs
  }

  if (streetAddress || addressLocality || addressRegion || postalCode) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(streetAddress ? { streetAddress } : {}),
      ...(addressLocality ? { addressLocality } : {}),
      ...(addressRegion ? { addressRegion } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(formattedAddress ? { description: formattedAddress } : {}),
    }
  }

  if (hasCompleteCoordinates(company.location)) {
    jsonLd.location = {
      '@type': 'Place',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: company.location.latitude,
        longitude: company.location.longitude,
      },
      ...(isValidHttpUrl(company.location.mapUrl)
        ? { hasMap: company.location.mapUrl!.trim() }
        : {}),
    }
  } else if (isValidHttpUrl(company.location?.mapUrl)) {
    jsonLd.hasMap = company.location!.mapUrl!.trim()
  }

  return jsonLd
}

export const buildCompanyStructuredDataScripts = (
  company: CompanyInformation,
): JsonLd[] => {
  const brandName = getCompanyBrandName(company)
  if (!brandName && !company.legalName?.trim()) return []
  return [generateCompanyOrganizationJsonLd(company)]
}
