import React from 'react'

import type { Service } from '@/payload-types'

import RichText from '@/components/RichText'

type FAQItem = NonNullable<Service['faqs']>[number]

type Props = {
  faqs: FAQItem[]
  title: string
}

export const ServiceFAQ: React.FC<Props> = ({ faqs, title }) => {
  const items = faqs.filter((faq) => faq?.question?.trim() && faq.answer)

  if (items.length === 0) return null

  return (
    <section aria-labelledby="service-faqs-heading" className="mt-12">
      <h2 className="text-2xl font-semibold mb-6" id="service-faqs-heading">
        {title}
      </h2>
      <div className="divide-y divide-border border-y border-border">
        {items.map((faq, index) => {
          const panelId = `service-faq-panel-${index}`
          const buttonId = `service-faq-button-${index}`

          return (
            <details className="group py-1" key={faq.id || `${faq.question}-${index}`}>
              <summary
                aria-controls={panelId}
                className="cursor-pointer list-none py-4 font-medium marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm flex items-center justify-between gap-4"
                id={buttonId}
              >
                <span>{faq.question}</span>
                <span aria-hidden="true" className="text-muted-foreground transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div
                aria-labelledby={buttonId}
                className="pb-4 text-muted-foreground"
                id={panelId}
                role="region"
              >
                <RichText className="max-w-none" data={faq.answer} enableGutter={false} />
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}
