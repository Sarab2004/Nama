import { cn } from '@/utilities/ui'
import * as React from 'react'

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  type,
  ...props
}) => {
  return (
    <input
      data-slot="input"
      className={cn(
        'flex h-12 w-full min-w-0 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-3.5 py-2 text-base text-[var(--input-text)] shadow-xs transition-[color,box-shadow,border-color,background-color] duration-[var(--duration-normal)] ease-[var(--ease-standard)] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--input-placeholder)] hover:border-[var(--input-border-hover)] focus-visible:border-[var(--input-border-focus)] focus-visible:outline-none focus-visible:shadow-[0_0_0_var(--focus-width)_var(--input-focus-ring)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm',
        className,
      )}
      type={type}
      {...props}
    />
  )
}

export { Input }
