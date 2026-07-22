import type { Block } from 'payload'

export const ConsultationRequest: Block = {
  slug: 'consultationRequest',
  interfaceName: 'ConsultationRequestBlock',
  labels: {
    singular: { en: 'Consultation Request Form', fa: 'فرم درخواست مشاوره' },
    plural: { en: 'Consultation Request Forms', fa: 'فرم‌های درخواست مشاوره' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      maxLength: 120,
      label: { en: 'Title', fa: 'عنوان' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      maxLength: 400,
      label: { en: 'Description', fa: 'توضیح' },
    },
    {
      name: 'showCompanyField',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Show company field', fa: 'نمایش فیلد شرکت' },
    },
    {
      name: 'showJobTitleField',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Show job title field', fa: 'نمایش فیلد سمت' },
    },
    {
      name: 'allowServiceSelection',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Allow service selection', fa: 'اجازه انتخاب خدمات' },
    },
    {
      name: 'defaultService',
      type: 'relationship',
      relationTo: 'services',
      label: { en: 'Default service', fa: 'خدمت پیش‌فرض' },
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.allowServiceSelection),
      },
    },
    {
      name: 'inquiryType',
      type: 'select',
      defaultValue: 'general',
      label: { en: 'Default inquiry type', fa: 'نوع درخواست پیش‌فرض' },
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
      name: 'successMessage',
      type: 'textarea',
      localized: true,
      maxLength: 300,
      label: { en: 'Success message', fa: 'پیام موفقیت' },
    },
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'full',
      label: { en: 'Appearance', fa: 'ظاهر' },
      options: [
        { label: { en: 'Full', fa: 'کامل' }, value: 'full' },
        { label: { en: 'Compact', fa: 'فشرده' }, value: 'compact' },
      ],
    },
  ],
}
