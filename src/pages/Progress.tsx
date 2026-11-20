import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Download, Trash2 } from 'lucide-react'
import { curriculum } from '@/data/curriculum'
import { labs } from '@/data/labs'
import { Button, PageHeader, Stat } from '@/components/ui/primitives'
import { MASTERY_THRESHOLD, useProgress } from '@/store/progress'
import { cn, pct } from '@/lib/utils'

export default function Progress() {
  const state = useProgress()
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    document.title = 'My progress · AI Trials'
  }, [])
  const mastered = curriculum.filter((m) => (state.modules[m.id]?.quizBest ?? 0) >= MASTERY_THRESHOLD).length
  const checks = Object.values(state.modules).flatMap((m) => Object.values(m.checks))
  const lastExam = state.exams[state.exams.length - 1]

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ modules: state.modules, labsUsed: state.labsUsed, exams: state.exams }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-trials-progress.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="You" title="My progress" lead="Stored only in this browser. Export it to keep a record." />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Modules mastered" value={`${mastered}/${curriculum.length}`} />
        <Stat label="Inline checks right first time" value={checks.length ? `${checks.filter(Boolean).length}/${checks.length}` : '—'} />
        <Stat label="Labs opened" value={`${state.labsUsed.length}/${labs.length}`} />
        <Stat label="Last exam" value={lastExam ? `${lastExam.score}/${lastExam.total}` : '—'} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[560px] text-sm tabular">
          <thead className="bg-surface-2 text-left text-xs text-ink-2">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Module</th>
              <th className="px-3 py-2.5 font-semibold">Sections done</th>
              <th className="px-3 py-2.5 font-semibold">Quiz attempts</th>
              <th className="px-4 py-2.5 font-semibold">Best quiz</th>
            </tr>
          </thead>
          <tbody>
            {curriculum.map((m) => {
              const p = state.modules[m.id]
              const best = p?.quizBest ?? null
              return (
                <tr key={m.id} className="border-t border-line">
                  <td className="px-4 py-2.5">
                    <Link to={`/learn/${m.id}`} className="hover:text-accent-text hover:underline">
                      {m.num}. {m.title.split(':')[0]}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">{p?.sectionsDone.length ?? 0}</td>
                  <td className="px-3 py-2.5">{p?.quizAttempts ?? 0}</td>
                  <td className={cn('px-4 py-2.5 font-medium', best !== null && (best >= MASTERY_THRESHOLD ? 'text-good' : 'text-warn'))}>
                    {best === null ? '—' : (
                      <span className="inline-flex items-center gap-1">
                        {pct(best, 0)} {best >= MASTERY_THRESHOLD && <CheckCircle2 className="h-4 w-4" aria-label="Mastered" />}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={exportJson}>
          <Download className="h-4 w-4" /> Export progress
        </Button>
        {confirming ? (
          <>
            <Button
              variant="outline"
              className="border-bad text-bad"
              onClick={() => {
                state.reset()
                setConfirming(false)
              }}
            >
              Confirm: erase all progress
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={() => setConfirming(true)}>
            <Trash2 className="h-4 w-4" /> Reset progress
          </Button>
        )}
      </div>
    </div>
  )
}
