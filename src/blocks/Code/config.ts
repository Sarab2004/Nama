import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'typescript',
      label: {
        en: 'Language',
        fa: 'زبان برنامه‌نویسی',
      },
      options: [
        {
          label: 'Typescript',
          value: 'typescript',
        },
        {
          label: 'Javascript',
          value: 'javascript',
        },
        {
          label: 'CSS',
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      localized: true,
      required: true,
    },
  ],
  labels: {
    plural: { en: 'Code Blocks', fa: 'بلوک‌های کد' },
    singular: { en: 'Code Block', fa: 'بلوک کد' },
  },
}
