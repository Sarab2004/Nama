import type {
  Field,
  GlobalBeforeChangeHook,
  GlobalConfig,
  NumberFieldSingleValidation,
  TextFieldSingleValidation,
} from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { defaultLexical } from '@/fields/defaultLexical'

const TIME_HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/

const validateOptionalUrl: TextFieldSingleValidation = (value) => {
  if (value == null || value === '') return true

  try {
    // Absolute http(s) URLs only — suitable for maps and social profiles.
    const parsed = new URL(String(value))
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'آدرس باید با http یا https شروع شود.'
    }
    return true
  } catch {
    return 'یک نشانی اینترنتی معتبر وارد کنید.'
  }
}

const validateOptionalTime: TextFieldSingleValidation = (value, { siblingData }) => {
  if (siblingData && typeof siblingData === 'object' && 'isClosed' in siblingData && siblingData.isClosed) {
    return true
  }
  if (value == null || value === '') return true
  if (!TIME_HH_MM.test(String(value))) {
    return 'ساعت را به صورت HH:mm وارد کنید (مثلاً 08:00).'
  }
  return true
}

const ensureSinglePrimaryContact: GlobalBeforeChangeHook = ({ data }) => {
  if (!data) return data

  const next = { ...data }

  for (const key of ['phones', 'emails'] as const) {
    const rows = next[key]
    if (!Array.isArray(rows)) continue

    let primarySeen = false
    next[key] = rows.map((row) => {
      if (!row || typeof row !== 'object' || !('isPrimary' in row) || !row.isPrimary) {
        return row
      }
      if (primarySeen) {
        return { ...row, isPrimary: false }
      }
      primarySeen = true
      return row
    })
  }

  return next
}

const identityFields: Field[] = [
  {
    name: 'legalName',
    type: 'text',
    label: {
      en: 'Legal company name',
      fa: 'نام رسمی شرکت',
    },
    localized: true,
    required: true,
    maxLength: 160,
  },
  {
    name: 'shortName',
    type: 'text',
    label: {
      en: 'Short name / brand',
      fa: 'نام کوتاه یا برند',
    },
    localized: true,
    maxLength: 80,
    admin: {
      description: 'برای نمایش کوتاه در هدر، فوتر و عنوان‌ها. اگر خالی باشد، فرانت‌اند می‌تواند از نام رسمی استفاده کند.',
    },
  },
  {
    name: 'logo',
    type: 'upload',
    label: {
      en: 'Company logo',
      fa: 'لوگوی شرکت',
    },
    relationTo: 'media',
    filterOptions: {
      mimeType: {
        contains: 'image/',
      },
    },
    admin: {
      description:
        'منبع حقیقت لوگوی رسمی شرکت برای Organization و صفحات آینده. Header/Footer فعلاً لوگو را از CMS ذخیره نمی‌کنند.',
    },
  },
  {
    name: 'introduction',
    type: 'richText',
    label: {
      en: 'Company introduction',
      fa: 'معرفی شرکت',
    },
    localized: true,
    editor: defaultLexical,
  },
  {
    name: 'mission',
    type: 'textarea',
    label: {
      en: 'Mission',
      fa: 'مأموریت',
    },
    localized: true,
    maxLength: 1000,
  },
  {
    name: 'vision',
    type: 'textarea',
    label: {
      en: 'Vision',
      fa: 'چشم‌انداز',
    },
    localized: true,
    maxLength: 1000,
  },
  {
    name: 'values',
    type: 'array',
    label: {
      en: 'Organizational values',
      fa: 'ارزش‌های سازمانی',
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
          en: 'Value title',
          fa: 'عنوان ارزش',
        },
        required: true,
        maxLength: 120,
      },
      {
        name: 'description',
        type: 'textarea',
        label: {
          en: 'Description',
          fa: 'توضیح',
        },
        maxLength: 500,
      },
    ],
  },
]

