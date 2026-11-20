import { cn } from './utils'

export type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
export type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap'
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:opacity-90',
  secondary: 'bg-surface-2 text-ink hover:bg-surface-3 border border-line',
  outline: 'border border-line-strong text-ink hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

