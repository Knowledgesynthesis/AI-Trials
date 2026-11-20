import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface LegendItem {
  label: string
  color: string
  kind?: 'line' | 'dash' | 'dot' | 'area'
}

export function Legend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2', className)}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          {it.kind === 'dot' ? (
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
          ) : it.kind === 'area' ? (
            <span className="inline-block h-2.5 w-3.5 rounded-sm" style={{ background: it.color }} />
          ) : (
            <svg width="18" height="6" aria-hidden>
              <line
                x1="1"
                y1="3"
                x2="17"
                y2="3"
                stroke={it.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={it.kind === 'dash' ? '4 3' : undefined}
              />
            </svg>
          )}
          {it.label}
        </li>
      ))}
    </ul>
  )
}

export function ChartFrame({
  title,
  subtitle,
  legend,
  children,
  footer,
  height = 280,
  className,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  legend?: LegendItem[]
  children: ReactNode
  footer?: ReactNode
  height?: number
  className?: string
}) {
  return (
    <figure className={cn('rounded-xl border border-line bg-surface p-4', className)}>
      {(title || legend) && (
        <figcaption className="mb-3 space-y-1.5">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {subtitle && <div className="text-xs text-ink-2">{subtitle}</div>}
          {legend && <Legend items={legend} />}
        </figcaption>
      )}
      <div style={{ height }} className="w-full">
        {children}
      </div>
      {footer && <div className="mt-2 text-xs text-muted">{footer}</div>}
    </figure>
  )
}

/** Tooltip body rendered with text tokens; colored swatches carry identity. */
export function TooltipBox({
  title,
  rows,
}: {
  title?: ReactNode
  rows: Array<{ label: string; value: ReactNode; color?: string }>
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg">
      {title && <div className="mb-1 font-semibold text-ink">{title}</div>}
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-ink-2">
            {r.color && <span className="inline-block h-2 w-2 rounded-full" style={{ background: r.color }} />}
            {r.label}
          </span>
          <span className="font-medium text-ink tabular">{r.value}</span>
        </div>
      ))}
    </div>
  )
}
