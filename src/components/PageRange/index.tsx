import React from 'react'
import { getDictionary } from '@/i18n/dictionaries'
import { defaultLocale, type Locale } from '@/i18n/config'

const defaultLabels = {
  plural: 'Docs',
  singular: 'Doc',
}

const defaultCollectionLabels = {
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
}

export const PageRange: React.FC<{
  className?: string
  collection?: keyof typeof defaultCollectionLabels
  collectionLabels?: {
    plural?: string
    singular?: string
  }
  currentPage?: number
  locale?: Locale
  limit?: number
  totalDocs?: number
}> = (props) => {
  const {
    className,
    collection,
    collectionLabels: collectionLabelsFromProps,
    currentPage,
    locale = defaultLocale,
    limit,
    totalDocs,
  } = props
  const dictionary = getDictionary(locale)

  let indexStart = (currentPage ? currentPage - 1 : 1) * (limit || 1) + 1
  if (totalDocs && indexStart > totalDocs) indexStart = 0

  let indexEnd = (currentPage || 1) * (limit || 1)
  if (totalDocs && indexEnd > totalDocs) indexEnd = totalDocs

  const { plural, singular } =
    collectionLabelsFromProps ||
    (collection ? defaultCollectionLabels[collection] : undefined) ||
    defaultLabels ||
    {}

  return (
    <div className={[className, 'font-semibold'].filter(Boolean).join(' ')}>
      {(typeof totalDocs === 'undefined' || totalDocs === 0) && dictionary.search.producedNoResults}
      {typeof totalDocs !== 'undefined' &&
        totalDocs > 0 &&
        `${dictionary.range.showing} ${indexStart}${indexStart > 0 ? ` - ${indexEnd}` : ''} ${
          dictionary.range.of
        } ${totalDocs} ${
          totalDocs > 1 ? plural : singular
        }`}
    </div>
  )
}
