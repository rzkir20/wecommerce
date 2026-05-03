import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'

import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/35',
        outline:
          'border-border bg-input/30 hover:bg-input/50 hover:text-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'rounded-none border-0 text-primary underline-offset-4 shadow-none hover:underline focus-visible:ring-0 [&_svg]:size-4',
        /** Tombol sekunder formulir profil (Discard). */
        profileDiscard:
          'h-auto min-h-0 rounded-none border-0 bg-transparent px-6 py-2.5 font-bold text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground focus-visible:ring-0',
        /** CTAs utama aksen lime (#d4ff3f) — profil dan tempat lain. */
        lime:
          'h-auto min-h-0 rounded-2xl border-0 bg-[#d4ff3f] px-8 py-2.5 font-black tracking-widest text-black uppercase shadow-lg shadow-[#d4ff3f]/30 hover:scale-[1.02] hover:bg-[#d4ff3f] hover:text-black focus-visible:ring-[#d4ff3f]/35',
        /** Tautan aksen seperti “Coba lagi” / CTA kartu informasi. */
        ctaRose:
          'h-auto min-h-0 rounded-none border-0 bg-transparent p-0 text-[11px] font-black tracking-widest text-rose-600 uppercase underline shadow-none hover:bg-transparent hover:text-rose-700 focus-visible:ring-rose-500/30 [&_svg]:size-4',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        xs: 'h-6 rounded-md px-2 text-xs has-[>svg]:px-2',
        icon: 'size-9 shrink-0',
        'icon-sm': "size-8 shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'icon-xs':
          "size-6 shrink-0 p-0 [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

Button.displayName = 'Button'

export { Button }
