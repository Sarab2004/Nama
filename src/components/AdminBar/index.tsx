'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'

import { cn } from '@/utilities/ui'
import { useSelectedLayoutSegments } from 'next/navigation'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

import { getClientSideURL } from '@/utilities/getURL'

import { useLocale } from '@/providers/Locale'

const baseClass = 'admin-bar'

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const { locale, dictionary } = useLocale()
  const [show, setShow] = useState(false)
  const collection =
    segments?.[0] === 'posts' ? 'posts' : segments?.[0] === 'services' ? 'services' : 'pages'
  const router = useRouter()

  const collectionLabels =
    collection === 'posts'
      ? { plural: dictionary.admin.posts, singular: dictionary.admin.post }
      : collection === 'services'
        ? { plural: dictionary.admin.services, singular: dictionary.admin.service }
        : { plural: dictionary.admin.pages, singular: dictionary.admin.page }

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(baseClass, 'py-2 bg-[var(--footer-bg)] text-[var(--footer-text)]', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-[var(--footer-heading)]"
          classNames={{
            controls: 'font-medium text-[var(--footer-heading)]',
            logo: 'text-[var(--footer-heading)]',
            user: 'text-[var(--footer-text)]',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={collectionLabels}
          logo={<span>{dictionary.admin.dashboard}</span>}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push(`/${locale}`)
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
