import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: {
        en: 'Hero Type',
        fa: 'نوع هیرو',
      },
      options: [
        {
          label: { en: 'None', fa: 'بدون هیرو' },
          value: 'none',
        },
        {
          label: { en: 'High Impact', fa: 'تأثیر بالا' },
          value: 'highImpact',
        },
        {
          label: { en: 'Medium Impact', fa: 'تأثیر متوسط' },
          value: 'mediumImpact',
        },
        {
          label: { en: 'Low Impact', fa: 'تأثیر کم' },
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      label: {
        en: 'Media',
        fa: 'تصویر/رسانه',
      },
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
  ],
  label: false,
}
