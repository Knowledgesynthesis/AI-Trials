import type { CalloutTone } from '@/components/Callout'

export interface QuizOption {
  text: string
  correct?: boolean
  /** Why this option is right or wrong — shown after answering. */
  why: string
}

export interface QuizItem {
  id: string
  stem: string
  options: QuizOption[]
  explanation?: string
}

export type WidgetId = 'pvalue-dance' | 'ni-classifier' | 'mini-bayes' | 'cp-explainer' | 'design-effect' | 'covariate-adjustment'

export type Block =
  | { kind: 'md'; md: string }
  | { kind: 'callout'; tone: CalloutTone; title?: string; md: string }
  | { kind: 'check'; item: QuizItem }
  | { kind: 'widget'; id: WidgetId }
  | { kind: 'lab'; to: string; title: string; md: string }

export interface Section {
  id: string
  title: string
  blocks: Block[]
}

export interface ModuleDef {
  id: string
  num: number
  title: string
  tagline: string
  minutes: number
  level: 'Core' | 'Intermediate' | 'Advanced'
  prerequisites: string[]
  objectives: string[]
  sections: Section[]
  quiz: QuizItem[]
  sources: string[] // reference ids
}

export interface Reference {
  id: string
  short: string
  citation: string
  url?: string
  kind: 'guidance' | 'statement' | 'trial' | 'method' | 'evidence' | 'book' | 'ethics'
  status?: string // e.g. "Draft, Jan 2026"
}

export interface GlossaryTerm {
  term: string
  definition: string
  category: 'Design' | 'Statistics' | 'Bayesian' | 'Adaptive' | 'AI/ML' | 'Ethics & Regulation'
  see?: string[]
  module?: string
}
