import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  labels: {
    singular: {
      en: 'Category',
      fa: 'دسته‌بندی',
    },
    plural: {
      en: 'Categories',
      fa: 'دسته‌بندی‌ها',
    },
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Title',
        fa: 'عنوان',
      },
      localized: true,
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
