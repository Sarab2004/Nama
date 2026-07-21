'use client'
import { Button } from '@/components/ui/button'
import { CopyIcon } from '@payloadcms/ui/icons/Copy'
import { useLocale } from '@/providers/Locale'
import { useState } from 'react'

export function CopyButton({ code }: { code: string }) {
  const { dictionary } = useLocale()
  const [copied, setCopied] = useState(false)

  function updateCopyStatus() {
    if (!copied) {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    }
  }

  return (
    <div className="flex justify-end align-middle">
      <Button
        className="flex gap-1"
        variant={'secondary'}
        onClick={async () => {
          await navigator.clipboard.writeText(code)
          updateCopyStatus()
        }}
      >
        <p>{copied ? dictionary.common.copied : dictionary.common.copy}</p>
        <CopyIcon />
      </Button>
    </div>
  )
}
