import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { defaultLexical } from '../../fields/defaultLexical'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateService, revalidateServiceDelete } from './hooks/revalidateService'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Services: CollectionConfig<'services'> = {
  slug: 'services',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  labels: {
    singular: {
      en: 'Service',
      fa: 'خدمت',
    },
    plural: {
      en: 'Services',
      fa: 'خدمات',
    },
  },
  defaultPopulate: {
    title: true,
    slug: true,
    shortDescription: true,
    featuredImage: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: {
      en: 'Content',
      fa: 'محتوا',
    },
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'services',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'services',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultSort: '-updatedAt',
  // Native collection `orderable` is deferred until a services listing exists and
  // an `_order` migration can be introduced deliberately. See docs/architecture/content-model.md.
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Service title',
        fa: 'عنوان خدمت',
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
            en: 'Main content',
            fa: 'محتوای اصلی',
          },
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              label: {
                en: 'Short description',
                fa: 'توضیح کوتاه',
              },
              localized: true,
              maxLength: 320,
              required: true,
              admin: {
                description: 'خلاصه‌ای کوتاه برای نمایش در کارت خدمات و نتایج جست‌وجو وارد کنید.',
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              label: {
                en: 'Service featured image',
                fa: 'تصویر اصلی خدمت',
              },
              relationTo: 'media',
              filterOptions: {
                mimeType: {
                  contains: 'image/',
                },
              },
              required: true,
            },
            {
              name: 'content',
              type: 'richText',
              label: {
                en: 'Service content',
                fa: 'توضیحات کامل خدمت',
              },
              localized: true,
              editor: defaultLexical,
              required: true,
            },
          ],
        },
        {
          label: {
            en: 'Service details',
            fa: 'جزئیات خدمت',
          },
          fields: [
            {
              name: 'benefits',
              type: 'array',
              label: {
                en: 'Benefits',
                fa: 'مزایای خدمت',
              },
              localized: true,
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: {
                    en: 'Benefit title',
                    fa: 'عنوان مزیت',
                  },
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: {
                    en: 'Description',
                    fa: 'توضیح',
                  },
                },
              ],
            },
            {
              name: 'processSteps',
              type: 'array',
              label: {
                en: 'Process steps',
                fa: 'مراحل اجرای خدمت',
              },
              localized: true,
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: {
                    en: 'Step title',
                    fa: 'عنوان مرحله',
                  },
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: {
                    en: 'Description',
                    fa: 'توضیح',
                  },
                },
              ],
            },
            {
              name: 'audiences',
              type: 'array',
              label: {
                en: 'Audiences',
                fa: 'مخاطبان خدمت',
              },
              localized: true,
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: {
                    en: 'Audience title',
                    fa: 'عنوان مخاطب',
                  },
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: {
                    en: 'Description',
                    fa: 'توضیح',
                  },
                },
              ],
            },
            {
              name: 'faqs',
              type: 'array',
              label: {
                en: 'Frequently asked questions',
                fa: 'سؤالات متداول',
              },
              localized: true,
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  label: {
                    en: 'Question',
                    fa: 'سؤال',
                  },
                  required: true,
                },
                {
                  name: 'answer',
                  type: 'richText',
                  label: {
                    en: 'Answer',
                    fa: 'پاسخ',
                  },
                  editor: defaultLexical,
                  required: true,
                },
              ],
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
    slugField(),
    {
      name: 'relatedProjects',
      type: 'join',
      label: {
        en: 'Related projects',
        fa: 'پروژه‌های مرتبط',
      },
      collection: 'projects',
      on: 'services',
      admin: {
        defaultColumns: ['title', 'client', 'executionYear', '_status', 'updatedAt'],
        description:
          'پروژه‌هایی که این خدمت را در فیلد services دارند (رابطه مجازی؛ داده روی Projects ذخیره می‌شود).',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateService],
    afterDelete: [revalidateServiceDelete],
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
