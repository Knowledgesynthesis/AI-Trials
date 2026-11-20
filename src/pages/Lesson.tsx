import { Suspense, use, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, FlaskConical, Target } from 'lucide-react'
import { curriculum, moduleLoaders } from '@/data/curriculum'
import type { Block, ModuleDef } from '@/data/types'
import { references } from '@/data/references'
import { Markdown } from '@/components/Markdown'
import { Callout } from '@/components/Callout'
import { QuestionCard, QuizRunner } from '@/components/Quiz'
import { Widget } from '@/components/widgets/Widgets'
import { Badge, ButtonLink } from '@/components/ui/primitives'
import { MASTERY_THRESHOLD, useProgress } from '@/store/progress'
import { cn, pct } from '@/lib/utils'
import NotFound from './NotFound'

const cache = new Map<string, Promise<{ default: ModuleDef }>>()
function load(id: string) {
  if (!cache.has(id)) cache.set(id, moduleLoaders[id]())
  return cache.get(id)!
}

export default function Lesson() {
  const { moduleId = '' } = useParams()
  if (!moduleLoaders[moduleId]) return <NotFound />
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-muted">Loading module…</div>}>
      <LessonBody key={moduleId} promise={load(moduleId)} />
    </Suspense>
  )
}

function BlockView({ block, moduleId }: { block: Block; moduleId: string }) {
  const recordCheck = useProgress((s) => s.recordCheck)
  switch (block.kind) {
    case 'md':
      return <Markdown>{block.md}</Markdown>
    case 'callout':
      return <Callout tone={block.tone} title={block.title} md={block.md} />
    case 'check':
      return (
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-accent-text uppercase">
            <Target className="h-4 w-4" /> Check yourself
          </div>
          <QuestionCard item={block.item} compact onAnswered={(c) => recordCheck(moduleId, block.item.id, c)} />
        </div>
      )
    case 'widget':
      return <Widget id={block.id} />
    case 'lab':
      return (
        <Link to={block.to} className="group flex items-start gap-3 rounded-xl border border-accent/40 bg-accent-soft p-4 transition-colors hover:border-accent">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-ink">Open lab: {block.title}</div>
            <Markdown compact className="text-ink-2">
              {block.md}
            </Markdown>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent-text transition-transform group-hover:translate-x-0.5" />
        </Link>
      )
  }
}

function LessonBody({ promise }: { promise: Promise<{ default: ModuleDef }> }) {
  const mod = use(promise).default
  const progress = useProgress((s) => s.modules[mod.id])
  const markSection = useProgress((s) => s.markSection)
  const recordQuiz = useProgress((s) => s.recordQuiz)
  const visit = useProgress((s) => s.visitModule)

  useEffect(() => {
    visit(mod.id)
    document.title = `${mod.num}. ${mod.title} · AI Trials`
  }, [mod.id, mod.num, mod.title, visit])

  const idx = curriculum.findIndex((m) => m.id === mod.id)
  const prev = curriculum[idx - 1]
  const next = curriculum[idx + 1]
  const done = progress?.sectionsDone ?? []
  const best = progress?.quizBest ?? null
  const sources = mod.sources.map((id) => references.find((r) => r.id === id)).filter(Boolean)

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/learn" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Curriculum
      </Link>
      <header className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="accent">Module {mod.num}</Badge>
          <Badge>{mod.level}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" /> {mod.minutes} min
          </span>
          {best !== null && <Badge tone={best >= MASTERY_THRESHOLD ? 'good' : 'warn'}>Best quiz {pct(best, 0)}</Badge>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{mod.title}</h1>
        <p className="mt-2 text-ink-2">{mod.tagline}</p>
        <div className="mt-5 rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 text-sm font-semibold">After this module you can</div>
          <ul className="space-y-1.5 text-sm">
            {mod.objectives.map((o) => (
              <li key={o} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Sections" className="mt-4">
          <ol className="flex flex-wrap gap-2 text-sm">
            {mod.sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-colors hover:border-accent',
                    done.includes(s.id) ? 'border-good/40 bg-good-soft text-good' : 'border-line bg-surface text-ink-2',
                  )}
                >
                  <span className="font-mono text-xs">{i + 1}</span> {s.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#quiz" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-ink-2 hover:border-accent">
                <Target className="h-3.5 w-3.5" /> Mastery check
              </a>
            </li>
          </ol>
        </nav>
      </header>

      <div className="space-y-12">
        {mod.sections.map((s, i) => {
          const isDone = done.includes(s.id)
          return (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2 className="mb-4 text-xl font-semibold tracking-tight">
                <span className="mr-2 font-mono text-sm text-muted">{mod.num}.{i + 1}</span>
                {s.title}
              </h2>
              <div className="space-y-5">
                {s.blocks.map((b, j) => (
                  <BlockView key={j} block={b} moduleId={mod.id} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => markSection(mod.id, s.id, !isDone)}
                className={cn(
                  'mt-5 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  isDone ? 'border-good/40 bg-good-soft text-good' : 'border-line text-ink-2 hover:border-accent hover:text-ink',
                )}
                aria-pressed={isDone}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {isDone ? 'Section done' : 'Mark section as done'}
              </button>
            </section>
          )
        })}

        <section id="quiz" className="scroll-mt-20">
          <h2 className="mb-1 text-xl font-semibold tracking-tight">Mastery check</h2>
          <p className="mb-4 text-sm text-ink-2">
            {mod.quiz.length} questions; every option explains why it is right or wrong. {Math.round(MASTERY_THRESHOLD * 100)}% marks the module as mastered.
          </p>
          <QuizRunner items={mod.quiz} onFinish={(score) => recordQuiz(mod.id, score)} />
        </section>

        {sources.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold">Sources for this module</h2>
            <ol className="space-y-2 text-sm">
              {sources.map((r) => (
                <li key={r!.id} className="text-ink-2">
                  {r!.url ? (
                    <a href={r!.url} target="_blank" rel="noreferrer noopener" className="text-ink hover:text-accent-text hover:underline">
                      {r!.citation}
                    </a>
                  ) : (
                    <span className="text-ink">{r!.citation}</span>
                  )}
                  {r!.status && <span className="ml-1 text-xs text-muted">({r!.status})</span>}
                </li>
              ))}
            </ol>
          </section>
        )}

        <nav className="flex flex-wrap justify-between gap-3 border-t border-line pt-6">
          {prev ? (
            <ButtonLink to={`/learn/${prev.id}`} variant="secondary" className="h-auto min-h-10 max-w-full py-2 text-left whitespace-normal">
              <ArrowLeft className="h-4 w-4" /> {prev.num}. {prev.title.split(':')[0]}
            </ButtonLink>
          ) : (
            <span />
          )}
          {next ? (
            <ButtonLink to={`/learn/${next.id}`} className="h-auto min-h-10 max-w-full py-2 text-left whitespace-normal">
              {next.num}. {next.title.split(':')[0]} <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          ) : (
            <ButtonLink to="/exam">
              Take the final exam <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          )}
        </nav>
      </div>
    </article>
  )
}
