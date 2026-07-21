import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: {
        en: 'Media',
        fa: 'رسانه (تصویر/ویدئو)',
      },
      relationTo: 'media',
      required: true,
    },
  ],
  labels: {
    plural: { en: 'Media Blocks', fa: 'بلوک‌های رسانه' },
    singular: { en: 'Media Block', fa: 'بلوک رسانه' },
  },
}
