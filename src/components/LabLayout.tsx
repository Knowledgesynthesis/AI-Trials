import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { labs } from '@/data/labs'
import { curriculum } from '@/data/curriculum'
import { useProgress } from '@/store/progress'
import { PageHeader } from './ui/primitives'

export function LabLayout({
  id,
  lead,
  controls,
  children,
  wideControls,
}: {
  id: string
  lead: ReactNode
  controls?: ReactNode
  children: ReactNode
  wideControls?: boolean
}) {
  const lab = labs.find((l) => l.id === id)!
  const mod = curriculum.find((m) => m.id === lab.module)
  const markLab = useProgress((s) => s.markLab)
  useEffect(() => {
    markLab(id)
    document.title = `${lab.title} · AI Trials`
  }, [id, lab.title, markLab])

  return (
    <div>
      <PageHeader eyebrow="Lab" title={lab.title} lead={lead}>
        {mod && (
          <Link
            to={`/learn/${mod.id}`}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text hover:underline"
          >
            <GraduationCap className="h-4 w-4" /> Concepts: Module {mod.num} — {mod.title.split(':')[0]}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </PageHeader>
      {controls ? (
        <div className={wideControls ? 'grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]' : 'grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'}>
          <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">{controls}</div>
          <div className="min-w-0 space-y-6">{children}</div>
        </div>
      ) : (
        <div className="space-y-6">{children}</div>
      )}
    </div>
  )
}

export function ControlCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
