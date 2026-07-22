import { cache } from 'react'

import type { CompanyInformation } from '@/payload-types'
import { defaultLocale, type Locale } from '@/i18n/config'
import { getCachedGlobal } from '@/utilities/getGlobals'

/**
 * Request-deduped, locale-aware Company Information from the CMS Global.
 * Uses the shared `getCachedGlobal` tag pattern: `global_company-information_[locale]`.
 */
export const getCompanyInformation = cache(
  async (locale: Locale = defaultLocale): Promise<CompanyInformation> => {
    return getCachedGlobal('company-information', 1, locale)()
  },
)
