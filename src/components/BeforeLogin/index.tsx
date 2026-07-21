'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'

const BeforeLogin: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div>
      <p>
        <b>{t('custom:welcome' as any)}</b>
        {' ' + t('custom:loginMessage' as any)}
      </p>
    </div>
  )
}

export default BeforeLogin
