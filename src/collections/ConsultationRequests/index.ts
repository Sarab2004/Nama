import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'

import { authenticated } from '@/access/authenticated'

const setSubmittedAt: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (!data) return data
  if (operation === 'create' && !data.submittedAt) {
    return { ...data, submittedAt: new Date().toISOString() }
  }
  return data
}

/**
 * Dedicated CRM-style lead collection. Public create is disabled on the collection;
 * submissions go through `/api/consultation-requests` after server-side validation.
 * `overrideAccess: true` is used only inside that controlled route.
 */
export const ConsultationRequests: CollectionConfig = {
  slug: 'consultation-requests',
  labels: {
    singular: {
      en: 'Consultation Request',
      fa: 'درخواست مشاوره',
    },
    plural: {
      en: 'Consultation Requests',
      fa: 'درخواست‌های مشاوره',
    },
  },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: [
      'fullName',
      'companyName',
      'status',
      'interestedServices',
      'submittedAt',
      'assignedTo',
    ],
    group: {
      en: 'Leads',
      fa: 'مدیریت درخواست‌ها',
    },
    description: {
      en: 'Inbound consultation requests. Not publicly readable; create only via the controlled public API.',
      fa: 'درخواست‌های مشاوره ورودی. برای عموم قابل خواندن نیست؛ ایجاد فقط از API کنترل‌شده.',
    },
  },
  defaultSort: '-submittedAt',
  access: {
    // Public must not create via REST/GraphQL — use the validated route handler instead.
    create: () => false,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  timestamps: true,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Applicant', fa: 'متقاضی' },
          fields: [
            {
              name: 'fullName',
              type: 'text',
              required: true,
              maxLength: 120,
              label: { en: 'Full name', fa: 'نام و نام خانوادگی' },
            },
            {
              name: 'companyName',
              type: 'text',
              maxLength: 160,
              label: { en: 'Company name', fa: 'نام شرکت' },
            },
            {
              name: 'jobTitle',
              type: 'text',
              maxLength: 120,
              label: { en: 'Job title', fa: 'سمت سازمانی' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'phone',
                  type: 'text',
                  maxLength: 40,
                  label: { en: 'Phone', fa: 'تلفن' },
                  admin: { width: '50%' },
                },
                {
                  name: 'email',
                  type: 'email',
                  label: { en: 'Email', fa: 'ایمیل' },
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'preferredContactMethod',
              type: 'select',
              defaultValue: 'either',
              label: { en: 'Preferred contact method', fa: 'روش تماس ترجیحی' },
              options: [
                { label: { en: 'Phone', fa: 'تلفن' }, value: 'phone' },
                { label: { en: 'Email', fa: 'ایمیل' }, value: 'email' },
                { label: { en: 'Either', fa: 'هر کدام' }, value: 'either' },
              ],
            },
            {
              name: 'preferredContactTime',
              type: 'text',
              maxLength: 120,
              label: { en: 'Preferred contact time', fa: 'زمان ترجیحی تماس' },
            },
          ],
        },
        {
          label: { en: 'Inquiry', fa: 'موضوع درخواست' },
          fields: [
            {
              name: 'inquiryType',
              type: 'select',
              defaultValue: 'general',
              label: { en: 'Inquiry type', fa: 'نوع درخواست' },
              options: [
                {
                  label: { en: 'Service consultation', fa: 'مشاوره خدمت' },
                  value: 'service-consultation',
                },
                {
                  label: { en: 'Project inquiry', fa: 'پیگیری پروژه' },
                  value: 'project-inquiry',
                },
                {
                  label: { en: 'Partnership', fa: 'همکاری' },
                  value: 'partnership',
                },
                { label: { en: 'General', fa: 'عمومی' }, value: 'general' },
                { label: { en: 'Other', fa: 'سایر' }, value: 'other' },
              ],
            },
            {
              name: 'interestedServices',
              type: 'relationship',
              relationTo: 'services',
              hasMany: true,
              label: { en: 'Interested services', fa: 'خدمات موردنظر' },
            },
            {
              name: 'relatedProject',
              type: 'relationship',
              relationTo: 'projects',
              hasMany: false,
              label: { en: 'Related project', fa: 'پروژه مرتبط' },
            },
            {
              name: 'message',
              type: 'textarea',
              required: true,
              maxLength: 5000,
              label: { en: 'Message', fa: 'پیام' },
              admin: {
                description: {
                  en: 'Main request body from the applicant.',
                  fa: 'متن اصلی درخواست متقاضی.',
                },
              },
            },
            {
              name: 'consentToContact',
              type: 'checkbox',
              required: true,
              defaultValue: false,
              label: {
                en: 'Consent to be contacted',
                fa: 'رضایت برای تماس',
              },
            },
            {
              name: 'consentText',
              type: 'textarea',
              label: {
                en: 'Consent text (as shown)',
                fa: 'متن رضایت نمایش‌داده‌شده',
              },
              admin: {
                readOnly: true,
                description: {
                  en: 'Snapshot of the consent copy accepted at submit time.',
                  fa: 'نسخه متن رضایتی که هنگام ارسال پذیرفته شده است.',
                },
              },
            },
          ],
        },
        {
          label: { en: 'Source', fa: 'منبع' },
          fields: [
            {
              name: 'locale',
              type: 'select',
              required: true,
              defaultValue: 'fa',
              options: [
                { label: 'فارسی', value: 'fa' },
                { label: 'English', value: 'en' },
              ],
              label: { en: 'Locale', fa: 'زبان' },
            },
            {
              name: 'sourcePath',
              type: 'text',
              maxLength: 500,
              label: { en: 'Source path', fa: 'مسیر منبع' },
            },
            {
              name: 'sourceType',
              type: 'select',
              defaultValue: 'other',
              label: { en: 'Source type', fa: 'نوع منبع' },
              options: [
                { label: { en: 'Contact page', fa: 'صفحه تماس' }, value: 'contact-page' },
                { label: { en: 'Service', fa: 'خدمت' }, value: 'service' },
                { label: { en: 'Project', fa: 'پروژه' }, value: 'project' },
                { label: { en: 'Client', fa: 'کارفرما' }, value: 'client' },
                { label: { en: 'Page', fa: 'صفحه' }, value: 'page' },
                { label: { en: 'Other', fa: 'سایر' }, value: 'other' },
              ],
            },
            {
              name: 'referrer',
              type: 'text',
              maxLength: 500,
              label: { en: 'Referrer', fa: 'ارجاع‌دهنده' },
            },
            {
              name: 'utm',
              type: 'group',
              label: { en: 'UTM', fa: 'UTM' },
              fields: [
                { name: 'source', type: 'text', maxLength: 120, label: 'utm_source' },
                { name: 'medium', type: 'text', maxLength: 120, label: 'utm_medium' },
                { name: 'campaign', type: 'text', maxLength: 120, label: 'utm_campaign' },
                { name: 'term', type: 'text', maxLength: 120, label: 'utm_term' },
                { name: 'content', type: 'text', maxLength: 120, label: 'utm_content' },
              ],
            },
          ],
        },
        {
          label: { en: 'Workflow', fa: 'پیگیری داخلی' },
          fields: [
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'new',
              label: { en: 'Status', fa: 'وضعیت' },
              options: [
                { label: { en: 'New', fa: 'جدید' }, value: 'new' },
                { label: { en: 'Contacted', fa: 'تماس گرفته‌شده' }, value: 'contacted' },
                { label: { en: 'Qualified', fa: 'واجد شرایط' }, value: 'qualified' },
                { label: { en: 'In progress', fa: 'در حال پیگیری' }, value: 'in-progress' },
                { label: { en: 'Converted', fa: 'تبدیل‌شده' }, value: 'converted' },
                { label: { en: 'Closed', fa: 'بسته‌شده' }, value: 'closed' },
                { label: { en: 'Spam', fa: 'هرزنامه' }, value: 'spam' },
              ],
            },
            {
              name: 'assignedTo',
              type: 'relationship',
              relationTo: 'users',
              label: { en: 'Assigned to', fa: 'مسئول پیگیری' },
            },
            {
              name: 'internalNotes',
              type: 'textarea',
              maxLength: 10000,
              label: { en: 'Internal notes', fa: 'یادداشت داخلی' },
              access: {
                read: ({ req }) => Boolean(req.user),
                update: ({ req }) => Boolean(req.user),
              },
              admin: {
                description: {
                  en: 'Staff only — never exposed on the public API.',
                  fa: 'فقط برای مدیران — در API عمومی برگردانده نمی‌شود.',
                },
              },
            },
            {
              name: 'submittedAt',
              type: 'date',
              label: { en: 'Submitted at', fa: 'زمان ارسال' },
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                readOnly: true,
              },
            },
            {
              name: 'contactedAt',
              type: 'date',
              label: { en: 'Contacted at', fa: 'زمان اولین تماس' },
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'closedAt',
              type: 'date',
              label: { en: 'Closed at', fa: 'زمان بستن' },
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [setSubmittedAt],
  },
}
