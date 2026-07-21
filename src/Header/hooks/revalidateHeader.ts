import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    try {
      revalidateTag('global_header', 'max')
    } catch (err) {
      payload.logger.warn(`Could not revalidate tag global_header: ${err instanceof Error ? err.message : err}`)
    }
  }

  return doc
}
