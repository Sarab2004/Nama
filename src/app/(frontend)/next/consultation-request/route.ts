import { getPayload } from 'payload'
import config from '@payload-config'

import { getDictionary } from '@/i18n/dictionaries'
import { isLocale, type Locale } from '@/i18n/config'
import { submitConsultationRequest } from '@/utilities/submitConsultationRequest'
import type { ConsultationRequestInput } from '@/utilities/validateConsultationRequest'

export const POST = async (request: Request): Promise<Response> => {
  let body: ConsultationRequestInput

  try {
    body = (await request.json()) as ConsultationRequestInput
  } catch {
    return Response.json(
      { success: false, errors: [{ message: 'Invalid request.' }] },
      { status: 400 },
    )
  }

  const locale: Locale = isLocale(String(body.locale)) ? (body.locale as Locale) : 'fa'
  const dictionary = getDictionary(locale)
  const messages = dictionary.consultation.validation

  const payload = await getPayload({ config })

  const result = await submitConsultationRequest({
    payload,
    input: body,
    messages: {
      ...messages,
      consentText: dictionary.consultation.consentLabel,
      genericError: dictionary.consultation.errorGeneric,
    },
  })

  if (!result.ok) {
    return Response.json(
      {
        success: false,
        errors: result.errors.map((error) => ({
          field: error.field,
          message: error.message,
        })),
      },
      { status: result.status },
    )
  }

  // Public response must not include submission fields, IDs, or internal notes.
  return Response.json({ success: true, message: dictionary.consultation.successMessage })
}
