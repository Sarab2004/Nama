import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[color,background-color,box-shadow,transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-[var(--focus-ring)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-[var(--button-primary-shadow)] hover:bg-[var(--button-primary-bg-hover)] hover:shadow-[var(--button-primary-shadow-hover)] active:bg-[var(--button-primary-bg-active)]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        outline:
          'border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:bg-[var(--button-secondary-bg-hover)]',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        accent:
          'bg-[var(--button-accent-bg)] text-[var(--button-accent-text)] hover:bg-[var(--button-accent-bg-hover)] active:bg-[var(--button-accent-bg-active)]',
        ghost: 'hover:bg-[var(--hover-surface)] hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline shadow-none hover:translate-y-0',
      },
      size: {
        clear: '',
        default: 'min-h-12 h-12 px-5 py-2 has-[>svg]:px-4',
        sm: 'min-h-9 h-9 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'min-h-12 h-12 rounded-md px-8 has-[>svg]:px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.FC<ButtonProps> = ({ asChild = false, className, size, variant, ...props }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
