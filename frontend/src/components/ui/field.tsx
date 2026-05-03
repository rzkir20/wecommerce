import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

export type FieldProps = {
  label: string
  icon: ReactNode
  children: ReactNode
  className?: string
  htmlFor?: string
}

export function Field({ label, icon, children, className, htmlFor }: FieldProps) {
  return (
    <div className={cn('group space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-black tracking-widest text-muted-foreground uppercase transition-colors group-focus-within:text-foreground"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {children}
        <div className="pointer-events-none absolute right-5 text-muted-foreground/60 transition-colors group-focus-within:text-foreground">
          {icon}
        </div>
      </div>
    </div>
  )
}
