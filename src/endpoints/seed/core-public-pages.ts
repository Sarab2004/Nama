import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

type CorePage = 'about' | 'contact'

export const corePublicPageData: Record<
  CorePage,
  Record<'en' | 'fa', RequiredDataFromCollectionSlug<'pages'>>
> = {
  about: {
    en: {
      slug: 'about',
      _status: 'published',
      title: 'About Us',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'companyAbout',
          showLogo: true,
          showIntroduction: true,
          showMission: true,
          showVision: true,
          showValues: true,
        },
      ],
      meta: {
        title: 'About Us',
        description: 'Learn about our company.',
      },
    },
    fa: {
      slug: 'about',
      _status: 'published',
      title: 'درباره ما',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'companyAbout',
          showLogo: true,
          showIntroduction: true,
          showMission: true,
          showVision: true,
          showValues: true,
        },
      ],
      meta: {
        title: 'درباره ما',
        description: 'اطلاعاتی درباره شرکت.',
      },
    },
  },
  contact: {
    en: {
      slug: 'contact',
      _status: 'published',
      title: 'Contact Us',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'companyContact',
          showPhones: true,
          showEmails: true,
          showAddress: true,
          showWorkingHours: true,
          showSocial: true,
          showMapLink: true,
        },
        {
          blockType: 'consultationRequest',
          allowServiceSelection: true,
          showCompanyField: true,
          showJobTitleField: true,
          inquiryType: 'general',
          appearance: 'full',
        },
      ],
      meta: {
        title: 'Contact Us',
        description: 'Get in touch with our team.',
      },
    },
    fa: {
      slug: 'contact',
      _status: 'published',
      title: 'تماس با ما',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'companyContact',
          showPhones: true,
          showEmails: true,
          showAddress: true,
          showWorkingHours: true,
          showSocial: true,
          showMapLink: true,
        },
        {
          blockType: 'consultationRequest',
          allowServiceSelection: true,
          showCompanyField: true,
          showJobTitleField: true,
          inquiryType: 'general',
          appearance: 'full',
        },
      ],
      meta: {
        title: 'تماس با ما',
        description: 'برای ارتباط با تیم ما اقدام کنید.',
      },
    },
  },
}

const navigationLabels = {
  en: {
    home: 'Home', services: 'Services', projects: 'Projects', clients: 'Clients', about: 'About', contact: 'Contact',
  },
  fa: {
    home: 'خانه', services: 'خدمات', projects: 'پروژه‌ها', clients: 'مشتریان', about: 'درباره ما', contact: 'تماس با ما',
  },
} as const

/**
 * Creates only the missing core public pages. Existing pages and non-empty
 * navigation are intentionally left untouched so it is safe on managed data.
 */
export const seedCorePublicPages = async ({ payload, req }: { payload: Payload; req: PayloadRequest }) => {
  const pages = {} as Record<CorePage, number>

  for (const slug of ['about', 'contact'] as const) {
    const found = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1,
      locale: 'en',
      pagination: false,
      req,
      where: { slug: { equals: slug } },
    })

    if (found.docs[0]) {
      pages[slug] = found.docs[0].id
      continue
    }

    const created = await payload.create({
      collection: 'pages',
      data: corePublicPageData[slug].en,
      locale: 'en',
      req,
    })
    pages[slug] = created.id

    await payload.update({
      collection: 'pages',
      id: created.id,
      data: corePublicPageData[slug].fa,
      locale: 'fa',
      req,
    })
  }

  for (const locale of ['en', 'fa'] as const) {
    const global = await payload.findGlobal({ slug: 'header', locale, req })
    if ((global.navItems || []).length === 0) {
      const labels = navigationLabels[locale]
      await payload.updateGlobal({
        slug: 'header',
        locale,
        req,
        data: {
          navItems: [
            { link: { type: 'custom', label: labels.home, url: '/' } },
            { link: { type: 'custom', label: labels.services, url: '/services' } },
            { link: { type: 'custom', label: labels.projects, url: '/projects' } },
            { link: { type: 'custom', label: labels.clients, url: '/clients' } },
            { link: { type: 'reference', label: labels.about, reference: { relationTo: 'pages', value: pages.about } } },
            { link: { type: 'reference', label: labels.contact, reference: { relationTo: 'pages', value: pages.contact } } },
          ],
        },
      })
    }

    const footer = await payload.findGlobal({ slug: 'footer', locale, req })
    if ((footer.navItems || []).length === 0) {
      const labels = navigationLabels[locale]
      await payload.updateGlobal({
        slug: 'footer',
        locale,
        req,
        data: {
          navItems: [
            { link: { type: 'custom', label: labels.services, url: '/services' } },
            { link: { type: 'custom', label: labels.projects, url: '/projects' } },
            { link: { type: 'custom', label: labels.clients, url: '/clients' } },
            { link: { type: 'reference', label: labels.about, reference: { relationTo: 'pages', value: pages.about } } },
            { link: { type: 'reference', label: labels.contact, reference: { relationTo: 'pages', value: pages.contact } } },
          ],
        },
      })
    }
  }
}
