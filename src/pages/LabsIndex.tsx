import { useEffect } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, FlaskConical } from 'lucide-react'
import { labs } from '@/data/labs'
import { curriculum } from '@/data/curriculum'
import { PageHeader } from '@/components/ui/primitives'
import { useProgress } from '@/store/progress'

export default function LabsIndex() {
  const used = useProgress((s) => s.labsUsed)
  useEffect(() => {
    document.title = 'Labs · AI Trials'
  }, [])
  return (
    <div>
      <PageHeader
        eyebrow="Labs"
        title="Ten laboratories"
        lead="Each lab is a working tool: exact calculations, reproducible simulations (seeded), and the evidence behind every default. Use them to build intuition — or to sanity-check a real protocol."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {labs.map((l) => {
          const mod = curriculum.find((m) => m.id === l.module)
          return (
            <Link key={l.id} to={l.path} className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold">
                  <FlaskConical className="h-4 w-4 shrink-0 text-accent-text" /> {l.title}
                </div>
                {used.includes(l.id) && <CheckCircle2 className="h-4 w-4 shrink-0 text-good" aria-label="Opened" />}
              </div>
              <p className="mt-1.5 flex-1 text-sm text-ink-2">{l.blurb}</p>
              {mod && <p className="mt-3 text-xs text-muted">Concepts: Module {mod.num} — {mod.title.split(':')[0]}</p>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