const contactFields: Field[] = [
  {
    name: 'phones',
    type: 'array',
    label: {
      en: 'Phone numbers',
      fa: 'شماره‌های تماس',
    },
    admin: {
      initCollapsed: true,
      description: 'فقط یک ردیف می‌تواند «شماره اصلی» باشد؛ در صورت انتخاب چندتایی، فقط اولین مورد حفظ می‌شود.',
    },
    fields: [
      {
        name: 'label',
        type: 'text',
        label: {
          en: 'Label',
          fa: 'عنوان',
        },
        localized: true,
        maxLength: 80,
      },
      {
        name: 'number',
        type: 'text',
        label: {
          en: 'Phone number',
          fa: 'شماره تماس',
        },
        required: true,
        maxLength: 40,
      },
      {
        name: 'type',
        type: 'select',
        label: {
          en: 'Number type',
          fa: 'نوع شماره',
        },
        defaultValue: 'landline',
        options: [
          { label: { en: 'Landline', fa: 'تلفن ثابت' }, value: 'landline' },
          { label: { en: 'Mobile', fa: 'موبایل' }, value: 'mobile' },
          { label: { en: 'Fax', fa: 'فکس' }, value: 'fax' },
        ],
      },
      {
        name: 'isPrimary',
        type: 'checkbox',
        label: {
          en: 'Primary number',
          fa: 'شماره اصلی',
        },
        defaultValue: false,
      },
    ],
  },
  {
    name: 'emails',
    type: 'array',
    label: {
      en: 'Email addresses',
      fa: 'ایمیل‌ها',
    },
    admin: {
      initCollapsed: true,
      description: 'فقط یک ردیف می‌تواند «ایمیل اصلی» باشد؛ در صورت انتخاب چندتایی، فقط اولین مورد حفظ می‌شود.',
    },
    fields: [
      {
        name: 'label',
        type: 'text',
        label: {
          en: 'Label',
          fa: 'عنوان',
        },
        localized: true,
        maxLength: 80,
      },
      {
        name: 'address',
        type: 'email',
        label: {
          en: 'Email address',
          fa: 'آدرس ایمیل',
        },
        required: true,
      },
      {
        name: 'isPrimary',
        type: 'checkbox',
        label: {
          en: 'Primary email',
          fa: 'ایمیل اصلی',
        },
        defaultValue: false,
      },
    ],
  },
  {
    name: 'address',
    type: 'group',
    label: {
      en: 'Address',
      fa: 'نشانی',
    },
    fields: [
      {
        name: 'fullAddress',
        type: 'textarea',
        label: {
          en: 'Full address',
          fa: 'آدرس کامل',
        },
        localized: true,
        maxLength: 500,
      },
      {
        name: 'city',
        type: 'text',
        label: {
          en: 'City',
          fa: 'شهر',
        },
        localized: true,
        maxLength: 80,
      },
      {
        name: 'province',
        type: 'text',
        label: {
          en: 'Province',
          fa: 'استان',
        },
        localized: true,
        maxLength: 80,
      },
      {
        name: 'postalCode',
        type: 'text',
        label: {
          en: 'Postal code',
          fa: 'کد پستی',
        },
        maxLength: 20,
      },
    ],
  },
]

const hoursAndSocialFields: Field[] = [
  {
    name: 'workingHours',
    type: 'array',
    label: {
      en: 'Working hours',
      fa: 'ساعات کاری',
    },
    admin: {
      initCollapsed: true,
    },
    fields: [
      {
        name: 'label',
        type: 'text',
        label: {
          en: 'Days or range label',
          fa: 'روزها یا عنوان بازه',
        },
        localized: true,
        required: true,
        maxLength: 120,
      },
      {
        name: 'opensAt',
        type: 'text',
        label: {
          en: 'Opens at',
          fa: 'ساعت شروع',
        },
        admin: {
          description: 'قالب HH:mm، مثلاً 08:00',
          width: '50%',
        },
        validate: validateOptionalTime,
      },
      {
        name: 'closesAt',
        type: 'text',
        label: {
          en: 'Closes at',
          fa: 'ساعت پایان',
        },
        admin: {
          description: 'قالب HH:mm، مثلاً 17:00',
          width: '50%',
        },
        validate: validateOptionalTime,
      },
      {
        name: 'isClosed',
        type: 'checkbox',
        label: {
          en: 'Closed',
          fa: 'تعطیل',
        },
        defaultValue: false,
      },
    ],
  },
  {
    name: 'socialLinks',
    type: 'array',
    label: {
      en: 'Social networks',
      fa: 'شبکه‌های اجتماعی',
    },
    admin: {
      initCollapsed: true,
    },
    fields: [
      {
        name: 'platform',
        type: 'select',
        label: {
          en: 'Platform',
          fa: 'شبکه',
        },
        required: true,
        options: [
          { label: { en: 'LinkedIn', fa: 'لینکدین' }, value: 'linkedin' },
          { label: { en: 'Instagram', fa: 'اینستاگرام' }, value: 'instagram' },
          { label: { en: 'Telegram', fa: 'تلگرام' }, value: 'telegram' },
          { label: { en: 'YouTube', fa: 'یوتیوب' }, value: 'youtube' },
          { label: { en: 'Aparat', fa: 'آپارات' }, value: 'aparat' },
          { label: { en: 'X', fa: 'ایکس (توییتر)' }, value: 'x' },
          { label: { en: 'WhatsApp', fa: 'واتساپ' }, value: 'whatsapp' },
          { label: { en: 'Other', fa: 'سایر' }, value: 'other' },
        ],
      },
      {
        name: 'label',
        type: 'text',
        label: {
          en: 'Display label',
          fa: 'عنوان نمایشی',
        },
        localized: true,
        maxLength: 80,
        validate: ((value, { siblingData }) => {
          if (siblingData && typeof siblingData === 'object' && 'platform' in siblingData) {
            if (siblingData.platform === 'other' && (value == null || String(value).trim() === '')) {
              return 'برای گزینه «سایر»، عنوان نمایشی الزامی است.'
            }
          }
          return true
        }) as TextFieldSingleValidation,
      },
      {
        name: 'url',
        type: 'text',
        label: {
          en: 'URL',
          fa: 'نشانی',
        },
        required: true,
        validate: validateOptionalUrl,
      },
    ],
  },
]

