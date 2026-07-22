import type { Block } from 'payload'

export const CompanyContact: Block = {
  slug: 'companyContact',
  interfaceName: 'CompanyContactBlock',
  labels: {
    singular: { en: 'Company Contact', fa: 'تماس شرکت' },
    plural: { en: 'Company Contact Blocks', fa: 'بلوک‌های تماس شرکت' },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: { en: 'Section heading', fa: 'عنوان بخش' },
      maxLength: 120,
    },
    {
      name: 'showPhones',
      type: 'checkbox',
      label: { en: 'Show phone numbers', fa: 'نمایش شماره‌ها' },
      defaultValue: true,
    },
    {
      name: 'showEmails',
      type: 'checkbox',
      label: { en: 'Show emails', fa: 'نمایش ایمیل‌ها' },
      defaultValue: true,
    },
    {
      name: 'showAddress',
      type: 'checkbox',
      label: { en: 'Show address', fa: 'نمایش نشانی' },
      defaultValue: true,
    },
    {
      name: 'showWorkingHours',
      type: 'checkbox',
      label: { en: 'Show working hours', fa: 'نمایش ساعات کاری' },
      defaultValue: true,
    },
    {
      name: 'showSocial',
      type: 'checkbox',
      label: { en: 'Show social links', fa: 'نمایش شبکه‌های اجتماعی' },
      defaultValue: true,
    },
    {
      name: 'showMapLink',
      type: 'checkbox',
      label: { en: 'Show map link', fa: 'نمایش لینک نقشه' },
      defaultValue: true,
    },
  ],
}
