import type { Locale } from './config'

export const dictionaries = {
  en: {
  "admin": {
    "dashboard": "Dashboard",
    "page": "Page",
    "pages": "Pages",
    "post": "Post",
    "posts": "Posts",
    "project": "Project",
    "projects": "Projects",
    "service": "Service",
    "services": "Services"
  },
  "common": {
    "copied": "Copied!",
    "copy": "Copy",
    "loading": "Loading, please wait...",
    "noImage": "No image",
    "submit": "submit"
  },
  "errors": {
    "internalServerError": "Internal Server Error",
    "somethingWentWrong": "Something went wrong."
  },
  "form": {
    "required": "This field is required"
  },
  "language": {
    "label": "Select a language",
    "placeholder": "Language"
  },
  "logo": {
    "alt": "Payload Logo"
  },
  "pagination": {
    "next": "Next",
    "previous": "Previous"
  },
  "postHero": {
    "author": "Author",
    "datePublished": "Date Published",
    "untitledCategory": "Untitled category"
  },
  "posts": {
    "title": "Posts"
  },
  "services": {
    "audiences": "Who this service is for",
    "benefits": "Benefits",
    "ctaDescription": "Share your project needs and our team will follow up through the contact form.",
    "ctaLabel": "Request consultation",
    "ctaTitle": "Need a consultation?",
    "empty": "No published services are available yet.",
    "faqs": "Frequently asked questions",
    "home": "Home",
    "intro": "Explore the services we provide for industrial and engineering projects.",
    "metaDescription": "Browse published industrial services, process details, audiences, and FAQs.",
    "processSteps": "How we deliver",
    "step": "Step",
    "title": "Services",
    "viewDetails": "View details"
  },
  "range": {
    "doc": "Doc",
    "docs": "Docs",
    "of": "of",
    "showing": "Showing"
  },
  "search": {
    "noResults": "No results found.",
    "placeholder": "Search",
    "producedNoResults": "Search produced no results.",
    "title": "Search"
  },
  "theme": {
    "auto": "Auto",
    "dark": "Dark",
    "label": "Select a theme",
    "light": "Light",
    "placeholder": "Theme"
  }
},
  fa: {
  "admin": {
    "dashboard": "داشبورد",
    "page": "صفحه",
    "pages": "صفحه‌ها",
    "post": "نوشته",
    "posts": "نوشته‌ها",
    "project": "پروژه",
    "projects": "پروژه‌ها",
    "service": "خدمت",
    "services": "خدمات"
  },
  "common": {
    "copied": "کپی شد!",
    "copy": "کپی",
    "loading": "در حال بارگذاری، لطفا صبر کنید...",
    "noImage": "بدون تصویر",
    "submit": "ارسال"
  },
  "errors": {
    "internalServerError": "خطای داخلی سرور",
    "somethingWentWrong": "مشکلی پیش آمد."
  },
  "form": {
    "required": "پر کردن این فیلد الزامی است"
  },
  "language": {
    "label": "انتخاب زبان",
    "placeholder": "زبان"
  },
  "logo": {
    "alt": "لوگوی Payload"
  },
  "pagination": {
    "next": "بعدی",
    "previous": "قبلی"
  },
  "postHero": {
    "author": "نویسنده",
    "datePublished": "تاریخ انتشار",
    "untitledCategory": "دسته‌بندی بدون عنوان"
  },
  "posts": {
    "title": "نوشته‌ها"
  },
  "services": {
    "audiences": "مخاطبان این خدمت",
    "benefits": "مزایا",
    "ctaDescription": "نیاز پروژه خود را از طریق صفحه تماس ارسال کنید تا تیم ما پیگیری کند.",
    "ctaLabel": "درخواست مشاوره",
    "ctaTitle": "به مشاوره نیاز دارید؟",
    "empty": "در حال حاضر خدمت منتشرشده‌ای برای نمایش وجود ندارد.",
    "faqs": "سؤالات متداول",
    "home": "خانه",
    "intro": "خدمات صنعتی و مهندسی ما را مشاهده کنید.",
    "metaDescription": "فهرست خدمات منتشرشده، جزئیات اجرا، مخاطبان و سؤالات متداول.",
    "processSteps": "مراحل اجرا",
    "step": "مرحله",
    "title": "خدمات",
    "viewDetails": "مشاهده جزئیات"
  },
  "range": {
    "doc": "مورد",
    "docs": "مورد",
    "of": "از",
    "showing": "نمایش"
  },
  "search": {
    "noResults": "نتیجه‌ای پیدا نشد.",
    "placeholder": "جستجو",
    "producedNoResults": "جستجو نتیجه‌ای نداشت.",
    "title": "جستجو"
  },
  "theme": {
    "auto": "خودکار",
    "dark": "تیره",
    "label": "انتخاب پوسته",
    "light": "روشن",
    "placeholder": "پوسته"
  }
},
} as const

export type Dictionary = (typeof dictionaries)[Locale]

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale]
