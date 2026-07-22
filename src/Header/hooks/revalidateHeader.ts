import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

import { locales } from '@/i18n/config'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    for (const locale of locales) {
      const tag = `global_header_${locale}`
      try {
        revalidateTag(tag, 'max')
      } catch (err) {
        payload.logger.warn(
          `Could not revalidate tag ${tag}: ${err instanceof Error ? err.message : err}`,
        )
      }
    }
  }

  return doc
}
