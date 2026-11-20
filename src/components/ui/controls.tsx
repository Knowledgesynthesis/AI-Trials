import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
  hint,
}: {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
  hint?: ReactNode
}) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <output htmlFor={id} className="text-sm font-semibold tabular text-ink">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--fill' as string]: `${fill}%` }}
        aria-valuetext={format(value)}
      />
      {hint && <p className="-mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: ReactNode
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
  hint?: ReactNode
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  size = 'md',
  className,
}: {
  label?: ReactNode
  value: T
  options: Array<{ value: T; label: ReactNode }>
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      {label && (
        <div id={id} className="mb-1 text-sm font-medium">
          {label}
        </div>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? id : undefined}
        className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-line bg-surface-2 p-1"
      >
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'rounded-md px-3 font-medium transition-colors',
                size === 'sm' ? 'h-7 text-xs' : 'h-8 text-sm',
                active ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-ink-2 hover:text-ink',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  hint,
}: {
  label: ReactNode
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  hint?: ReactNode
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="flex h-10 items-center rounded-lg border border-line-strong bg-surface pr-3 focus-within:ring-2 focus-within:ring-accent">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (e.target.value !== '' && Number.isFinite(v)) onChange(v)
          }}
          className="h-full w-full min-w-0 rounded-lg bg-transparent px-3 text-sm tabular outline-none"
        />
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
  hint?: ReactNode
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-surface-3',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ id: T; label: ReactNode }>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="tablist" className="-mx-1 mb-5 flex gap-1 overflow-x-auto border-b border-line px-1">
      {tabs.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              '-mb-px border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium whitespace-nowrap transition-colors',
              active ? 'border-accent text-ink' : 'border-transparent text-ink-2 hover:text-ink',
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
