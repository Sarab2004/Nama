import { HeaderClient } from './Component.client'
import type { Locale } from '@/i18n/config'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

export async function Header({ locale }: { locale?: Locale }) {
  const headerData = await getCachedGlobal('header', 1, locale)()

  return <HeaderClient data={headerData} />
}
