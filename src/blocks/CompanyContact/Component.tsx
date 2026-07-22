import React from 'react'

import { CompanyAddress } from '@/components/CompanyAddress'
import { CompanyContactList } from '@/components/CompanyContactList'
import { CompanySocialLinks } from '@/components/CompanySocialLinks'
import { CompanyWorkingHours } from '@/components/CompanyWorkingHours'
import { defaultLocale, isLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import {
  getPrimaryEmail,
  getPrimaryPhone,
  hasCompleteCoordinates,
  isValidHttpUrl,
  toMailtoHref,
  toTelHref,
} from '@/utilities/companyContact'
import { getCompanyInformation } from '@/utilities/getCompanyInformation'

type Props = {
  disableInnerContainer?: boolean
  heading?: string | null
  locale?: Locale
  showAddress?: boolean | null
  showEmails?: boolean | null
  showMapLink?: boolean | null
  showPhones?: boolean | null
  showSocial?: boolean | null
  showWorkingHours?: boolean | null
}

export const CompanyContactBlock: React.FC<Props> = async ({
  heading,
  locale: localeProp,
  showAddress = true,
  showEmails = true,
  showMapLink = true,
  showPhones = true,
  showSocial = true,
  showWorkingHours = true,
}) => {
  const locale: Locale = isLocale(localeProp) ? localeProp : defaultLocale
  const dictionary = getDictionary(locale)
  const company = await getCompanyInformation(locale)

  const primaryPhone = getPrimaryPhone(company.phones)
  const primaryEmail = getPrimaryEmail(company.emails)
  const phoneHref = primaryPhone ? toTelHref(primaryPhone.number) : null
  const emailHref = primaryEmail ? toMailtoHref(primaryEmail.address) : null
  const mapUrl =
    showMapLink && isValidHttpUrl(company.location?.mapUrl)
      ? company.location!.mapUrl!.trim()
      : null
  const showCoords = hasCompleteCoordinates(company.location)

  const phonesVisible = Boolean(showPhones && (company.phones?.length || 0) > 0)
  const emailsVisible = Boolean(showEmails && (company.emails?.length || 0) > 0)
  const addressVisible = Boolean(showAddress)
  const hoursVisible = Boolean(showWorkingHours)
  const socialVisible = Boolean(showSocial)

  const hasContactList =
    (phonesVisible || emailsVisible) &&
    ((phonesVisible && (company.phones || []).some((p) => p?.number?.trim())) ||
      (emailsVisible && (company.emails || []).some((e) => e?.address?.trim())))

  // Early emptiness check via rendered helpers would still run queries; rely on data presence.
  const hasAnything =
    hasContactList ||
    (addressVisible &&
      Boolean(
        company.address?.fullAddress ||
          company.address?.city ||
          company.address?.province ||
          company.address?.postalCode,
      )) ||
    (hoursVisible && (company.workingHours || []).some((row) => row?.label?.trim())) ||
    (socialVisible && (company.socialLinks || []).some((row) => row?.url?.trim())) ||
    Boolean(mapUrl) ||
    showCoords ||
    Boolean(phoneHref || emailHref)

  if (!hasAnything) return null

  const title = heading?.trim() || dictionary.company.contactHeading

  return (
    <section aria-labelledby="company-contact-heading" className="container">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8" id="company-contact-heading">
        {title}
      </h2>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          {(phonesVisible || emailsVisible) && (
            <CompanyContactList
              company={company}
              emailsOnly={!phonesVisible && emailsVisible}
              phonesOnly={phonesVisible && !emailsVisible}
            />
          )}

          {addressVisible ? (
            <CompanyAddress company={company} heading={dictionary.company.address} />
          ) : null}

          {hoursVisible ? (
            <CompanyWorkingHours
              closedLabel={dictionary.company.closed}
              company={company}
              heading={dictionary.company.workingHours}
            />
          ) : null}
        </div>

        <div className="space-y-8">
          {socialVisible ? (
            <div>
              <h3 className="text-base font-semibold mb-3">{dictionary.company.social}</h3>
              <CompanySocialLinks company={company} navLabel={dictionary.company.social} />
            </div>
          ) : null}

          {mapUrl ? (
            <p className="m-0">
              <a
                className="inline-flex font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                href={mapUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {dictionary.company.viewOnMap}
              </a>
            </p>
          ) : null}

          {showCoords ? (
            <p className="text-sm text-muted-foreground m-0">
              {dictionary.company.coordinates}: {company.location?.latitude},{' '}
              {company.location?.longitude}
            </p>
          ) : null}

          {(phoneHref || emailHref) && (
            <div className="flex flex-wrap gap-3">
              {phoneHref && primaryPhone ? (
                <a
                  className="inline-flex items-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={phoneHref}
                >
                  {dictionary.company.callCta}
                </a>
              ) : null}
              {emailHref && primaryEmail ? (
                <a
                  className="inline-flex items-center rounded-sm border border-border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={emailHref}
                >
                  {dictionary.company.emailCta}
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
