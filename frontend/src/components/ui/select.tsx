import * as React from 'react'

import { cn } from '#/lib/utils'

export type SelectOption = { value: string; label: string }

export type SelectProps = Omit<
  React.ComponentProps<'select'>,
  'children' | 'size'
> & {
  /** Shown as the empty `<option>`; omit to skip placeholder option */
  placeholder?: string
  options: SelectOption[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { className, placeholder, options, value, defaultValue, ...props },
    ref,
  ) {
    return (
      <select
        ref={ref}
        data-slot="select"
        value={value}
        defaultValue={defaultValue}
        className={cn(
          'w-full min-h-[52px] cursor-pointer appearance-none rounded-2xl border border-border bg-background px-5 py-4 font-bold text-foreground transition-all focus:border-[#d4ff3f] focus:ring-4 focus:ring-[#d4ff3f]/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/25',
          className,
        )}
        {...props}
      >
        {placeholder !== undefined ? (
          <option value="">{placeholder}</option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  },
)

Select.displayName = 'Select'

export { Select }
