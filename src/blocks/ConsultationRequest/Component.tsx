import React, { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { ConsultationRequestForm } from '@/components/ConsultationRequestForm'
import { defaultLocale, isLocale, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import type { Service } from '@/payload-types'

type Props = {
  allowServiceSelection?: boolean | null
  appearance?: 'compact' | 'full' | null
  defaultService?: number | Service | null
  description?: string | null
  disableInnerContainer?: boolean
  inquiryType?: string | null
  locale?: Locale
  showCompanyField?: boolean | null
  showJobTitleField?: boolean | null
  successMessage?: string | null
  title?: string | null
}

const resolveDefaultServiceSlug = (value: Props['defaultService']): string | null => {
  if (!value || typeof value === 'number') return null
  if (value._status && value._status !== 'published') return null
  return typeof value.slug === 'string' ? value.slug : null
}

export const ConsultationRequestBlock: React.FC<Props> = async ({
  allowServiceSelection = true,
  appearance = 'full',
  defaultService,
  description,
  inquiryType = 'general',
  locale: localeProp,
  showCompanyField = true,
  showJobTitleField = true,
  successMessage,
  title,
}) => {
  const locale: Locale = isLocale(localeProp) ? localeProp : defaultLocale
  const dictionary = getDictionary(locale)
  const payload = await getPayload({ config: configPromise })

  const servicesResult = allowServiceSelection
    ? await payload.find({
        collection: 'services',
        depth: 0,
        draft: false,
        limit: 50,
        locale,
        overrideAccess: false,
        pagination: false,
        sort: 'title',
        where: {
          _status: { equals: 'published' },
        },
      })
    : { docs: [] as Service[] }

  const services = servicesResult.docs
    .filter((doc): doc is Service & { slug: string; title: string } =>
      Boolean(doc.slug && doc.title),
    )
    .map((doc) => ({ slug: doc.slug, title: doc.title }))

  return (
    <div className="container">
      <Suspense fallback={<p className="text-muted-foreground">{dictionary.common.loading}</p>}>
        <ConsultationRequestForm
          allowServiceSelection={Boolean(allowServiceSelection)}
          appearance={appearance === 'compact' ? 'compact' : 'full'}
          defaultInquiryType={inquiryType || 'general'}
          defaultServiceSlug={resolveDefaultServiceSlug(defaultService)}
          description={description}
          dictionary={dictionary.consultation}
          locale={locale}
          services={services}
          showCompanyField={showCompanyField !== false}
          showJobTitleField={showJobTitleField !== false}
          sourceType="contact-page"
          successMessage={successMessage}
          title={title}
        />
      </Suspense>
    </div>
  )
}
