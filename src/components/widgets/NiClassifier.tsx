import { useState } from 'react'
import { Slider } from '@/components/ui/controls'
import { Badge } from '@/components/ui/primitives'
import { ForestPlot, type ForestRow } from '@/components/ForestPlot'
import { Legend } from '@/components/ChartKit'
import { pct } from '@/lib/utils'
import { classifyNI, VERDICT } from '@/lib/ni'

/** Drag a result and see how it is classified against the margin. */
export function NiClassifier({ initialMargin = 0.1 }: { initialMargin?: number }) {
  const [est, setEst] = useState(-0.02)
  const [half, setHalf] = useState(0.05)
  const [margin, setMargin] = useState(initialMargin)
  const lo = est - half
  const hi = est + half
  const v = classifyNI(lo, hi, margin)
  const rows: ForestRow[] = [{ label: 'Your trial', est, lo, hi, emphasis: 'overall' }]
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="Observed difference (new − control)" value={est} min={-0.2} max={0.12} step={0.005} onChange={setEst} format={(x) => pct(x, 1)} />
        <Slider label="95% CI half-width" value={half} min={0.01} max={0.12} step={0.005} onChange={setHalf} format={(x) => pct(x, 1)} />
        <Slider label="Margin M" value={margin} min={0.02} max={0.15} step={0.005} onChange={setMargin} format={(x) => pct(x, 1)} />
      </div>
      <div className="mt-2">
        <Legend
          items={[
            { label: 'Unacceptable region (< −M)', color: 'var(--bad-soft)', kind: 'area' },
            { label: 'No difference', color: 'var(--axis)', kind: 'line' },
          ]}
        />
        <ForestPlot
          rows={rows}
          domain={[-0.25, 0.15]}
          ticks={[-0.2, -0.1, 0, 0.1]}
          tickFormat={(x) => pct(x, 0)}
          refLines={[{ x: 0, label: '0', color: 'var(--axis)' }]}
          shade={{ from: -0.25, to: -margin, color: 'var(--bad-soft)' }}
          labelWidth={90}
          xLabel="Difference in success rate (new − control); higher is better"
        />
      </div>
      <div className="mt-2 flex flex-wrap items-start gap-2 text-sm" aria-live="polite">
        <Badge tone={VERDICT[v].tone}>{VERDICT[v].label}</Badge>
        <span className="text-ink-2">
          CI {pct(lo, 1)} to {pct(hi, 1)}. {VERDICT[v].text}
        </span>
      </div>
    </div>
  )
}
