import { useEffect } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Clock } from 'lucide-react'
import { curriculum } from '@/data/curriculum'
import { labs } from '@/data/labs'
import { Badge, PageHeader } from '@/components/ui/primitives'
import { MASTERY_THRESHOLD, useProgress } from '@/store/progress'
import { pct } from '@/lib/utils'

export default function Learn() {
  const modules = useProgress((s) => s.modules)
  useEffect(() => {
    document.title = 'Curriculum · AI Trials'
  }, [])
  const totalMinutes = curriculum.reduce((a, m) => a + m.minutes, 0)
  return (
    <div>
      <PageHeader
        eyebrow="Course"
        title="Curriculum map"
        lead={`Eleven modules, about ${Math.round(totalMinutes / 60)} hours of reading plus labs. Modules 1–4 and 10 are the core; 5–9 build on them; 11 integrates everything in a full appraisal.`}
      />
      <ol className="space-y-3">
        {curriculum.map((m) => {
          const p = modules[m.id]
          const mastered = (p?.quizBest ?? 0) >= MASTERY_THRESHOLD
          const modLabs = labs.filter((l) => l.module === m.id)
          return (
            <li key={m.id} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="accent">Module {m.num}</Badge>
                    <Badge>{m.level}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3.5 w-3.5" /> {m.minutes} min
                    </span>
                    {mastered && (
                      <Badge tone="good">
                        <CheckCircle2 className="h-3 w-3" /> Mastered
                      </Badge>
                    )}
                    {p?.quizBest != null && !mastered && <Badge tone="warn">Best {pct(p.quizBest, 0)}</Badge>}
                  </div>
                  <Link to={`/learn/${m.id}`} className="text-lg font-semibold tracking-tight hover:text-accent-text">
                    {m.title}
                  </Link>
                  <p className="mt-1 text-sm text-ink-2">{m.tagline}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    {m.prerequisites.length > 0 && (
                      <span>
                        Builds on:{' '}
                        {m.prerequisites.map((id, i) => {
                          const pre = curriculum.find((x) => x.id === id)!
                          return (
                            <span key={id}>
                              {i > 0 && ', '}
                              <Link to={`/learn/${id}`} className="hover:text-ink hover:underline">
                                {pre.num}. {pre.title.split(':')[0]}
                              </Link>
                            </span>
                          )
                        })}
                      </span>
                    )}
                    {modLabs.length > 0 && (
                      <span>
                        Lab:{' '}
                        {modLabs.map((l, i) => (
                          <span key={l.id}>
                            {i > 0 && ', '}
                            <Link to={l.path} className="hover:text-ink hover:underline">
                              {l.title}
                            </Link>
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/learn/${m.id}`}
                  className="shrink-0 rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent-text"
                >
                  {p ? 'Continue' : 'Start'}
                </Link>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
