import type { CalloutTone } from '@/components/Callout'
import type { Block, QuizItem, QuizOption, WidgetId } from '../types'

/** Raw (backslash-preserving, for LaTeX) and dedented markdown. */
export function md(strings: TemplateStringsArray, ...values: unknown[]): string {
  const raw = String.raw({ raw: strings }, ...values)
  const lines = raw.replace(/^\n/, '').split('\n')
  const indents = lines.filter((l) => l.trim()).map((l) => (l.match(/^ */) ?? [''])[0].length)
  const min = indents.length ? Math.min(...indents) : 0
  return lines
    .map((l) => l.slice(min))
    .join('\n')
    .trim()
}

export const text = (m: string): Block => ({ kind: 'md', md: m })
export const callout = (tone: CalloutTone, title: string | undefined, m: string): Block => ({ kind: 'callout', tone, title, md: m })
export const widget = (id: WidgetId): Block => ({ kind: 'widget', id })
export const lab = (to: string, title: string, m: string): Block => ({ kind: 'lab', to, title, md: m })
export const check = (item: QuizItem): Block => ({ kind: 'check', item })
export const right = (t: string, why: string): QuizOption => ({ text: t, why, correct: true })
export const wrong = (t: string, why: string): QuizOption => ({ text: t, why })
export const q = (id: string, stem: string, options: QuizOption[], explanation?: string): QuizItem => ({ id, stem, options, explanation })
