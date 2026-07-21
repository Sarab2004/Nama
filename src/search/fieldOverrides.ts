import { Field } from 'payload'

export const searchFields: Field[] = [
  {
    name: 'slug',
    type: 'text',
    index: true,
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'meta',
    label: {
      en: 'Meta',
      fa: 'متا',
    },
    type: 'group',
    index: true,
    admin: {
      readOnly: true,
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: {
          en: 'Title',
          fa: 'عنوان',
        },
      },
      {
        type: 'text',
        name: 'description',
        label: {
          en: 'Description',
          fa: 'توضیحات',
        },
      },
      {
        name: 'image',
        label: {
          en: 'Image',
          fa: 'تصویر',
        },
        type: 'upload',
        relationTo: 'media',
      },
    ],
  },
  {
    label: {
      en: 'Categories',
      fa: 'دسته‌بندی‌ها',
    },
    name: 'categories',
    type: 'array',
    admin: {
      readOnly: true,
    },
    fields: [
      {
        name: 'relationTo',
        type: 'text',
      },
      {
        name: 'categoryID',
        type: 'text',
      },
      {
        name: 'title',
        type: 'text',
      },
    ],
  },
]
