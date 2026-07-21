'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useLocale } from '@/providers/Locale'

export const Error = ({ name }: { name: string }) => {
  const { dictionary } = useLocale()
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <div className="mt-2 text-red-500 text-sm">
      {(errors[name]?.message as string) || dictionary.form.required}
    </div>
  )
}
