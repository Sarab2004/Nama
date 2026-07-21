import type { Theme } from './types'

/** Primary persistence key for Nama theme preference. */
export const themeLocalStorageKey = 'nama-theme'

/** Legacy key from the Payload website template — still read for migration. */
export const legacyThemeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}

export const readStoredThemePreference = (): string | null => {
  const current = window.localStorage.getItem(themeLocalStorageKey)
  if (current) return current

  const legacy = window.localStorage.getItem(legacyThemeLocalStorageKey)
  if (legacy) {
    window.localStorage.setItem(themeLocalStorageKey, legacy)
    return legacy
  }

  return null
}
