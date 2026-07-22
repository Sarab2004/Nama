/** Client-safe UTM helpers (no Payload imports). */

export type ConsultationUtm = {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

export const pickUtmFromSearchParams = (
  params: URLSearchParams,
): ConsultationUtm | undefined => {
  const utm = {
    source: params.get('utm_source')?.trim().slice(0, 120) || undefined,
    medium: params.get('utm_medium')?.trim().slice(0, 120) || undefined,
    campaign: params.get('utm_campaign')?.trim().slice(0, 120) || undefined,
    term: params.get('utm_term')?.trim().slice(0, 120) || undefined,
    content: params.get('utm_content')?.trim().slice(0, 120) || undefined,
  }
  if (!utm.source && !utm.medium && !utm.campaign && !utm.term && !utm.content) return undefined
  return utm
}
