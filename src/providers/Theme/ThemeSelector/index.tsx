'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useState } from 'react'

import type { Theme } from './types'

import { useLocale } from '@/providers/Locale'
import { useTheme } from '..'
import { readStoredThemePreference } from '../shared'

export const ThemeSelector: React.FC = () => {
  const { dictionary } = useLocale()
  const { setTheme } = useTheme()
  const [value, setValue] = useState('')

  const onThemeChange = (themeToSet: Theme | 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
      setValue('auto')
    } else {
      setTheme(themeToSet)
      setValue(themeToSet)
    }
  }

  React.useEffect(() => {
    const preference = readStoredThemePreference()
    const timer = setTimeout(() => {
      setValue(preference ?? 'auto')
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Select onValueChange={onThemeChange} value={value}>
      <SelectTrigger
        aria-label={dictionary.theme.label}
        className="w-auto bg-transparent gap-2 pl-0 md:pl-3 border-none text-current"
      >
        <SelectValue placeholder={dictionary.theme.placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">{dictionary.theme.auto}</SelectItem>
        <SelectItem value="light">{dictionary.theme.light}</SelectItem>
        <SelectItem value="dark">{dictionary.theme.dark}</SelectItem>
      </SelectContent>
    </Select>
  )
}
