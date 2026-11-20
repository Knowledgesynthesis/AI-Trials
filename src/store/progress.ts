import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

export interface ModuleProgress {
  sectionsDone: string[]
  checks: Record<string, boolean> // inline check id → answered correctly on first try
  quizBest: number | null // 0–1
  quizAttempts: number
  lastVisited?: number
}

export interface ExamRecord {
  date: number
  score: number
  total: number
  byModule: Record<string, [number, number]>
}

interface ProgressState {
  theme: Theme
  modules: Record<string, ModuleProgress>
  labsUsed: string[]
  exams: ExamRecord[]
  setTheme: (t: Theme) => void
  markSection: (moduleId: string, sectionId: string, done: boolean) => void
  recordCheck: (moduleId: string, checkId: string, correct: boolean) => void
  recordQuiz: (moduleId: string, score: number) => void
  visitModule: (moduleId: string) => void
  markLab: (labId: string) => void
  recordExam: (r: ExamRecord) => void
  reset: () => void
}

const empty = (): ModuleProgress => ({ sectionsDone: [], checks: {}, quizBest: null, quizAttempts: 0 })

export const MASTERY_THRESHOLD = 0.8

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      theme: 'system',
      modules: {},
      labsUsed: [],
      exams: [],
      setTheme: (theme) => set({ theme }),
      markSection: (moduleId, sectionId, done) =>
        set((s) => {
          const m = s.modules[moduleId] ?? empty()
          const has = m.sectionsDone.includes(sectionId)
          if (has === done) return s
          const sectionsDone = done ? [...m.sectionsDone, sectionId] : m.sectionsDone.filter((x) => x !== sectionId)
          return { modules: { ...s.modules, [moduleId]: { ...m, sectionsDone } } }
        }),
      recordCheck: (moduleId, checkId, correct) =>
        set((s) => {
          const m = s.modules[moduleId] ?? empty()
          if (checkId in m.checks) return s // first attempt counts
          return { modules: { ...s.modules, [moduleId]: { ...m, checks: { ...m.checks, [checkId]: correct } } } }
        }),
      recordQuiz: (moduleId, score) =>
        set((s) => {
          const m = s.modules[moduleId] ?? empty()
          return {
            modules: {
              ...s.modules,
              [moduleId]: { ...m, quizAttempts: m.quizAttempts + 1, quizBest: Math.max(m.quizBest ?? 0, score) },
            },
          }
        }),
      visitModule: (moduleId) =>
        set((s) => {
          const m = s.modules[moduleId] ?? empty()
          return { modules: { ...s.modules, [moduleId]: { ...m, lastVisited: Date.now() } } }
        }),
      markLab: (labId) => set((s) => (s.labsUsed.includes(labId) ? s : { labsUsed: [...s.labsUsed, labId] })),
      recordExam: (r) => set((s) => ({ exams: [...s.exams, r].slice(-20) })),
      reset: () => set({ modules: {}, labsUsed: [], exams: [] }),
    }),
    { name: 'ai-trials-v2', version: 1 },
  ),
)

export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0d0e10' : '#f6f6f3')
}
