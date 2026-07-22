import { HeaderClient } from './Component.client'
import type { Locale } from '@/i18n/config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getCompanyInformation } from '@/utilities/getCompanyInformation'
import { getCompanyBrandName } from '@/utilities/companyContact'
import React from 'react'

export async function Header({ locale }: { locale?: Locale }) {
  const [headerData, company] = await Promise.all([
    getCachedGlobal('header', 1, locale)(),
    getCompanyInformation(locale),
  ])

  const brandName = getCompanyBrandName(company)
  const logo = company.logo && typeof company.logo === 'object' ? company.logo : null

  return (
    <HeaderClient
      company={{
        brandName,
        logo,
      }}
      data={headerData}
    />
  )
}
