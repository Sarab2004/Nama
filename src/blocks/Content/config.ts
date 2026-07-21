import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    label: {
      en: 'Column Size',
      fa: 'اندازه ستون',
    },
    options: [
      {
        label: { en: 'One Third', fa: 'یک سوم' },
        value: 'oneThird',
      },
      {
        label: { en: 'Half', fa: 'نصف' },
        value: 'half',
      },
      {
        label: { en: 'Two Thirds', fa: 'دو سوم' },
        value: 'twoThirds',
      },
      {
        label: { en: 'Full', fa: 'تمام عرض' },
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    localized: true,
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: {
      en: 'Enable Link',
      fa: 'فعال‌سازی لینک',
    },
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: {
        en: 'Columns',
        fa: 'ستون‌ها',
      },
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
  labels: {
    plural: { en: 'Content Blocks', fa: 'بلوک‌های محتوا' },
    singular: { en: 'Content', fa: 'محتوا' },
  },
}
