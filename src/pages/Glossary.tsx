import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { glossary } from '@/data/glossary'
import { curriculum } from '@/data/curriculum'
import type { GlossaryTerm } from '@/data/types'
import { Badge, PageHeader } from '@/components/ui/primitives'
import { Segmented } from '@/components/ui/controls'

const CATS: Array<'All' | GlossaryTerm['category']> = ['All', 'Design', 'Statistics', 'Adaptive', 'Bayesian', 'AI/ML', 'Ethics & Regulation']

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export default function Glossary() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<(typeof CATS)[number]>('All')
  useEffect(() => {
    document.title = 'Glossary · AI Trials'
  }, [])
  const terms = useMemo(() => {
    const qq = query.trim().toLowerCase()
    return [...glossary]
      .filter((t) => (cat === 'All' || t.category === cat) && (!qq || t.term.toLowerCase().includes(qq) || t.definition.toLowerCase().includes(qq)))
      .sort((a, b) => a.term.localeCompare(b.term))
  }, [query, cat])

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Reference" title="Glossary" lead={`${glossary.length} terms, each linked to the module that teaches it.`} />
      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms and definitions…"
            aria-label="Search glossary"
            className="h-11 w-full rounded-lg border border-line-strong bg-surface pr-3 pl-9 text-sm"
          />
        </div>
        <Segmented size="sm" value={cat} onChange={setCat} options={CATS.map((c) => ({ value: c, label: c }))} />
      </div>
      <p className="mb-3 text-sm text-muted" aria-live="polite">
        {terms.length} {terms.length === 1 ? 'term' : 'terms'}
      </p>
      <dl className="divide-y divide-line rounded-xl border border-line bg-surface">
        {terms.map((t) => {
          const mod = curriculum.find((m) => m.id === t.module)
          const see = (t.see ?? []).filter((s) => glossary.some((g) => g.term === s))
          return (
            <div key={t.term} id={slug(t.term)} className="scroll-mt-20 p-4">
              <dt className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{t.term}</span>
                <Badge>{t.category}</Badge>
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-2">{t.definition}</dd>
              {(mod || see.length > 0) && (
                <dd className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {mod && (
                    <Link to={`/learn/${mod.id}`} className="font-medium text-accent-text hover:underline">
                      Module {mod.num}: {mod.title.split(':')[0]}
                    </Link>
                  )}
                  {see.map((s) => (
                    <a key={s} href={`#${slug(s)}`} onClick={() => setCat('All')} className="text-muted hover:text-ink hover:underline">
                      See: {s}
                    </a>
                  ))}
                </dd>
              )}
            </div>
          )
        })}
        {terms.length === 0 && <div className="p-8 text-center text-sm text-muted">No terms match.</div>}
      </dl>
    </div>
  )
}
