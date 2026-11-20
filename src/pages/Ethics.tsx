import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ethicsCases } from '@/data/ethicsCases'
import { refById } from '@/data/references'
import { Badge, PageHeader } from '@/components/ui/primitives'
import { Segmented } from '@/components/ui/controls'
import { QuestionCard } from '@/components/Quiz'

const CATS = ['All', 'Monitoring', 'Fairness', 'Consent', 'Transparency', 'Safety', 'Equipoise'] as const

export default function Ethics() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('All')
  useEffect(() => {
    document.title = 'Ethics casebook · AI Trials'
  }, [])
  const list = ethicsCases.filter((c) => cat === 'All' || c.category === cat)
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Practice"
        title="Ethics casebook"
        lead="Realistic dilemmas from adaptive, Bayesian and AI-enabled trials. Decide first, then read why each option is right or wrong. Principles are covered in Module 10."
      >
        <Link to="/learn/ethics" className="mt-2 inline-block text-sm font-medium text-accent-text hover:underline">
          Module 10: Ethics, oversight and regulation →
        </Link>
      </PageHeader>
      <Segmented className="mb-5" size="sm" value={cat} onChange={setCat} options={CATS.map((c) => ({ value: c, label: c }))} />
      <div className="space-y-6">
        {list.map((c) => (
          <article key={c.id} className="rounded-xl border border-line bg-surface p-5">
            <Badge tone="violet">{c.category}</Badge>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">{c.title}</h2>
            <p className="mt-2 leading-relaxed text-ink">{c.scenario}</p>
            <div className="mt-4">
              <QuestionCard item={c.decision} compact />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-ink-2 uppercase">Considerations</h3>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                  {c.considerations.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-ink-2 uppercase">Guidance & evidence</h3>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {c.guidance
                    .map((g) => refById(g))
                    .filter(Boolean)
                    .map((r) => (
                      <li key={r!.id}>
                        {r!.url ? (
                          <a href={r!.url} target="_blank" rel="noreferrer noopener" className="text-accent-text hover:underline">
                            {r!.short}
                          </a>
                        ) : (
                          r!.short
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
