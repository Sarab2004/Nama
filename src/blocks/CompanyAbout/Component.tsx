import React from 'react'

import type { CompanyInformation } from '@/payload-types'

import { CompanyIdentity } from '@/components/CompanyIdentity'
import RichText from '@/components/RichText'
import { defaultLocale, isLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { getCompanyInformation } from '@/utilities/getCompanyInformation'

type Props = {
  disableInnerContainer?: boolean
  heading?: string | null
  locale?: Locale
  showIntroduction?: boolean | null
  showLogo?: boolean | null
  showMission?: boolean | null
  showValues?: boolean | null
  showVision?: boolean | null
}

export const CompanyAboutBlock: React.FC<Props> = async ({
  heading,
  locale: localeProp,
  showIntroduction = true,
  showLogo = true,
  showMission = true,
  showValues = true,
  showVision = true,
}) => {
  const locale: Locale = isLocale(localeProp) ? localeProp : defaultLocale
  const dictionary = getDictionary(locale)
  const company: CompanyInformation = await getCompanyInformation(locale)

  const values = (company.values || []).filter((row) => row?.title?.trim())
  const hasIntro = Boolean(showIntroduction && company.introduction)
  const hasMission = Boolean(showMission && company.mission?.trim())
  const hasVision = Boolean(showVision && company.vision?.trim())
  const hasValues = Boolean(showValues && values.length > 0)
  const hasLogo = Boolean(showLogo && (company.logo || company.legalName || company.shortName))

  if (!hasLogo && !hasIntro && !hasMission && !hasVision && !hasValues) {
    return null
  }

  const title = heading?.trim() || dictionary.company.aboutHeading

  return (
    <section aria-labelledby="company-about-heading" className="container">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8" id="company-about-heading">
        {title}
      </h2>

      {hasLogo ? (
        <div className="mb-8">
          <CompanyIdentity company={company} size="block" />
        </div>
      ) : null}

      {hasIntro && company.introduction ? (
        <div className="mb-10 max-w-[48rem]">
          <RichText data={company.introduction} enableGutter={false} />
        </div>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        {hasMission ? (
          <section aria-labelledby="company-mission-heading">
            <h3 className="text-xl font-semibold mb-3" id="company-mission-heading">
              {dictionary.company.mission}
            </h3>
            <p className="text-muted-foreground leading-relaxed m-0 whitespace-pre-line">
              {company.mission}
            </p>
          </section>
        ) : null}

        {hasVision ? (
          <section aria-labelledby="company-vision-heading">
            <h3 className="text-xl font-semibold mb-3" id="company-vision-heading">
              {dictionary.company.vision}
            </h3>
            <p className="text-muted-foreground leading-relaxed m-0 whitespace-pre-line">
              {company.vision}
            </p>
          </section>
        ) : null}
      </div>

      {hasValues ? (
        <section aria-labelledby="company-values-heading" className="mt-10">
          <h3 className="text-xl font-semibold mb-6" id="company-values-heading">
            {dictionary.company.values}
          </h3>
          <ul className="grid gap-4 sm:grid-cols-2 list-none p-0 m-0">
            {values.map((value, index) => (
              <li className="nama-card p-5" key={value.id || `${value.title}-${index}`}>
                <h4 className="font-semibold mb-2">{value.title}</h4>
                {value.description ? (
                  <p className="text-sm text-muted-foreground m-0 leading-relaxed">
                    {value.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  )
}
