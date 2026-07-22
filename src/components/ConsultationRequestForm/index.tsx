'use client'

import React, { useEffect, useId, useRef, useState, useTransition } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'
import { CONSULTATION_ANCHOR } from '@/utilities/buildConsultationHref'
import { pickUtmFromSearchParams } from '@/utilities/consultationUtm'
import { getClientSideURL } from '@/utilities/getURL'
import { cn } from '@/utilities/ui'

export type ConsultationServiceOption = {
  slug: string
  title: string
}

export type ConsultationRequestFormProps = {
  allowServiceSelection?: boolean
  appearance?: 'compact' | 'full'
  className?: string
  defaultInquiryType?: string
  defaultServiceSlug?: string | null
  description?: string | null
  dictionary: Dictionary['consultation']
  locale: Locale
  relatedProjectSlug?: string | null
  services?: ConsultationServiceOption[]
  showCompanyField?: boolean
  showJobTitleField?: boolean
  sourceType?:
    | 'contact-page'
    | 'service'
    | 'project'
    | 'client'
    | 'page'
    | 'other'
  successMessage?: string | null
  title?: string | null
}

type FieldErrors = Record<string, string>

type FormState = {
  fullName: string
  companyName: string
  jobTitle: string
  phone: string
  email: string
  inquiryType: string
  interestedServiceSlugs: string[]
  message: string
  preferredContactMethod: string
  preferredContactTime: string
  consentToContact: boolean
  website: string
}

const emptyForm = (defaults: {
  inquiryType: string
  serviceSlug?: string | null
}): FormState => ({
  fullName: '',
  companyName: '',
  jobTitle: '',
  phone: '',
  email: '',
  inquiryType: defaults.inquiryType,
  interestedServiceSlugs: defaults.serviceSlug ? [defaults.serviceSlug] : [],
  message: '',
  preferredContactMethod: 'either',
  preferredContactTime: '',
  consentToContact: false,
  website: '',
})

