export const locales = ['fa', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fa'
export const fallbackLocale: Locale = 'en'

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  fa: 'فارسی',
}

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  fa: 'rtl',
}

export const isLocale = (value: string | undefined): value is Locale =>
  Boolean(value && locales.includes(value as Locale))

export const getDirection = (locale: Locale) => localeDirections[locale]

export const stripLocaleFromPath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)

  if (isLocale(segments[0])) {
    return `/${segments.slice(1).join('/')}` || '/'
  }

  return pathname || '/'
}

export const localizePath = (pathname: string, locale: Locale) => {
  const pathWithoutLocale = stripLocaleFromPath(pathname)

  if (pathWithoutLocale === '/') return `/${locale}`

  return `/${locale}${pathWithoutLocale}`
}
