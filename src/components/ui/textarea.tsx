import { cn } from '@/utilities/ui'
import * as React from 'react'

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className,
  ...props
}) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-24 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3.5 py-2 text-base text-[var(--input-text)] shadow-xs transition-[color,box-shadow,border-color,background-color] duration-[var(--duration-normal)] ease-[var(--ease-standard)] placeholder:text-[var(--input-placeholder)] hover:border-[var(--input-border-hover)] focus-visible:border-[var(--input-border-focus)] focus-visible:outline-none focus-visible:shadow-[0_0_0_var(--focus-width)_var(--input-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
