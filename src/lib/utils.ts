import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pct(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return '—'
  return `${(x * 100).toFixed(digits)}%`
}

export function fmt(x: number, digits = 2): string {
  if (!Number.isFinite(x)) return x === Infinity ? '∞' : x === -Infinity ? '−∞' : '—'
  const s = x.toFixed(digits)
  return s.startsWith('-') ? `−${s.slice(1)}` : s
}

export function fmtInt(x: number): string {
  if (!Number.isFinite(x)) return '—'
  return Math.round(x).toLocaleString('en-US')
}

/** p-values: 3 significant digits, "< 0.0001" floor. */
export function fmtP(p: number): string {
  if (!Number.isFinite(p)) return '—'
  if (p < 0.0001) return '< 0.0001'
  if (p < 0.001) return p.toExponential(1).replace('e-', '×10⁻').replace(/⁻(\d)/, (_, d) => `⁻${'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]}`)
  return p.toFixed(p < 0.01 ? 4 : 3)
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x))
}

export function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i)
}
