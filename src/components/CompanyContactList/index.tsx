import React from 'react'

import type { CompanyInformation } from '@/payload-types'

import {
  getValidEmails,
  getValidPhones,
  toMailtoHref,
  toTelHref,
  type CompanyEmail,
  type CompanyPhone,
} from '@/utilities/companyContact'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  company: Pick<CompanyInformation, 'phones' | 'emails'>
  emailsOnly?: boolean
  phonesOnly?: boolean
  /** When true, only primary (or first valid) entries are shown */
  primaryOnly?: boolean
}

const PhoneItem = ({ phone }: { phone: CompanyPhone }) => {
  const href = phone.type === 'fax' ? null : toTelHref(phone.number)
  const label = phone.label?.trim()

  return (
    <li>
      {label ? <span className="block text-sm text-muted-foreground mb-0.5">{label}</span> : null}
      {href ? (
        <a
          className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          href={href}
        >
          {phone.number}
        </a>
      ) : (
        <span>{phone.number}</span>
      )}
    </li>
  )
}

const EmailItem = ({ email }: { email: CompanyEmail }) => {
  const href = toMailtoHref(email.address)
  const label = email.label?.trim()

  return (
    <li>
      {label ? <span className="block text-sm text-muted-foreground mb-0.5">{label}</span> : null}
      {href ? (
        <a
          className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          href={href}
        >
          {email.address}
        </a>
      ) : (
        <span>{email.address}</span>
      )}
    </li>
  )
}

export const CompanyContactList: React.FC<Props> = ({
  className,
  company,
  emailsOnly = false,
  phonesOnly = false,
  primaryOnly = false,
}) => {
  let phones = getValidPhones(company.phones)
  let emails = getValidEmails(company.emails)

  if (primaryOnly) {
    phones = phones.filter((row) => row.isPrimary).slice(0, 1)
    if (phones.length === 0) {
      const first = getValidPhones(company.phones)[0]
      phones = first ? [first] : []
    }
    emails = emails.filter((row) => row.isPrimary).slice(0, 1)
    if (emails.length === 0) {
      const first = getValidEmails(company.emails)[0]
      emails = first ? [first] : []
    }
  }

  const showPhones = !emailsOnly && phones.length > 0
  const showEmails = !phonesOnly && emails.length > 0

  if (!showPhones && !showEmails) return null

  return (
    <div className={cn('space-y-4', className)}>
      {showPhones ? (
        <ul className="list-none p-0 m-0 space-y-2">
          {phones.map((phone, index) => (
            <PhoneItem key={phone.id || `${phone.number}-${index}`} phone={phone} />
          ))}
        </ul>
      ) : null}
      {showEmails ? (
        <ul className="list-none p-0 m-0 space-y-2">
          {emails.map((email, index) => (
            <EmailItem key={email.id || `${email.address}-${index}`} email={email} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}
