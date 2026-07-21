'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { localeLabels, locales, localizePath, type Locale } from '@/i18n/config'
import { useLocale } from '.'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'

const LanguageSelectorInner: React.FC = () => {
  const { dictionary, locale } = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const onLocaleChange = (localeToSet: Locale) => {
    const nextPath = localizePath(pathname, localeToSet)
    const queryString = searchParams.toString()
    router.push(queryString ? `${nextPath}?${queryString}` : nextPath)
  }

  return (
    <Select onValueChange={onLocaleChange} value={locale}>
      <SelectTrigger
        aria-label={dictionary.language.label}
        className="w-auto bg-transparent gap-2 pl-0 md:pl-3 border-none"
      >
        <SelectValue placeholder={dictionary.language.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {locales.map((localeOption) => (
          <SelectItem key={localeOption} value={localeOption}>
            {localeLabels[localeOption]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const LanguageSelector: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <LanguageSelectorInner />
    </Suspense>
  )
}

