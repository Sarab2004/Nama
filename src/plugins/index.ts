import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateDescription, GenerateImage, GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post, Service } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

type SEOContentDocument = Post | Page | Service

const generateTitle: GenerateTitle<SEOContentDocument> = ({ doc }) => {
  return doc?.title ? `${doc.title} | قالب وب‌سایت صنعتی` : 'قالب وب‌سایت صنعتی'
}

const generateDescription: GenerateDescription<SEOContentDocument> = ({ doc }) => {
  return 'shortDescription' in doc ? doc.shortDescription || '' : ''
}

const generateImage: GenerateImage<SEOContentDocument> = ({ doc }) => {
  return 'featuredImage' in doc ? doc.featuredImage || '' : ''
}

const generateURL: GenerateURL<SEOContentDocument> = ({ doc, collectionSlug }) => {
  const url = getServerSideURL()

  if (collectionSlug === 'services') {
    return doc?.slug ? `${url}/services/${doc.slug}` : `${url}/services`
  }

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const localizableNames = [
  'submitButtonLabel',
  'confirmationMessage',
  'subject',
  'message',
  'label',
  'placeholder',
  'defaultValue',
  'requiredMessage',
  'errorMessage',
]

const localizeField = (field: any): any => {
  if (!field) return field

  const updatedField = { ...field }

  if ('name' in updatedField && localizableNames.includes(updatedField.name)) {
    updatedField.localized = true
  }

  if (updatedField.type === 'array' && Array.isArray(updatedField.fields)) {
    updatedField.fields = updatedField.fields.map(localizeField)
  }

  if (updatedField.type === 'group' && Array.isArray(updatedField.fields)) {
    updatedField.fields = updatedField.fields.map(localizeField)
  }

  if (updatedField.type === 'blocks' && Array.isArray(updatedField.blocks)) {
    updatedField.blocks = updatedField.blocks.map((block: any) => ({
      ...block,
      fields: Array.isArray(block.fields) ? block.fields.map(localizeField) : block.fields,
    }))
  }

  return updatedField
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts', 'services'],
    overrides: {
      labels: {
        singular: { en: 'Redirect', fa: 'ریدایرکت' },
        plural: { en: 'Redirects', fa: 'ریدایرکت‌ها' },
      },
      admin: {
        group: {
          en: 'Settings',
          fa: 'تنظیمات',
        },
      },
      // @ts-expect-error - mapped field types don't resolve exactly
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              label: {
                en: 'From (old path)',
                fa: 'از (مسیر قدیمی)',
              },
              admin: {
                description: 'پس از تغییر این فیلد، نیاز به بازسازی وب‌سایت دارید.',
              },
            }
          }
          if ('name' in field && field.name === 'to') {
            return {
              ...field,
              label: {
                en: 'To (destination)',
                fa: 'به (مقصد)',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateDescription,
    generateImage,
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      labels: {
        singular: { en: 'Form', fa: 'فرم' },
        plural: { en: 'Forms', fa: 'فرم‌ها' },
      },
      admin: {
        group: {
          en: 'Content',
          fa: 'محتوا',
        },
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          const localized = localizeField(field)
          if ('name' in localized && localized.name === 'title') {
            return {
              ...localized,
              label: {
                en: 'Title',
                fa: 'عنوان فرم',
              },
            }
          }
          if ('name' in localized && localized.name === 'fields') {
            return {
              ...localized,
              label: {
                en: 'Fields',
                fa: 'فیلدهای فرم',
              },
            }
          }
          if ('name' in localized && localized.name === 'submitButtonLabel') {
            return {
              ...localized,
              label: {
                en: 'Submit Button Label',
                fa: 'متن دکمه ارسال',
              },
            }
          }
          if ('name' in localized && localized.name === 'confirmationType') {
            return {
              ...localized,
              label: {
                en: 'Confirmation Type',
                fa: 'نوع تأییدیه',
              },
              options: [
                { label: { en: 'Message', fa: 'پیام' }, value: 'message' },
                { label: { en: 'Redirect', fa: 'ریدایرکت' }, value: 'redirect' },
              ],
            }
          }
          if ('name' in localized && localized.name === 'confirmationMessage') {
            return {
              ...localized,
              label: {
                en: 'Confirmation Message',
                fa: 'پیام تأییدیه',
              },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          if ('name' in localized && localized.name === 'redirect') {
            return {
              ...localized,
              label: {
                en: 'Redirect URL',
                fa: 'آدرس ریدایرکت',
              },
            }
          }
          if ('name' in localized && localized.name === 'emails') {
            return {
              ...localized,
              label: {
                en: 'Emails',
                fa: 'ایمیل‌ها',
              },
            }
          }
          return localized
        })
      },
    },
    formSubmissionOverrides: {
      labels: {
        singular: { en: 'Form Submission', fa: 'ارسال فرم' },
        plural: { en: 'Form Submissions', fa: 'ارسال‌های فرم' },
      },
      admin: {
        group: {
          en: 'Content',
          fa: 'محتوا',
        },
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'services'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      labels: {
        singular: { en: 'Search Result', fa: 'نتیجه جستجو' },
        plural: { en: 'Search Results', fa: 'نتایج جستجو' },
      },
      admin: {
        group: {
          en: 'Settings',
          fa: 'تنظیمات',
        },
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
