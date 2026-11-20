import { useMemo, useState } from 'react'
import { CartesianGrid, LabelList, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { Shuffle } from 'lucide-react'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { Segmented, Slider } from '@/components/ui/controls'
import { Button } from '@/components/ui/primitives'
import { ChartFrame, TooltipBox } from '@/components/ChartKit'
import { axisProps, gridProps, SERIES } from '@/lib/chart'
import { Callout } from '@/components/Callout'
import { useCompute } from '@/lib/useCompute'
import { SCHEME_LABELS, sampleSequence, type Scheme, type SchemeSummary } from '@/lib/stats/randomization'
import { cn, fmt, pct } from '@/lib/utils'

export default function RandomizationLab() {
  const [n, setN] = useState(100)
  const [x1, setX1] = useState(0.3)
  const [x2, setX2] = useState(0.5)
  const [seed, setSeed] = useState(17)
  const [seqScheme, setSeqScheme] = useState<Scheme>('block4')

  const { data, loading } = useCompute<'randomization', SchemeSummary[]>('randomization', {
    n,
    prevalenceX1: x1,
    prevalenceX2: x2,
    reps: 2000,
    seed,
  })

  const seq = useMemo(() => sampleSequence(seqScheme === 'stratified' || seqScheme === 'minimization' ? 'block4' : seqScheme, 32, seed), [seqScheme, seed])

  const controls = (
    <ControlCard title="Trial">
      <Slider label="Patients" value={n} min={20} max={400} step={10} onChange={setN} />
      <Slider label="Prevalence of prognostic factor 1" value={x1} min={0.05} max={0.6} step={0.05} onChange={setX1} format={(v) => pct(v, 0)} hint="e.g. diabetes — the factor whose balance we track" />
      <Slider label="Prevalence of factor 2" value={x2} min={0.1} max={0.9} step={0.05} onChange={setX2} format={(v) => pct(v, 0)} hint="e.g. age ≥ 65" />
      <Button variant="secondary" className="w-full" onClick={() => setSeed((s) => s + 1)}>
        <Shuffle className="h-4 w-4" /> New random seed
      </Button>
      <p className="text-xs text-muted">2,000 simulated trials per scheme · seed {seed}</p>
    </ControlCard>
  )

  return (
    <LabLayout
      id="randomization"
      lead="Every scheme buys balance with predictability. This lab measures both: how far arms drift apart, and how often a recruiter who has seen past assignments can guess the next one."
      controls={controls}
    >
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface-2 text-left text-xs text-ink-2">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Scheme</th>
              <th className="px-3 py-2.5 text-right font-semibold">Mean |n<sub>A</sub> − n<sub>B</sub>|</th>
              <th className="px-3 py-2.5 text-right font-semibold">95th percentile</th>
              <th className="px-3 py-2.5 text-right font-semibold">P(imbalance &gt; 10%)</th>
              <th className="px-3 py-2.5 text-right font-semibold">Factor-1 imbalance</th>
              <th className="px-4 py-2.5 text-right font-semibold">Guessable</th>
            </tr>
          </thead>
          <tbody className={cn('tabular', loading && 'opacity-50')}>
            {(data ?? []).map((r) => (
              <tr key={r.scheme} className="border-t border-line">
                <td className="px-4 py-2.5 font-medium">{SCHEME_LABELS[r.scheme]}</td>
                <td className="px-3 py-2.5 text-right">{fmt(r.meanAbsImbalance, 1)}</td>
                <td className="px-3 py-2.5 text-right">{fmt(r.p95AbsImbalance, 0)}</td>
                <td className="px-3 py-2.5 text-right">{pct(r.probImbalanceOver10pct, 1)}</td>
                <td className="px-3 py-2.5 text-right">{fmt(r.meanFactorImbalance, 1)}</td>
                <td className={cn('px-4 py-2.5 text-right font-medium', r.guessAccuracy > 0.6 && 'text-warn')}>{pct(r.guessAccuracy, 0)}</td>
              </tr>
            ))}
            {!data && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Simulating…
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="border-t border-line px-4 py-2 text-xs text-muted">
          “Guessable” = share of assignments correctly predicted by the Blackwell–Hodges convergence strategy (guess the arm that is behind; for minimisation, the
          arm the algorithm prefers). 50% means unpredictable. “Factor-1 imbalance” = |patients with factor 1 in A − in B|.
        </p>
      </div>

      {data && (
        <ChartFrame
          title="The trade-off: predictability vs prognostic balance"
          subtitle="Lower-left is better on both. No scheme sits there — which is why allocation must be concealed and blocks varied."
          height={300}
        >
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 16, right: 24, bottom: 20, left: 4 }}>
              <CartesianGrid {...gridProps} vertical />
              <XAxis
                type="number"
                dataKey="guess"
                domain={[0.45, 'auto']}
                tickFormatter={(v) => pct(v, 0)}
                {...axisProps}
                label={{ value: 'Guessable assignments', position: 'insideBottom', offset: -10 }}
              />
              <YAxis type="number" dataKey="factor" {...axisProps} width={40} label={{ value: 'Factor imbalance', angle: -90, position: 'insideLeft', offset: 10 }} />
              <Tooltip
                cursor={false}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={payload[0].payload.name}
                      rows={[
                        { label: 'Guessable', value: pct(payload[0].payload.guess, 1) },
                        { label: 'Factor imbalance', value: fmt(payload[0].payload.factor, 2) },
                      ]}
                    />
                  ) : null
                }
              />
              <Scatter
                data={data.map((d) => ({ name: SCHEME_LABELS[d.scheme].split(',')[0].split('(')[0].trim(), guess: d.guessAccuracy, factor: d.meanFactorImbalance }))}
                fill={SERIES.s1}
                stroke="var(--surface)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                <LabelList dataKey="name" position="top" offset={8} style={{ fill: 'var(--ink-2)', fontSize: 11 }} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartFrame>
      )}

      <section className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">What a recruiter sees: the first 32 assignments</h2>
          <Segmented
            size="sm"
            value={seqScheme}
            onChange={setSeqScheme}
            options={[
              { value: 'simple', label: 'Simple' },
              { value: 'block4', label: 'Blocks of 4' },
              { value: 'blockRandom', label: 'Random 2/4/6' },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-1" aria-label="Allocation sequence">
          {seq.map((a, i) => {
            const forced = seqScheme === 'block4' && i % 4 === 3
            return (
              <div
                key={i}
                title={`Patient ${i + 1}: arm ${a === 0 ? 'A' : 'B'}${forced ? ' — fully predictable (last in block)' : ''}`}
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-md text-xs font-semibold text-white',
                  forced && 'ring-2 ring-warn ring-offset-2 ring-offset-[var(--surface)]',
                )}
                style={{ background: a === 0 ? SERIES.s1 : SERIES.s2 }}
              >
                {a === 0 ? 'A' : 'B'}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-sm text-ink-2">
          {seqScheme === 'block4'
            ? 'Outlined cells are the 4th patient of each block: anyone who has tracked the block knows the assignment with certainty, and often the 3rd as well. In an open-label trial that invites selective enrolment.'
            : seqScheme === 'blockRandom'
              ? 'Varying block size (2, 4 or 6, chosen at random) keeps balance tight while making the end of a block hard to detect.'
              : 'Simple randomization is perfectly unpredictable, but runs of the same arm are common and small trials can end noticeably unequal.'}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="evidence"
          title="Concealment matters more than the sequence"
          md="In 250 trials from 33 meta-analyses, trials with inadequate allocation concealment reported odds ratios exaggerated by about 41% (unclear concealment: 30%) compared with adequately concealed trials (Schulz et al., *JAMA* 1995). Concealment — central web/IVRS randomization, sealed opaque envelopes at minimum — protects the sequence *before* assignment; blinding protects it *after*."
        />
        <Callout
          tone="practice"
          title="Choosing a scheme"
          md={`- **Large trials (n > ~200):** simple or blocked randomization is fine; chance imbalance is small.
- **Small or multicentre trials:** permuted blocks of *random* size, stratified by centre and 1–3 strong prognostic factors.
- **Many prognostic factors:** minimisation with a random element (accepted by ICH E9 and EMA), ideally run centrally so it cannot be anticipated.
- **Always** adjust the analysis for the stratification factors (EMA 2015; FDA 2023 covariate-adjustment guidance) — ignoring them makes tests conservative.`}
        />
      </div>
    </LabLayout>
  )
}
