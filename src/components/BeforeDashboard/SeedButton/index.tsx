'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { toast, useTranslation } from '@payloadcms/ui'

import './index.scss'

const SuccessMessage: React.FC = () => {
  const { t } = useTranslation()
  return (
    <div>
      {t('custom:seeded' as any)}{' '}
      <a target="_blank" href="/">
        {t('custom:visitWebsite' as any)}
      </a>
    </div>
  )
}

export const SeedButton: React.FC = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (seeded) {
        toast.info(t('custom:alreadySeeded' as any) || 'پایگاه داده قبلاً راه‌اندازی شده است.')
        return
      }
      if (loading) {
        toast.info(t('custom:seedingInProgress' as any) || 'راه‌اندازی در حال انجام است.')
        return
      }
      if (error) {
        toast.error(t('custom:refreshAndTry' as any) || 'خطایی رخ داد؛ صفحه را تازه‌سازی کنید و دوباره تلاش کنید.')
        return
      }

      setLoading(true)

      try {
        toast.promise(
          new Promise((resolve, reject) => {
            try {
              fetch('/next/seed', { method: 'POST', credentials: 'include' })
                .then((res) => {
                  if (res.ok) {
                    resolve(true)
                    setSeeded(true)
                  } else {
                    reject(t('custom:seedError' as any) || 'خطایی در حین راه‌اندازی رخ داد.')
                  }
                })
                .catch((error) => {
                  reject(error)
                })
            } catch (error) {
              reject(error)
            }
          }),
          {
            loading: t('custom:seeding' as any) || 'در حال راه‌اندازی داده‌ها...',
            success: <SuccessMessage />,
            error: t('custom:seedError' as any) || 'خطایی در حین راه‌اندازی رخ داد.',
          },
        )
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        setError(error)
      }
    },
    [loading, seeded, error, t],
  )

  let message = ''
  if (loading) message = ` (${t('custom:seedingLabel' as any) || 'در حال راه‌اندازی...'})`
  if (seeded) message = ` (${t('custom:doneLabel' as any) || 'انجام شد!'})`
  if (error) message = ` (خطا: ${error})`

  return (
    <Fragment>
      <button className="seedButton" onClick={handleClick}>
        {t('custom:seedDb' as any)}
      </button>
      {message}
    </Fragment>
  )
}
