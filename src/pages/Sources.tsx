import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Search } from 'lucide-react'
import { LAST_VERIFIED, references } from '@/data/references'
import type { Reference } from '@/data/types'
import { Badge, PageHeader } from '@/components/ui/primitives'

const GROUPS: Array<{ kind: Reference['kind']; title: string }> = [
  { kind: 'guidance', title: 'Regulatory guidance and legislation' },
  { kind: 'statement', title: 'Reporting guidelines and statements' },
  { kind: 'ethics', title: 'Ethics' },
  { kind: 'trial', title: 'Trials' },
  { kind: 'evidence', title: 'Meta-research and empirical evidence' },
  { kind: 'method', title: 'Methods papers' },
  { kind: 'book', title: 'Books' },
]

export default function Sources() {
  const [query, setQuery] = useState('')
  useEffect(() => {
    document.title = 'Sources & guidance · AI Trials'
  }, [])
  const filtered = useMemo(() => {
    const qq = query.trim().toLowerCase()
    return references.filter((r) => !qq || r.citation.toLowerCase().includes(qq) || r.short.toLowerCase().includes(qq))
  }, [query])

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Reference"
        title="Sources & guidance"
        lead={`Every source cited in the course. Regulatory status verified ${LAST_VERIFIED}; drafts are marked. Article links open a PubMed search or the DOI.`}
      />
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sources…"
          aria-label="Search sources"
          className="h-11 w-full rounded-lg border border-line-strong bg-surface pr-3 pl-9 text-sm"
        />
      </div>
      <div className="space-y-8">
        {GROUPS.map((g) => {
          const items = filtered.filter((r) => r.kind === g.kind)
          if (!items.length) return null
          return (
            <section key={g.kind}>
              <h2 className="mb-2 text-base font-semibold">
                {g.title} <span className="text-sm font-normal text-muted">({items.length})</span>
              </h2>
              <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
                {items.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 p-3 text-sm">
                    <div className="min-w-0 flex-1">
                      {r.citation}
                      {r.status && (
                        <Badge tone="warn" className="ml-2 align-middle">
                          {r.status}
                        </Badge>
                      )}
                    </div>
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noreferrer noopener" aria-label={`Open ${r.short}`} className="shrink-0 text-muted hover:text-accent-text">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
