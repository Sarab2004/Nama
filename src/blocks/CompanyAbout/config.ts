import type { Block } from 'payload'

export const CompanyAbout: Block = {
  slug: 'companyAbout',
  interfaceName: 'CompanyAboutBlock',
  labels: {
    singular: { en: 'Company About', fa: 'درباره شرکت' },
    plural: { en: 'Company About Blocks', fa: 'بلوک‌های درباره شرکت' },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: { en: 'Section heading', fa: 'عنوان بخش' },
      admin: {
        description: {
          en: 'Optional. Leave empty to use the default About heading from the site dictionary.',
          fa: 'اختیاری. در صورت خالی بودن، عنوان پیش‌فرض دیکشنری سایت استفاده می‌شود.',
        },
      },
      maxLength: 120,
    },
    {
      name: 'showLogo',
      type: 'checkbox',
      label: { en: 'Show logo', fa: 'نمایش لوگو' },
      defaultValue: true,
    },
    {
      name: 'showIntroduction',
      type: 'checkbox',
      label: { en: 'Show introduction', fa: 'نمایش معرفی' },
      defaultValue: true,
    },
    {
      name: 'showMission',
      type: 'checkbox',
      label: { en: 'Show mission', fa: 'نمایش مأموریت' },
      defaultValue: true,
    },
    {
      name: 'showVision',
      type: 'checkbox',
      label: { en: 'Show vision', fa: 'نمایش چشم‌انداز' },
      defaultValue: true,
    },
    {
      name: 'showValues',
      type: 'checkbox',
      label: { en: 'Show values', fa: 'نمایش ارزش‌ها' },
      defaultValue: true,
    },
  ],
}
