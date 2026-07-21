'use client'

import React, { createContext, useCallback, use, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import {
  defaultTheme,
  getImplicitPreference,
  readStoredThemePreference,
  themeLocalStorageKey,
} from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      window.localStorage.setItem(themeLocalStorageKey, 'auto')
      const implicitPreference = getImplicitPreference()
      const resolved = implicitPreference || defaultTheme
      document.documentElement.setAttribute('data-theme', resolved)
      setThemeState(resolved)
    } else {
      setThemeState(themeToSet)
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
    }
  }, [])

  useEffect(() => {
    let themeToSet: Theme = defaultTheme
    const preference = readStoredThemePreference()

    if (themeIsValid(preference)) {
      themeToSet = preference
    } else {
      const implicitPreference = getImplicitPreference()
      if (implicitPreference) themeToSet = implicitPreference
    }

    document.documentElement.setAttribute('data-theme', themeToSet)
    const timer = setTimeout(() => {
      setThemeState(themeToSet)
    }, 0)

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      const stored = readStoredThemePreference()
      if (stored === 'auto' || !stored) {
        const next = getImplicitPreference() || defaultTheme
        document.documentElement.setAttribute('data-theme', next)
        setThemeState(next)
      }
    }
    media.addEventListener('change', onSystemChange)

    return () => {
      clearTimeout(timer)
      media.removeEventListener('change', onSystemChange)
    }
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
