import type { ReactNode } from 'react'
import { AlertTriangle, BookOpenCheck, FlaskConical, Gavel, Lightbulb, Scale, Sigma, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Markdown } from './Markdown'

export type CalloutTone = 'key' | 'myth' | 'pitfall' | 'evidence' | 'example' | 'regulatory' | 'formula' | 'practice'

const meta: Record<CalloutTone, { label: string; icon: typeof Lightbulb; cls: string; iconCls: string }> = {
  key: { label: 'Key idea', icon: Lightbulb, cls: 'bg-accent-soft border-accent/30', iconCls: 'text-accent-text' },
  myth: { label: 'Misconception', icon: XCircle, cls: 'bg-bad-soft border-bad/25', iconCls: 'text-bad' },
  pitfall: { label: 'Pitfall', icon: AlertTriangle, cls: 'bg-warn-soft border-warn/30', iconCls: 'text-warn' },
  evidence: { label: 'Evidence', icon: BookOpenCheck, cls: 'bg-info-soft border-info/25', iconCls: 'text-info' },
  example: { label: 'Worked example', icon: FlaskConical, cls: 'bg-surface-2 border-line', iconCls: 'text-ink-2' },
  regulatory: { label: 'Regulatory position', icon: Gavel, cls: 'bg-violet-soft border-violet/25', iconCls: 'text-violet' },
  formula: { label: 'Formula', icon: Sigma, cls: 'bg-surface-2 border-line', iconCls: 'text-ink-2' },
  practice: { label: 'In practice', icon: Scale, cls: 'bg-good-soft border-good/25', iconCls: 'text-good' },
}

export function Callout({
  tone,
  title,
  md,
  children,
  className,
}: {
  tone: CalloutTone
  title?: string
  md?: string
  children?: ReactNode
  className?: string
}) {
  const m = meta[tone]
  const Icon = m.icon
  return (
    <aside className={cn('rounded-xl border p-4', m.cls, className)}>
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className={cn('h-4 w-4 shrink-0', m.iconCls)} aria-hidden />
        <span className={cn('text-xs font-semibold tracking-wide whitespace-nowrap uppercase', m.iconCls)}>{m.label}</span>
      </div>
      {title && <div className="mb-1 text-sm font-semibold text-ink">{title}</div>}
      {md && <Markdown compact>{md}</Markdown>}
      {children}
    </aside>
  )
}
