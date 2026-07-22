import { localizePath, type Locale } from '@/i18n/config'

export const CONSULTATION_ANCHOR = 'consultation'
export const CONSULTATION_PATH = '/contact'

export type ConsultationCtaContext = {
  /** When true, stay on the current page and scroll to the form anchor. */
  hasFormOnPage?: boolean
  serviceSlug?: string | null
  projectSlug?: string | null
}

/**
 * Builds a locale-aware consultation CTA href.
 * Context uses published slugs only; the submit endpoint re-resolves them server-side.
 */
export const buildConsultationHref = (
  locale: Locale,
  context: ConsultationCtaContext = {},
): string => {
  if (context.hasFormOnPage) {
    return `#${CONSULTATION_ANCHOR}`
  }

  const params = new URLSearchParams()
  if (context.serviceSlug) params.set('service', context.serviceSlug)
  if (context.projectSlug) params.set('project', context.projectSlug)

  const query = params.toString()
  const localized = localizePath(CONSULTATION_PATH, locale)
  const withQuery = query ? `${localized}?${query}` : localized
  return `${withQuery}#${CONSULTATION_ANCHOR}`
}
