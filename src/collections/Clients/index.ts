import type { CollectionConfig, NumberFieldSingleValidation, TextFieldSingleValidation } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { defaultLexical } from '../../fields/defaultLexical'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

const validateOptionalWebsite: TextFieldSingleValidation = (value) => {
  if (value == null || value === '') return true

  try {
    const parsed = new URL(String(value))
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'آدرس باید با http یا https شروع شود.'
    }
    return true
  } catch {
    return 'یک نشانی اینترنتی معتبر وارد کنید.'
  }
}

const validateDisplayOrder: NumberFieldSingleValidation = (value) => {
  if (value == null) return true
  if (typeof value === 'number' && value < 0) {
    return 'ترتیب نمایش نمی‌تواند منفی باشد.'
  }
  return true
}

export const Clients: CollectionConfig<'clients'> = {
  slug: 'clients',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  labels: {
    singular: {
      en: 'Client',
      fa: 'کارفرما',
    },
    plural: {
      en: 'Clients',
      fa: 'کارفرماها',
    },
  },
  defaultPopulate: {
    name: true,
    slug: true,
    logo: true,
    industry: true,
    shortDescription: true,
    featured: true,
    displayOrder: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['name', 'industry', '_status', 'updatedAt'],
    group: {
      en: 'Content',
      fa: 'محتوا',
    },
    useAsTitle: 'name',
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Client name',
        fa: 'نام کارفرما',
      },
      localized: true,
      maxLength: 160,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Profile',
            fa: 'پروفایل',
          },
          fields: [
            {
              name: 'logo',
              type: 'upload',
              label: {
                en: 'Logo',
                fa: 'لوگو',
              },
              relationTo: 'media',
              filterOptions: {
                mimeType: {
                  contains: 'image/',
                },
              },
            },
            {
              name: 'industry',
              type: 'text',
              label: {
                en: 'Industry',
                fa: 'حوزه فعالیت',
              },
              localized: true,
              maxLength: 120,
              admin: {
                description: 'مثلاً صنعت، انرژی، فناوری، خدمات مالی یا سازمان دولتی.',
              },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              label: {
                en: 'Short description',
                fa: 'معرفی کوتاه',
              },
              localized: true,
              maxLength: 320,
              admin: {
                description: 'خلاصه کوتاه برای کارت‌های آینده و فهرست کارفرماها.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: {
                en: 'Full description',
                fa: 'معرفی کامل',
              },
              localized: true,
              editor: defaultLexical,
            },
            {
              name: 'website',
              type: 'text',
              label: {
                en: 'Website',
                fa: 'وب‌سایت',
              },
              validate: validateOptionalWebsite,
              admin: {
                description: 'آدرس کامل وب‌سایت را با https وارد کنید (مثلاً https://example.com).',
              },
            },
          ],
        },
        {
          name: 'meta',
          label: {
            en: 'SEO',
            fa: 'سئو (SEO)',
          },
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            {
              ...MetaTitleField({
                hasGenerateFn: true,
              }),
              localized: true,
            },
            MetaImageField({
              hasGenerateFn: true,
              relationTo: 'media',
            }),
            {
              ...MetaDescriptionField({
                hasGenerateFn: true,
              }),
              localized: true,
            },
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: {
        en: 'Featured client',
        fa: 'نمایش در بخش مشتریان منتخب',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'برای نمایش در صفحه اصلی یا فهرست مشتریان منتخب در آینده.',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      label: {
        en: 'Display order',
        fa: 'ترتیب نمایش',
      },
      min: 0,
      validate: validateDisplayOrder,
      admin: {
        position: 'sidebar',
        description: 'عدد کوچک‌تر زودتر نمایش داده می‌شود. جایگزین drag-and-drop سطح Collection نیست.',
        step: 1,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: {
        en: 'Published at',
        fa: 'تاریخ انتشار',
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
    slugField({
      useAsSlug: 'name',
    }),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
