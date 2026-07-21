import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { localizePath, type Locale } from '@/i18n/config'

/**
 * Consultation CTA targets the existing Contact page until a dedicated
 * Consultation Requests collection/form exists. Do not hardcode company phones/emails here.
 */
export const CONSULTATION_PATH = '/contact'

type Props = {
  description: string
  label: string
  locale: Locale
  title: string
}

export const ServiceConsultationCTA: React.FC<Props> = ({
  description,
  label,
  locale,
  title,
}) => {
  return (
    <aside className="mt-16 nama-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-2xl">{description}</p>
      <Button asChild variant="default">
        <Link href={localizePath(CONSULTATION_PATH, locale)}>{label}</Link>
      </Button>
    </aside>
  )
}
