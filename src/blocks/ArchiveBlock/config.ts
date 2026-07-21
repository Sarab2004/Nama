import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
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
      label: {
        en: 'Intro Content',
        fa: 'محتوای مقدمه',
      },
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      label: {
        en: 'Populate By',
        fa: 'نمایش بر اساس',
      },
      options: [
        {
          label: { en: 'Collection', fa: 'مجموعه' },
          value: 'collection',
        },
        {
          label: { en: 'Individual Selection', fa: 'انتخاب دستی' },
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: {
        en: 'Collections To Show',
        fa: 'مجموعه برای نمایش',
      },
      options: [
        {
          label: { en: 'Posts', fa: 'نوشته‌ها' },
          value: 'posts',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: {
        en: 'Categories To Show',
        fa: 'دسته‌بندی‌ها برای نمایش',
      },
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: {
        en: 'Limit',
        fa: 'تعداد نمایش',
      },
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: {
        en: 'Selection',
        fa: 'انتخاب‌ها',
      },
      relationTo: ['posts'],
    },
  ],
  labels: {
    plural: { en: 'Archives', fa: 'آرشیوها' },
    singular: { en: 'Archive', fa: 'آرشیو' },
  },
}
