import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { locales } from '@/i18n/config'

/**
 * Company Information feeds Header, Footer, locale layout JSON-LD, and About/Contact blocks.
 * Locale layout revalidation refreshes those surfaces without enumerating every page path.
 */
export const revalidateCompanyInformation: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  payload.logger.info('Revalidating company-information')

  for (const locale of locales) {
    const tag = `global_company-information_${locale}`
    try {
      revalidateTag(tag, 'max')
    } catch (err) {
      payload.logger.warn(
        `Could not revalidate tag ${tag}: ${err instanceof Error ? err.message : err}`,
      )
    }

    const layoutPath = `/${locale}`
    try {
      revalidatePath(layoutPath, 'layout')
    } catch (err) {
      payload.logger.warn(
        `Could not revalidate layout ${layoutPath}: ${err instanceof Error ? err.message : err}`,
      )
    }
  }

  return doc
}
