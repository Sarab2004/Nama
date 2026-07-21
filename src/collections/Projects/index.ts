import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { defaultLexical } from '../../fields/defaultLexical'
import { validateDisplayOrder } from '../../fields/validateDisplayOrder'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateProject, revalidateProjectDelete } from './hooks/revalidateProject'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    readVersions: authenticated,
    update: authenticated,
  },
  labels: {
    singular: {
      en: 'Project',
      fa: 'پروژه',
    },
    plural: {
      en: 'Projects',
      fa: 'پروژه‌ها',
    },
  },
  defaultPopulate: {
    title: true,
    slug: true,
    shortDescription: true,
    client: true,
    services: true,
    executionYear: true,
    location: true,
    featuredImage: true,
    featured: true,
    displayOrder: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'client', 'executionYear', '_status', 'updatedAt'],
    group: {
      en: 'Content',
      fa: 'محتوا',
    },
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'projects',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'projects',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: {
        en: 'Project title',
        fa: 'عنوان پروژه',
      },
      localized: true,
      maxLength: 160,
      required: true,
    },
    // Keep join targets at top-level so Client/Service joins resolve reliably during sanitize.
    {
      name: 'client',
      type: 'relationship',
      label: {
        en: 'Client',
        fa: 'کارفرما',
      },
      relationTo: 'clients',
      required: true,
      admin: {
        description:
          'کارفرما از Clients انتخاب شود. نام کارفرما را در این Collection تکرار نکنید.',
      },
    },
    {
      name: 'services',
      type: 'relationship',
      label: {
        en: 'Related services',
        fa: 'خدمات مرتبط',
      },
      relationTo: 'services',
      hasMany: true,
      required: true,
      admin: {
        description:
          'یک یا چند خدمت از Services. فیلد جداگانه serviceType نسازید؛ نوع خدمت از همین رابطه مشخص می‌شود.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Overview',
            fa: 'کلیات',
          },
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              label: {
                en: 'Short description',
                fa: 'خلاصه پروژه',
              },
              localized: true,
              maxLength: 320,
              admin: {
                description: 'خلاصه کوتاه برای کارت پروژه و SEO در آینده.',
              },
            },
            {
              name: 'executionYear',
              type: 'text',
              label: {
                en: 'Execution year',
                fa: 'سال اجرا',
              },
              localized: true,
              required: true,
              maxLength: 20,
              admin: {
                description: 'سال یا بازه؛ مثلاً ۱۴۰۲، ۱۴۰۲ تا ۱۴۰۳، 2023 یا 2023–2024.',
              },
            },
            {
              name: 'location',
              type: 'text',
              label: {
                en: 'Location',
                fa: 'محل اجرا',
              },
              localized: true,
              maxLength: 160,
            },
            {
              name: 'featuredImage',
              type: 'upload',
              label: {
                en: 'Featured image',
                fa: 'تصویر اصلی پروژه',
              },
              relationTo: 'media',
              filterOptions: {
                mimeType: {
                  contains: 'image/',
                },
              },
            },
          ],
        },
        {
          label: {
            en: 'Narrative',
            fa: 'شرح پروژه',
          },
          fields: [
            {
              name: 'problem',
              type: 'richText',
              label: {
                en: 'Problem',
                fa: 'شرح مسئله',
              },
              localized: true,
              editor: defaultLexical,
            },
            {
              name: 'solution',
              type: 'richText',
              label: {
                en: 'Solution',
                fa: 'راهکار',
              },
              localized: true,
              editor: defaultLexical,
            },
            {
              name: 'results',
              type: 'richText',
              label: {
                en: 'Results',
                fa: 'نتایج',
              },
              localized: true,
              editor: defaultLexical,
              admin: {
                description: 'متن، فهرست و اعداد نتایج را اینجا ثبت کنید؛ در این مرحله KPI جداگانه نداریم.',
              },
            },
          ],
        },
        {
          label: {
            en: 'Gallery',
            fa: 'تصاویر پروژه',
          },
          fields: [
            {
              name: 'gallery',
              type: 'array',
              label: {
                en: 'Project gallery',
                fa: 'تصاویر پروژه',
              },
              admin: {
                initCollapsed: true,
                description: 'ترتیب ردیف‌ها همان ترتیب نمایش آینده است.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  label: {
                    en: 'Image',
                    fa: 'تصویر',
                  },
                  relationTo: 'media',
                  required: true,
                  filterOptions: {
                    mimeType: {
                      contains: 'image/',
                    },
                  },
                },
                {
                  name: 'caption',
                  type: 'textarea',
                  label: {
                    en: 'Caption',
                    fa: 'توضیح تصویر',
                  },
                  localized: true,
                  maxLength: 320,
                },
              ],
            },
          ],
        },
        {
          label: {
            en: 'Testimonial',
            fa: 'رضایت‌نامه',
          },
          fields: [
            {
              name: 'testimonial',
              type: 'group',
              label: {
                en: 'Client testimonial',
                fa: 'رضایت‌نامه کارفرما',
              },
              admin: {
                description:
                  'در فرانت‌اند آینده فقط در صورت فعال بودن «اجازه انتشار عمومی» نمایش داده شود. اطلاعات تماس شخص را ذخیره نکنید.',
              },
              fields: [
                {
                  name: 'quote',
                  type: 'textarea',
                  label: {
                    en: 'Quote',
                    fa: 'متن رضایت‌نامه',
                  },
                  localized: true,
                  maxLength: 2000,
                },
                {
                  name: 'authorName',
                  type: 'text',
                  label: {
                    en: 'Author name',
                    fa: 'نام تأییدکننده',
                  },
                  localized: true,
                  maxLength: 120,
                },
                {
                  name: 'authorRole',
                  type: 'text',
                  label: {
                    en: 'Author role',
                    fa: 'سمت تأییدکننده',
                  },
                  localized: true,
                  maxLength: 160,
                },
                {
                  name: 'document',
                  type: 'upload',
                  label: {
                    en: 'Supporting document',
                    fa: 'فایل رضایت‌نامه',
                  },
                  relationTo: 'media',
                  admin: {
                    description: 'تصویر یا PDF رضایت‌نامه (اختیاری).',
                  },
                },
                {
                  name: 'permissionToPublish',
                  type: 'checkbox',
                  label: {
                    en: 'Permission to publish publicly',
                    fa: 'اجازه انتشار عمومی',
                  },
                  defaultValue: false,
                  admin: {
                    description:
                      'بدون این گزینه، رضایت‌نامه در صفحات عمومی آینده نمایش داده نشود.',
                  },
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
      name: 'featured',
      type: 'checkbox',
      label: {
        en: 'Featured project',
        fa: 'پروژه منتخب',
      },
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'برای نمایش در صفحه اصلی یا فهرست پروژه‌های منتخب در آینده.',
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
        description: 'عدد کوچک‌تر زودتر نمایش داده می‌شود.',
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
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateProject],
    afterDelete: [revalidateProjectDelete],
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
