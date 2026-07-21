import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { CompanyInformation } from './CompanyInformation/config'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { defaultLocale, locales } from './i18n/config'
import { en } from '@payloadcms/translations/languages/en'
import { fa } from '@payloadcms/translations/languages/fa'


const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseURL = process.env.DATABASE_URL

if (!databaseURL) {
  throw new Error('DATABASE_URL is required to start Payload. Set it in your environment before running the application.')
}

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
  }),
  collections: [Pages, Posts, Services, Media, Categories, Users],
  cors: [getServerSideURL()].filter(Boolean),
  localization: {
    defaultLocale,
    fallback: true,
    locales: [...locales],
  },
  i18n: {
    supportedLanguages: { en, fa },
    fallbackLanguage: 'fa',
    translations: {
      en: {
        custom: {
          welcome: 'Welcome to your dashboard!',
          loginMessage: 'This is where site admins will log in to manage your website.',
          seedDb: 'Seed your database',
          seeded: 'Database seeded!',
          visitWebsite: 'visit your website',
          instructionsTitle: "Here's what to do next:",
          instructionsSeed: 'with a few pages, posts, and projects to jump-start your new site, then',
          instructionsResult: 'to see the results.',
          instructionsModify: 'Modify your',
          instructionsCollections: 'collections',
          instructionsAddFields: 'and add more',
          instructionsFields: 'fields',
          instructionsAsNeeded: 'as needed. If you are new to Payload, we also recommend you check out the',
          instructionsGettingStarted: 'Getting Started',
          instructionsDocs: 'docs.',
          instructionsCommit: 'Commit and push your changes to the repository to trigger a redeployment of your project.',
          proTip: 'Pro Tip: This block is a',
          customComponent: 'custom component',
          removeTip: ', you can remove it at any time by updating your',
          alreadySeeded: 'Database already seeded.',
          seedingInProgress: 'Seeding already in progress.',
          refreshAndTry: 'An error occurred, please refresh and try again.',
          seeding: 'Seeding with data....',
          seedError: 'An error occurred while seeding.',
          seedingLabel: 'seeding...',
          doneLabel: 'done!',
        },
      },
      fa: {
        custom: {
          welcome: 'به داشبورد خود خوش آمدید!',
          loginMessage: 'اینجا جایی است که مدیران سایت برای مدیریت وب‌سایت وارد می‌شوند.',
          seedDb: 'راه‌اندازی پایگاه داده',
          seeded: 'پایگاه داده راه‌اندازی شد!',
          visitWebsite: 'مشاهده وب‌سایت',
          instructionsTitle: 'کارهای بعدی که باید انجام دهید:',
          instructionsSeed: 'همراه با چند صفحه، نوشته و پروژه برای شروع سریع‌تر سایت جدید، سپس از',
          instructionsResult: 'دیدن کنید تا نتایج را ببینید.',
          instructionsModify: 'تغییر دهید',
          instructionsCollections: 'مجموعه‌های',
          instructionsAddFields: 'خود را و فیلدهای',
          instructionsFields: 'بیشتری اضافه کنید. اگر با پی‌لود تازه‌کار هستید، پیشنهاد می‌کنیم مستندات',
          instructionsAsNeeded: 'شروع کار',
          instructionsGettingStarted: 'را مطالعه کنید.',
          instructionsDocs: '',
          instructionsCommit: 'تغییرات خود را ثبت و به مخزن ارسال کنید تا استقرار مجدد پروژه شما آغاز شود.',
          proTip: 'نکته حرفه‌ای: این بخش یک',
          customComponent: 'کامپوننت سفارشی',
          removeTip: 'است، هر زمان مایل باشید می‌توانید با ویرایش',
          alreadySeeded: 'پایگاه داده قبلاً راه‌اندازی شده است.',
          seedingInProgress: 'عملیات راه‌اندازی در حال انجام است.',
          refreshAndTry: 'خطایی رخ داد، لطفاً صفحه را بارگذاری مجدد کرده و دوباره تلاش کنید.',
          seeding: 'در حال راه‌اندازی پایگاه داده...',
          seedError: 'خطایی در حین راه‌اندازی رخ داد.',
          seedingLabel: 'در حال انجام...',
          doneLabel: 'انجام شد!',
        },
      },
    },
  },
  globals: [Header, Footer, CompanyInformation],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