export const ConsultationRequestForm: React.FC<ConsultationRequestFormProps> = ({
  allowServiceSelection = true,
  appearance = 'full',
  className,
  defaultInquiryType = 'general',
  defaultServiceSlug,
  description,
  dictionary,
  locale,
  relatedProjectSlug,
  services = [],
  showCompanyField = true,
  showJobTitleField = true,
  sourceType = 'page',
  successMessage,
  title,
}) => {
  const formId = useId()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const statusRef = useRef<HTMLDivElement>(null)
  const openedAtRef = useRef<number>(0)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const queryService = searchParams.get('service')
  const queryProject = searchParams.get('project')
  const resolvedServiceSlug = defaultServiceSlug ||
    (services.some((service) => service.slug === queryService) ? queryService : null)
  const resolvedProjectSlug = relatedProjectSlug || queryProject

  const [values, setValues] = useState<FormState>(() =>
    emptyForm({
      inquiryType: defaultInquiryType,
      serviceSlug: defaultServiceSlug || null,
    }),
  )

  const selectedServiceSlugs = (() => {
    const slugs = new Set(values.interestedServiceSlugs)
    if (resolvedServiceSlug) slugs.add(resolvedServiceSlug)
    return [...slugs]
  })()

  useEffect(() => {
    openedAtRef.current = Date.now()
  }, [])

  useEffect(() => {
    if ((success || formError || Object.keys(fieldErrors).length > 0) && statusRef.current) {
      statusRef.current.focus()
    }
  }, [success, formError, fieldErrors])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const toggleService = (slug: string) => {
    setValues((prev) => {
      const exists = prev.interestedServiceSlugs.includes(slug)
      return {
        ...prev,
        interestedServiceSlugs: exists
          ? prev.interestedServiceSlugs.filter((item) => item !== slug)
          : [...prev.interestedServiceSlugs, slug],
      }
    })
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending) return

    setFormError(null)
    setFieldErrors({})
    setSuccess(false)

    startTransition(async () => {
      try {
        const response = await fetch(`${getClientSideURL()}/next/consultation-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: values.fullName,
            companyName: values.companyName,
            jobTitle: values.jobTitle,
            phone: values.phone,
            email: values.email,
            inquiryType: values.inquiryType,
            interestedServiceSlugs: selectedServiceSlugs,
            relatedProjectSlug: resolvedProjectSlug || undefined,
            message: values.message,
            preferredContactMethod: values.preferredContactMethod,
            preferredContactTime: values.preferredContactTime,
            consentToContact: values.consentToContact,
            website: values.website,
            locale,
            sourcePath: pathname,
            sourceType,
            referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
            utm: pickUtmFromSearchParams(new URLSearchParams(searchParams.toString())),
            formOpenedAt: openedAtRef.current,
          }),
        })

        const payload = (await response.json()) as {
          success?: boolean
          message?: string
          errors?: { field?: string; message: string }[]
        }

        if (!response.ok || !payload.success) {
          const nextFieldErrors: FieldErrors = {}
          let nextFormError: string = dictionary.errorGeneric
          for (const error of payload.errors || []) {
            if (error.field) nextFieldErrors[error.field] = error.message
            else nextFormError = error.message
          }
          setFieldErrors(nextFieldErrors)
          setFormError(Object.keys(nextFieldErrors).length ? null : nextFormError)
          return
        }

        setSuccess(true)
        setValues(
          emptyForm({
            inquiryType: defaultInquiryType,
            serviceSlug: resolvedServiceSlug,
          }),
        )
        openedAtRef.current = Date.now()
      } catch {
        setFormError(dictionary.errorGeneric)
      }
    })
  }

  const inquiryOptions = [
    { value: 'service-consultation', label: dictionary.inquiryTypes.serviceConsultation },
    { value: 'project-inquiry', label: dictionary.inquiryTypes.projectInquiry },
    { value: 'partnership', label: dictionary.inquiryTypes.partnership },
    { value: 'general', label: dictionary.inquiryTypes.general },
    { value: 'other', label: dictionary.inquiryTypes.other },
  ]

  const contactMethodOptions = [
    { value: 'phone', label: dictionary.contactMethods.phone },
    { value: 'email', label: dictionary.contactMethods.email },
    { value: 'either', label: dictionary.contactMethods.either },
  ]

  const heading = title?.trim() || dictionary.defaultTitle
  const intro = description?.trim() || dictionary.defaultDescription
  const doneMessage = successMessage?.trim() || dictionary.successMessage
  const compact = appearance === 'compact'

  return (
    <section
      aria-labelledby={`${formId}-heading`}
      className={cn('w-full scroll-mt-24', className)}
      id={CONSULTATION_ANCHOR}
    >
      <div className={cn(compact ? 'space-y-4' : 'space-y-6')}>
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2" id={`${formId}-heading`}>
            {heading}
          </h2>
          {intro ? <p className="text-muted-foreground max-w-2xl m-0">{intro}</p> : null}
        </div>

        <div
          aria-live="polite"
          className="outline-none"
          ref={statusRef}
          tabIndex={-1}
        >
          {success ? (
            <p className="rounded-md border border-border bg-muted/40 px-4 py-3 m-0" role="status">
              {doneMessage}
            </p>
          ) : null}
          {formError ? (
            <p className="rounded-md border border-destructive/40 px-4 py-3 text-destructive m-0" role="alert">
              {formError}
            </p>
          ) : null}
        </div>

        {!success ? (
          <form
            className={cn('grid gap-4', compact ? 'md:gap-3' : 'md:gap-5')}
            noValidate
            onSubmit={onSubmit}
          >
            {/* Honeypot — hidden from assistive tech and keyboard users */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={`${formId}-website`}>Website</label>
              <input
                autoComplete="off"
                id={`${formId}-website`}
                name="website"
                onChange={(event) => setField('website', event.target.value)}
                tabIndex={-1}
                type="text"
                value={values.website}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                error={fieldErrors.fullName}
                htmlFor={`${formId}-fullName`}
                label={dictionary.fields.fullName}
                required
              >
                <Input
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  autoComplete="name"
                  disabled={isPending}
                  id={`${formId}-fullName`}
                  maxLength={120}
                  name="fullName"
                  onChange={(event) => setField('fullName', event.target.value)}
                  required
                  value={values.fullName}
                />
              </Field>

              {showCompanyField ? (
                <Field
                  error={fieldErrors.companyName}
                  htmlFor={`${formId}-companyName`}
                  label={dictionary.fields.companyName}
                >
                  <Input
                    autoComplete="organization"
                    disabled={isPending}
                    id={`${formId}-companyName`}
                    maxLength={160}
                    name="companyName"
                    onChange={(event) => setField('companyName', event.target.value)}
                    value={values.companyName}
                  />
                </Field>
              ) : null}

              {showJobTitleField ? (
                <Field
                  error={fieldErrors.jobTitle}
                  htmlFor={`${formId}-jobTitle`}
                  label={dictionary.fields.jobTitle}
                >
                  <Input
                    autoComplete="organization-title"
                    disabled={isPending}
                    id={`${formId}-jobTitle`}
                    maxLength={120}
                    name="jobTitle"
                    onChange={(event) => setField('jobTitle', event.target.value)}
                    value={values.jobTitle}
                  />
                </Field>
              ) : null}

              <Field
                error={fieldErrors.phone || fieldErrors.contact}
                htmlFor={`${formId}-phone`}
                label={dictionary.fields.phone}
              >
                <Input
                  aria-invalid={Boolean(fieldErrors.phone || fieldErrors.contact)}
                  autoComplete="tel"
                  disabled={isPending}
                  id={`${formId}-phone`}
                  maxLength={40}
                  name="phone"
                  onChange={(event) => setField('phone', event.target.value)}
                  type="tel"
                  value={values.phone}
                />
              </Field>

              <Field
                error={fieldErrors.email || fieldErrors.contact}
                htmlFor={`${formId}-email`}
                label={dictionary.fields.email}
              >
                <Input
                  aria-invalid={Boolean(fieldErrors.email || fieldErrors.contact)}
                  autoComplete="email"
                  disabled={isPending}
                  id={`${formId}-email`}
                  maxLength={160}
                  name="email"
                  onChange={(event) => setField('email', event.target.value)}
                  type="email"
                  value={values.email}
                />
              </Field>
            </div>

            <p className="text-sm text-muted-foreground m-0">{dictionary.contactHint}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                error={fieldErrors.inquiryType}
                htmlFor={`${formId}-inquiryType`}
                label={dictionary.fields.inquiryType}
              >
                <select
                  className="border-input bg-[var(--input-bg)] text-[var(--input-text)] flex h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs"
                  disabled={isPending}
                  id={`${formId}-inquiryType`}
                  name="inquiryType"
                  onChange={(event) => setField('inquiryType', event.target.value)}
                  value={values.inquiryType}
                >
                  {inquiryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                error={fieldErrors.preferredContactMethod}
                htmlFor={`${formId}-preferredContactMethod`}
                label={dictionary.fields.preferredContactMethod}
              >
                <select
                  className="border-input bg-[var(--input-bg)] text-[var(--input-text)] flex h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs"
                  disabled={isPending}
                  id={`${formId}-preferredContactMethod`}
                  name="preferredContactMethod"
                  onChange={(event) => setField('preferredContactMethod', event.target.value)}
                  value={values.preferredContactMethod}
                >
                  {contactMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {allowServiceSelection && services.length > 0 ? (
              <fieldset className="space-y-2 m-0 p-0 border-0">
                <legend className="text-sm font-medium mb-2">{dictionary.fields.interestedServices}</legend>
                <ul className="grid gap-2 sm:grid-cols-2 list-none p-0 m-0">
                  {services.map((service) => {
                    const checked = selectedServiceSlugs.includes(service.slug)
                    const locked = resolvedServiceSlug === service.slug
                    const inputId = `${formId}-service-${service.slug}`
                    return (
                      <li key={service.slug} className="flex items-start gap-2">
                        <Checkbox
                          checked={checked}
                          disabled={isPending || locked}
                          id={inputId}
                          onCheckedChange={() => toggleService(service.slug)}
                        />
                        <Label className="font-normal leading-snug" htmlFor={inputId}>
                          {service.title}
                        </Label>
                      </li>
                    )
                  })}
                </ul>
              </fieldset>
            ) : null}

            <Field
              error={fieldErrors.preferredContactTime}
              htmlFor={`${formId}-preferredContactTime`}
              label={dictionary.fields.preferredContactTime}
            >
              <Input
                disabled={isPending}
                id={`${formId}-preferredContactTime`}
                maxLength={120}
                name="preferredContactTime"
                onChange={(event) => setField('preferredContactTime', event.target.value)}
                placeholder={dictionary.preferredContactTimePlaceholder}
                value={values.preferredContactTime}
              />
            </Field>

            <Field
              error={fieldErrors.message}
              htmlFor={`${formId}-message`}
              label={dictionary.fields.message}
              required
            >
              <Textarea
                aria-invalid={Boolean(fieldErrors.message)}
                disabled={isPending}
                id={`${formId}-message`}
                maxLength={5000}
                name="message"
                onChange={(event) => setField('message', event.target.value)}
                required
                rows={5}
                value={values.message}
              />
            </Field>

            <div className="flex items-start gap-3">
              <Checkbox
                aria-invalid={Boolean(fieldErrors.consentToContact)}
                checked={values.consentToContact}
                disabled={isPending}
                id={`${formId}-consent`}
                onCheckedChange={(checked) => setField('consentToContact', checked === true)}
              />
              <div className="space-y-1">
                <Label className="font-normal leading-snug" htmlFor={`${formId}-consent`}>
                  {dictionary.consentLabel}
                </Label>
                {fieldErrors.consentToContact ? (
                  <p className="text-sm text-destructive m-0" role="alert">
                    {fieldErrors.consentToContact}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <Button disabled={isPending} type="submit">
                {isPending ? dictionary.submitting : dictionary.submit}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  )
}

const Field: React.FC<{
  children: React.ReactNode
  error?: string
  htmlFor: string
  label: string
  required?: boolean
}> = ({ children, error, htmlFor, label, required }) => (
  <div className="space-y-2">
    <Label htmlFor={htmlFor}>
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </Label>
    {children}
    {error ? (
      <p className="text-sm text-destructive m-0" role="alert">
        {error}
      </p>
    ) : null}
  </div>
)
