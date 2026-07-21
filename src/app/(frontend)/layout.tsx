import type { Metadata } from 'next'

import { GeistMono } from 'geist/font/mono'
import React from 'react'

import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { defaultLocale, getDirection } from '@/i18n/config'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className={GeistMono.variable}
      dir={getDirection(defaultLocale)}
      lang={defaultLocale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
