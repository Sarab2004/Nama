'use client'

import React, { createContext, use, useEffect, useMemo } from 'react'

import { getDictionary, type Dictionary } from '@/i18n/dictionaries'
import { defaultLocale, getDirection, type Locale } from '@/i18n/config'

type LocaleContextType = {
  dictionary: Dictionary
  direction: 'ltr' | 'rtl'
  locale: Locale
}

const LocaleContext = createContext<LocaleContextType>({
  dictionary: getDictionary(defaultLocale),
  direction: getDirection(defaultLocale),
  locale: defaultLocale,
})

export const LocaleProvider: React.FC<{
  children: React.ReactNode
  locale?: Locale
}> = ({ children, locale = defaultLocale }) => {
  const direction = getDirection(locale)
  const value = useMemo(
    () => ({
      dictionary: getDictionary(locale),
      direction,
      locale,
    }),
    [direction, locale],
  )

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = direction
  }, [direction, locale])

  return <LocaleContext value={value}>{children}</LocaleContext>
}

export const useLocale = () => use(LocaleContext)
