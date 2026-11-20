import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { cases } from '@/data/cases'
import { curriculum } from '@/data/curriculum'
import { refById } from '@/data/references'
import { Badge, PageHeader } from '@/components/ui/primitives'
import { QuestionCard } from '@/components/Quiz'
import { cn } from '@/lib/utils'

export default function Cases() {
  const [open, setOpen] = useState<string | null>(cases[0].id)
  useEffect(() => {
    document.title = 'Landmark trials · AI Trials'
  }, [])
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Practice"
        title="Landmark trials"
        lead="Twelve trials and studies that changed how we design, monitor and interpret trials. For each: what was done, what was found, the lesson — and a question to check you drew it."
      />
      <ul className="space-y-3">
        {cases.map((c) => {
          const isOpen = open === c.id
          const mod = curriculum.find((m) => m.id === c.module)
          return (
            <li key={c.id} className="rounded-xl border border-line bg-surface">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : c.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-3 p-5 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold tracking-tight">{c.name}</span>
                    <span className="text-sm text-muted">{c.year}</span>
                  </div>
                  <Badge tone="accent" className="mt-1.5">
                    {c.theme}
                  </Badge>
                </div>
                <ChevronDown className={cn('mt-1 h-5 w-5 shrink-0 text-muted transition-transform', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="space-y-4 border-t border-line p-5">
                  <dl className="grid gap-4 text-sm md:grid-cols-3">
                    <div>
                      <dt className="text-xs font-semibold tracking-wide text-ink-2 uppercase">Design</dt>
                      <dd className="mt-1">{c.design}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold tracking-wide text-ink-2 uppercase">Result</dt>
                      <dd className="mt-1">{c.result}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold tracking-wide text-ink-2 uppercase">Lesson</dt>
                      <dd className="mt-1">{c.lesson}</dd>
                    </div>
                  </dl>
                  <QuestionCard item={c.check} compact />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <span>
                      {c.refs
                        .map((r) => refById(r))
                        .filter(Boolean)
                        .map((r, i) => (
                          <span key={r!.id}>
                            {i > 0 && ' · '}
                            {r!.url ? (
                              <a href={r!.url} target="_blank" rel="noreferrer noopener" className="hover:text-ink hover:underline">
                                {r!.short}
                              </a>
                            ) : (
                              r!.short
                            )}
                          </span>
                        ))}
                    </span>
                    {mod && (
                      <Link to={`/learn/${mod.id}`} className="font-medium text-accent-text hover:underline">
                        Module {mod.num} →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