const locationFields: Field[] = [
  {
    name: 'location',
    type: 'group',
    label: {
      en: 'Map location',
      fa: 'موقعیت مکانی',
    },
    fields: [
      {
        name: 'latitude',
        type: 'number',
        label: {
          en: 'Latitude',
          fa: 'عرض جغرافیایی',
        },
        min: -90,
        max: 90,
        admin: {
          step: 0.000001,
          width: '50%',
        },
        validate: ((value, { siblingData }) => {
          if (value !== undefined && value !== null) {
            if (typeof value !== 'number' || Number.isNaN(value) || value < -90 || value > 90) {
              return 'عرض جغرافیایی باید بین ۹۰- و ۹۰ باشد.'
            }
          }
          const hasLat = value !== undefined && value !== null
          const hasLng =
            siblingData &&
            typeof siblingData === 'object' &&
            'longitude' in siblingData &&
            siblingData.longitude !== undefined &&
            siblingData.longitude !== null

          if (hasLat && !hasLng) {
            return 'اگر عرض جغرافیایی وارد شود، طول جغرافیایی نیز لازم است.'
          }
          return true
        }) as NumberFieldSingleValidation,
      },
      {
        name: 'longitude',
        type: 'number',
        label: {
          en: 'Longitude',
          fa: 'طول جغرافیایی',
        },
        min: -180,
        max: 180,
        admin: {
          step: 0.000001,
          width: '50%',
        },
        validate: ((value, { siblingData }) => {
          if (value !== undefined && value !== null) {
            if (typeof value !== 'number' || Number.isNaN(value) || value < -180 || value > 180) {
              return 'طول جغرافیایی باید بین ۱۸۰- و ۱۸۰ باشد.'
            }
          }
          const hasLng = value !== undefined && value !== null
          const hasLat =
            siblingData &&
            typeof siblingData === 'object' &&
            'latitude' in siblingData &&
            siblingData.latitude !== undefined &&
            siblingData.latitude !== null

          if (hasLng && !hasLat) {
            return 'اگر طول جغرافیایی وارد شود، عرض جغرافیایی نیز لازم است.'
          }
          return true
        }) as NumberFieldSingleValidation,
      },
      {
        name: 'mapUrl',
        type: 'text',
        label: {
          en: 'Map link',
          fa: 'لینک نقشه',
        },
        validate: validateOptionalUrl,
        admin: {
          description: 'لینک عمومی نقشه (مثلاً Google Maps). HTML یا iframe ذخیره نکنید.',
        },
      },
    ],
  },
]

export const CompanyInformation: GlobalConfig = {
  slug: 'company-information',
  label: {
    en: 'Company Information',
    fa: 'اطلاعات شرکت',
  },
  access: {
    read: anyone,
    update: authenticated,
    readVersions: authenticated,
  },
  admin: {
    group: {
      en: 'Settings',
      fa: 'تنظیمات',
    },
    description: 'منبع حقیقت واحد اطلاعات رسمی شرکت برای صفحات، فوتر، تماس و داده ساخت‌یافته آینده.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Identity',
            fa: 'هویت و معرفی',
          },
          fields: identityFields,
        },
        {
          label: {
            en: 'Contact',
            fa: 'اطلاعات تماس',
          },
          fields: contactFields,
        },
        {
          label: {
            en: 'Hours & social',
            fa: 'ساعات کاری و شبکه‌های اجتماعی',
          },
          fields: hoursAndSocialFields,
        },
        {
          label: {
            en: 'Location',
            fa: 'موقعیت مکانی',
          },
          fields: locationFields,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [ensureSinglePrimaryContact],
  },
  versions: {
    max: 50,
  },
}
