import { useEffect } from 'react'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle2, Circle, CircleDot, FlaskConical, ShieldCheck } from 'lucide-react'
import { curriculum } from '@/data/curriculum'
import { labs } from '@/data/labs'
import { LAST_VERIFIED } from '@/data/references'
import { ButtonLink } from '@/components/ui/primitives'
import { MASTERY_THRESHOLD, useProgress } from '@/store/progress'
import { cn } from '@/lib/utils'

const FEATURED = ['group-sequential', 'adaptive-randomization', 'bayesian', 'enrichment']

export default function Home() {
  const modules = useProgress((s) => s.modules)
  useEffect(() => {
    document.title = 'AI Trials — Modern Clinical Trial Methods'
  }, [])

  const status = (id: string) => {
    const p = modules[id]
    if (!p) return 'new'
    if ((p.quizBest ?? 0) >= MASTERY_THRESHOLD) return 'mastered'
    return 'started'
  }
  const mastered = curriculum.filter((m) => status(m.id) === 'mastered').length
  const resume = curriculum.find((m) => status(m.id) === 'started') ?? curriculum.find((m) => status(m.id) === 'new')

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-10 sm:px-10 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-soft blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="mb-3 text-xs font-semibold tracking-wider text-accent-text uppercase">Clinical trial methodology · interactive course</p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">Learn modern trial design by running it.</h1>
          <p className="mt-4 text-lg text-ink-2 text-pretty">
            Eleven modules and ten laboratories covering randomization, estimands, power, multiplicity, non-inferiority, group-sequential and adaptive designs,
            Bayesian methods and AI in trials — every number computed exactly, every claim sourced.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {resume && (
              <ButtonLink to={`/learn/${resume.id}`} size="lg">
                {status(resume.id) === 'started' ? `Continue: Module ${resume.num}` : 'Start Module 1'} <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            )}
            <ButtonLink to="/labs" variant="secondary" size="lg">
              <FlaskConical className="h-4 w-4" /> Open the labs
            </ButtonLink>
          </div>
          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-ink-2">Modules mastered</dt>
              <dd className="text-2xl font-semibold tabular">
                {mastered}
                <span className="text-base text-muted">/{curriculum.length}</span>
              </dd>
            </div>
            <div>
              <dt className="text-ink-2">Interactive labs</dt>
              <dd className="text-2xl font-semibold tabular">{labs.length}</dd>
            </div>
            <div>
              <dt className="text-ink-2">Sources verified</dt>
              <dd className="text-base font-semibold">{LAST_VERIFIED}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">The path</h2>
            <p className="text-sm text-ink-2">Core modules first; each ends with a mastery check you must pass at 80%.</p>
          </div>
          <Link to="/learn" className="text-sm font-medium text-accent-text hover:underline">
            Curriculum map →
          </Link>
        </div>
        <ol className="grid gap-2 md:grid-cols-2">
          {curriculum.map((m) => {
            const st = status(m.id)
            const Icon = st === 'mastered' ? CheckCircle2 : st === 'started' ? CircleDot : Circle
            return (
              <li key={m.id}>
                <Link to={`/learn/${m.id}`} className="group flex items-start gap-3 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent">
                  <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', st === 'mastered' ? 'text-good' : st === 'started' ? 'text-accent-text' : 'text-muted')} aria-label={st} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      <span className="mr-1.5 font-mono text-xs text-muted">{m.num}</span>
                      {m.title}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-2">{m.tagline}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Start with a lab</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {labs
            .filter((l) => FEATURED.includes(l.id))
            .map((l) => (
              <Link key={l.id} to={l.path} className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent">
                <div className="flex items-center gap-2 font-semibold">
                  <FlaskConical className="h-4 w-4 text-accent-text" /> {l.title}
                </div>
                <p className="mt-1.5 text-sm text-ink-2">{l.blurb}</p>
              </Link>
            ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-line bg-surface p-6 md:grid-cols-[auto_1fr]">
        <ShieldCheck className="h-8 w-8 text-accent-text" aria-hidden />
        <div>
          <h2 className="font-semibold">Why you can trust the numbers</h2>
          <p className="mt-1 text-sm text-ink-2">
            The statistics engine is tested against published reference values: Pocock (1977) and O'Brien–Fleming (1979) boundary constants, Lan–DeMets spending
            boundaries, Jennison & Turnbull sample-size inflation factors, the Armitage peeking error rates, textbook sample sizes and high-precision distribution
            values. Regulatory statements reflect guidance status as of {LAST_VERIFIED}; draft documents are labelled as drafts.
          </p>
          <p className="mt-2 text-xs text-muted">All patient data in the labs are synthetic.</p>
        </div>
      </section>
    </div>
  )
}
