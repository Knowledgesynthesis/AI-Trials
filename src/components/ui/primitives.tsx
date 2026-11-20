import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cn } from '@/lib/utils'
import { buttonClass, type Size, type Variant } from '@/lib/buttonClass'

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ variant = 'primary', size = 'md', className, type = 'button', ...props }, ref) => (
  <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />
))
Button.displayName = 'Button'

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-line bg-surface', className)} {...props} />
}

export function CardHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-2">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}

type Tone = 'neutral' | 'accent' | 'good' | 'warn' | 'bad' | 'info' | 'violet'
const toneClass: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-2 border-line',
  accent: 'bg-accent-soft text-accent-text border-transparent',
  good: 'bg-good-soft text-good border-transparent',
  warn: 'bg-warn-soft text-warn border-transparent',
  bad: 'bg-bad-soft text-bad border-transparent',
  info: 'bg-info-soft text-info border-transparent',
  violet: 'bg-violet-soft text-violet border-transparent',
}

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        toneClass[tone],
        className,
      )}
      {...props}
    />
  )
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="mb-6">
      {eyebrow && <div className="mb-2 text-xs font-semibold tracking-wider text-accent-text uppercase">{eyebrow}</div>}
      <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h1>
      {lead && <p className="mt-2 max-w-3xl text-ink-2 text-pretty">{lead}</p>}
      {children}
    </header>
  )
}

export function Stat({
  label,
  value,
  sub,
  tone,
  className,
}: {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  tone?: 'good' | 'bad' | 'warn'
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-line bg-surface p-3', className)}>
      <div className="text-xs font-medium text-ink-2">{label}</div>
      <div
        className={cn(
          'mt-1 text-xl font-semibold tracking-tight tabular',
          tone === 'good' && 'text-good',
          tone === 'bad' && 'text-bad',
          tone === 'warn' && 'text-warn',
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">{children}</kbd>
}
