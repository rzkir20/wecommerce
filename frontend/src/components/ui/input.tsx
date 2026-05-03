import * as React from 'react'

import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'

export const inputVariants = cva(
  'flex w-full min-w-0 transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'h-9 rounded-xl border border-input bg-input/30 px-3 py-1 text-base file:font-medium focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        /** Form lapangan lebar (ikon di kanan ~ pr-12 di Field). */
        field:
          'min-h-[52px] rounded-2xl border border-border bg-background px-5 py-4 pr-12 font-bold text-foreground focus:border-[#d4ff3f] focus:ring-4 focus:ring-[#d4ff3f]/10 focus:outline-none aria-invalid:border-destructive aria-invalid:ring-destructive/25 md:text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type InputProps = React.ComponentProps<'input'> &
  VariantProps<typeof inputVariants>

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', variant, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
