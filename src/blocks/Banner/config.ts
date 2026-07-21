import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Banner: Block = {
  slug: 'banner',
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'info',
      label: {
        en: 'Style',
        fa: 'سبک',
      },
      options: [
        { label: { en: 'Info', fa: 'اطلاعات' }, value: 'info' },
        { label: { en: 'Warning', fa: 'هشدار' }, value: 'warning' },
        { label: { en: 'Error', fa: 'خطا' }, value: 'error' },
        { label: { en: 'Success', fa: 'موفقیت' }, value: 'success' },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: false,
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
  labels: {
    plural: { en: 'Banners', fa: 'بنرها' },
    singular: { en: 'Banner', fa: 'بنر' },
  },
}
