'use client'

import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'
import { useTranslation } from '@payloadcms/ui'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>{t('custom:welcome' as any)}</h4>
      </Banner>
      {t('custom:instructionsTitle' as any)}
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' ' + t('custom:instructionsSeed' as any) + ' '}
          <a href="/" target="_blank">
            {t('custom:visitWebsite' as any)}
          </a>
          {' ' + t('custom:instructionsResult' as any)}
        </li>
        <li>
          {t('custom:instructionsModify' as any) + ' '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('custom:instructionsCollections' as any)}
          </a>
          {' ' + t('custom:instructionsAddFields' as any) + ' '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('custom:instructionsFields' as any)}
          </a>
          {' ' + t('custom:instructionsAsNeeded' as any) + ' '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('custom:instructionsGettingStarted' as any)}
          </a>
          {' ' + t('custom:instructionsDocs' as any)}
        </li>
        <li>
          {t('custom:instructionsCommit' as any)}
        </li>
      </ul>
      {t('custom:proTip' as any) + ' '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
      >
        {t('custom:customComponent' as any)}
      </a>
      {t('custom:removeTip' as any)} <strong>payload.config</strong>.
    </div>
  )
}

export default BeforeDashboard
