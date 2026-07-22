import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import type { Locale } from '@/i18n/config'
import {
  buildConsultationHref,
  CONSULTATION_PATH,
  type ConsultationCtaContext,
} from '@/utilities/buildConsultationHref'

export { CONSULTATION_PATH }

type Props = {
  description: string
  label: string
  locale: Locale
  title: string
} & ConsultationCtaContext

export const ServiceConsultationCTA: React.FC<Props> = ({
  description,
  hasFormOnPage,
  label,
  locale,
  projectSlug,
  serviceSlug,
  title,
}) => {
  const href = buildConsultationHref(locale, {
    hasFormOnPage,
    projectSlug,
    serviceSlug,
  })

  return (
    <aside className="mt-16 nama-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-2xl">{description}</p>
      <Button asChild variant="default">
        <Link href={href}>{label}</Link>
      </Button>
    </aside>
  )
}
