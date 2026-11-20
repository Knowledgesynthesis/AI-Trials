import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ClipboardCheck, RotateCcw } from 'lucide-react'
import { curriculum, moduleLoaders } from '@/data/curriculum'
import type { ModuleDef, QuizItem } from '@/data/types'
import { Button, PageHeader } from '@/components/ui/primitives'
import { QuizRunner } from '@/components/Quiz'
import { createRng, shuffle } from '@/lib/stats/rng'
import { useProgress } from '@/store/progress'
import { cn, pct } from '@/lib/utils'

const PER_MODULE = 2

type Phase = 'intro' | 'running' | 'done'

export default function Exam() {
  const [mods, setMods] = useState<ModuleDef[] | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [items, setItems] = useState<Array<{ item: QuizItem; module: string }>>([])
  const [result, setResult] = useState<{ score: number; byModule: Record<string, [number, number]> } | null>(null)
  const recordExam = useProgress((s) => s.recordExam)
  const exams = useProgress((s) => s.exams)

  useEffect(() => {
    document.title = 'Final exam · AI Trials'
    let alive = true
    Promise.all(curriculum.map((m) => moduleLoaders[m.id]().then((x) => x.default))).then((all) => {
      if (alive) setMods(all)
    })
    return () => {
      alive = false
    }
  }, [])

  const start = () => {
    if (!mods) return
    const rng = createRng(Date.now() % 2147483647)
    const picked = mods.flatMap((m) => shuffle(rng, [...m.quiz]).slice(0, PER_MODULE).map((item) => ({ item, module: m.id })))
    setItems(picked)
    setResult(null)
    setPhase('running')
  }

  const finish = (score: number, perItem: boolean[]) => {
    const byModule: Record<string, [number, number]> = {}
    items.forEach((x, i) => {
      const cur = byModule[x.module] ?? [0, 0]
      byModule[x.module] = [cur[0] + (perItem[i] ? 1 : 0), cur[1] + 1]
    })
    setResult({ score, byModule })
    recordExam({ date: Date.now(), score: Math.round(score * items.length), total: items.length, byModule })
    setPhase('done')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Practice"
        title="Final exam"
        lead={`${PER_MODULE * curriculum.length} questions drawn at random — ${PER_MODULE} from each module's bank — with explanations for every option. Results are broken down by module so you know what to revisit.`}
      />
      {phase === 'intro' && (
        <div className="rounded-xl border border-line bg-surface p-6">
          <ClipboardCheck className="h-8 w-8 text-accent-text" />
          <p className="mt-3 text-ink-2">
            About 25 minutes. A new random set each attempt. A score of 80% across all modules indicates you can apply the course to real protocols and papers.
          </p>
          {exams.length > 0 && (
            <p className="mt-2 text-sm text-muted">
              Last attempt: {exams[exams.length - 1].score}/{exams[exams.length - 1].total} on {new Date(exams[exams.length - 1].date).toLocaleDateString()}.
            </p>
          )}
          <Button className="mt-4" size="lg" onClick={start} disabled={!mods}>
            {mods ? 'Start exam' : 'Loading questions…'}
          </Button>
        </div>
      )}
      {phase === 'running' && <QuizRunner key={items.map((x) => x.item.id).join()} title="Final exam" items={items.map((x) => x.item)} onFinish={finish} />}
      {phase === 'done' && result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-surface p-6 text-center">
            <div className={cn('text-5xl font-bold tabular', result.score >= 0.8 ? 'text-good' : 'text-warn')}>{pct(result.score, 0)}</div>
            <p className="mt-2 font-medium">{result.score >= 0.8 ? 'Excellent — course mastered.' : 'Good progress. Revisit the modules marked below.'}</p>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {curriculum.map((m) => {
              const [c, t] = result.byModule[m.id] ?? [0, 0]
              const ok = t > 0 && c === t
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <Link to={`/learn/${m.id}`} className="hover:text-accent-text hover:underline">
                    {m.num}. {m.title.split(':')[0]}
                  </Link>
                  <span className={cn('font-semibold tabular', ok ? 'text-good' : 'text-warn')}>
                    {c}/{t}
                  </span>
                </li>
              )
            })}
          </ul>
          <Button variant="secondary" onClick={start}>
            <RotateCcw className="h-4 w-4" /> New exam
          </Button>
        </div>
      )}
    </div>
  )
}
