import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Play } from 'lucide-react'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { Segmented, Slider } from '@/components/ui/controls'
import { Button } from '@/components/ui/primitives'
import { ChartFrame, TooltipBox } from '@/components/ChartKit'
import { axisProps, gridProps, SERIES } from '@/lib/chart'
import { Callout } from '@/components/Callout'
import { useCompute } from '@/lib/useCompute'
import { defaultRarParams, type RarParams, type RarResult } from '@/lib/stats/rar'
import { cn, fmt, pct } from '@/lib/utils'

const PRESETS: Record<string, { label: string; patch: Partial<RarParams> }> = {
  default: { label: '30% vs 45%', patch: { pControl: 0.3, pTreatment: 0.45, drift: 0, lag: 0 } },
  small: { label: '30% vs 36%', patch: { pControl: 0.3, pTreatment: 0.36, drift: 0, lag: 0 } },
  trend: { label: 'No effect + time trend', patch: { pControl: 0.25, pTreatment: 0.25, drift: 0.3, lag: 0, tuning: 'fixed', c: 1, clip: 0.05 } },
  lag: { label: 'Slow endpoint (lag 60)', patch: { pControl: 0.3, pTreatment: 0.45, drift: 0, lag: 60 } },
}

export default function RarLab() {
  const [form, setForm] = useState<RarParams>(defaultRarParams)
  const [committed, setCommitted] = useState<RarParams>(defaultRarParams)
  const set = (patch: Partial<RarParams>) => setForm((f) => ({ ...f, ...patch }))
  const { data, loading, progress } = useCompute<'rar', RarResult>('rar', committed, 0)
  const dirty = JSON.stringify(form) !== JSON.stringify(committed)

  const controls = (
    <>
      <ControlCard title="Scenario">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PRESETS).map(([k, p]) => (
            <Button
              key={k}
              size="sm"
              variant="secondary"
              onClick={() => {
                const next = { ...form, ...p.patch }
                setForm(next)
                setCommitted(next)
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <Slider label="Control response rate" value={form.pControl} min={0.05} max={0.9} step={0.01} onChange={(v) => set({ pControl: v })} format={(v) => pct(v, 0)} />
        <Slider label="Treatment response rate" value={form.pTreatment} min={0.05} max={0.9} step={0.01} onChange={(v) => set({ pTreatment: v })} format={(v) => pct(v, 0)} />
        <Slider label="Patients per trial" value={form.n} min={60} max={500} step={20} onChange={(v) => set({ n: v, burnIn: Math.min(form.burnIn, v) })} />
        <Slider
          label="Time trend (both arms)"
          value={form.drift}
          min={-0.3}
          max={0.3}
          step={0.05}
          onChange={(v) => set({ drift: v })}
          format={(v) => `${v > 0 ? '+' : ''}${pct(v, 0)}`}
          hint="Change in response probability from first to last patient — e.g. a shift in case-mix or standard of care."
        />
      </ControlCard>
      <ControlCard title="Adaptation rule">
        <Segmented
          label="Tuning c"
          value={form.tuning}
          onChange={(v) => set({ tuning: v })}
          options={[
            { value: 'thall', label: 'c = n/(2N)' },
            { value: 'fixed', label: 'Fixed c' },
          ]}
        />
        {form.tuning === 'fixed' && <Slider label="c" value={form.c} min={0} max={1} step={0.05} onChange={(v) => set({ c: v })} format={(v) => fmt(v, 2)} hint="0 = equal allocation; 1 = allocate with probability P(T better)" />}
        <Slider label="Burn-in (1:1)" value={form.burnIn} min={0} max={Math.min(100, form.n)} step={5} onChange={(v) => set({ burnIn: v })} />
        <Slider label="Allocation clipped to" value={form.clip} min={0} max={0.3} step={0.05} onChange={(v) => set({ clip: v })} format={(v) => (v === 0 ? 'none' : `${pct(v, 0)}–${pct(1 - v, 0)}`)} />
        <Slider label="Outcome lag (enrolments)" value={form.lag} min={0} max={150} step={10} onChange={(v) => set({ lag: v })} hint="How many further patients enrol before an outcome is known." />
        <Segmented
          label="Simulated trials"
          value={form.reps}
          onChange={(v) => set({ reps: v })}
          options={[
            { value: 500, label: '500' },
            { value: 1000, label: '1,000' },
            { value: 2000, label: '2,000' },
          ]}
        />
        <Button className="w-full" onClick={() => setCommitted({ ...form, seed: form.seed })} disabled={!dirty && !loading}>
          <Play className="h-4 w-4" /> {dirty ? 'Run simulation' : 'Up to date'}
        </Button>
      </ControlCard>
    </>
  )

  const better = committed.pTreatment > committed.pControl ? 'T' : committed.pTreatment < committed.pControl ? 'C' : null
  const rows = data
    ? ([
        ['Mean share allocated to treatment', pct(data.rar.meanPropT, 1), pct(data.fixed.meanPropT, 1)],
        ['5th–95th percentile of that share', `${pct(data.rar.p05PropT, 0)} – ${pct(data.rar.p95PropT, 0)}`, `${pct(data.fixed.p05PropT, 0)} – ${pct(data.fixed.p95PropT, 0)}`],
        ...(better ? [['P(more patients on the inferior arm)', pct(data.rar.probMoreOnInferior, 1), pct(data.fixed.probMoreOnInferior, 1)]] : []),
        [better ? 'Power (one-sided α 0.025)' : 'Type I error (one-sided α 0.025)', pct(data.rar.rejectRate, 1), pct(data.fixed.rejectRate, 1)],
        ['Mean responders per trial', fmt(data.rar.meanResponders, 1), fmt(data.fixed.meanResponders, 1)],
        ['Mean estimated difference (truth ' + pct(data.trueDiff, 1) + ')', pct(data.rar.meanEstDiff, 2), pct(data.fixed.meanEstDiff, 2)],
      ] as Array<[string, string, string]>)
    : []

  const hist = data
    ? data.rar.histogram.map((h, i) => ({ bin: `${i * 5}–${i * 5 + 5}%`, mid: i * 5 + 2.5, rar: h, fixed: data.fixed.histogram[i] }))
    : []

  return (
    <LabLayout
      id="adaptive-randomization"
      lead="Response-adaptive randomization promises to treat more trial patients with the better arm. Simulate it against plain 1:1 under identical conditions and judge the trade."
      controls={controls}
    >
      {loading && (
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-accent transition-all" style={{ width: `${Math.max(5, progress * 100)}%` }} />
        </div>
      )}
      {data && (
        <div className={cn('space-y-6', loading && 'opacity-60')}>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[520px] text-sm tabular">
              <thead className="bg-surface-2 text-left text-xs text-ink-2">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Across {committed.reps.toLocaleString()} simulated trials</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: SERIES.s1 }} /> RAR
                    </span>
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: SERIES.s2 }} /> Fixed 1:1
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, a, b]) => (
                  <tr key={label} className="border-t border-line">
                    <td className="px-4 py-2.5">{label}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{a}</td>
                    <td className="px-4 py-2.5 text-right">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartFrame
              title="Distribution of the share allocated to treatment"
              subtitle="Each bar: fraction of simulated trials. RAR spreads widely — some trials put most patients on the worse arm."
              legend={[
                { label: 'RAR', color: SERIES.s1, kind: 'area' },
                { label: 'Fixed 1:1', color: SERIES.s2, kind: 'area' },
              ]}
            >
              <ResponsiveContainer>
                <BarChart data={hist} barGap={2} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="mid" type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} {...axisProps} label={{ value: 'Share of patients on treatment', position: 'insideBottom', offset: -8 }} />
                  <YAxis tickFormatter={(v) => pct(v, 0)} {...axisProps} width={44} />
                  <Tooltip
                    cursor={{ fill: 'var(--surface-2)' }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <TooltipBox
                          title={payload[0].payload.bin}
                          rows={[
                            { label: 'RAR', value: pct(payload[0].payload.rar, 1), color: SERIES.s1 },
                            { label: 'Fixed 1:1', value: pct(payload[0].payload.fixed, 1), color: SERIES.s2 },
                          ]}
                        />
                      ) : null
                    }
                  />
                  <Bar dataKey="fixed" fill={SERIES.s2} radius={[4, 4, 0, 0]} maxBarSize={12} isAnimationActive={false} />
                  <Bar dataKey="rar" fill={SERIES.s1} radius={[4, 4, 0, 0]} maxBarSize={12} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
            <ChartFrame title="One trial: probability the next patient gets treatment" subtitle="Trial #1 of the simulation. Early noise drives allocation; the burn-in and clipping limit the damage.">
              <ResponsiveContainer>
                <LineChart data={data.trace} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="patient" type="number" domain={[1, committed.n]} {...axisProps} label={{ value: 'Patient', position: 'insideBottom', offset: -8 }} />
                  <YAxis domain={[0, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} width={44} />
                  <ReferenceLine y={0.5} stroke="var(--axis)" />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <TooltipBox
                          title={`Patient ${payload[0].payload.patient}`}
                          rows={[
                            { label: 'P(assign treatment)', value: pct(payload[0].payload.allocProb, 1), color: SERIES.s1 },
                            { label: 'n treatment / control', value: `${payload[0].payload.nT} / ${payload[0].payload.nC}` },
                          ]}
                        />
                      ) : null
                    }
                  />
                  <Line dataKey="allocProb" stroke={SERIES.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>

          {committed.drift !== 0 && committed.pControl === committed.pTreatment && (
            <Callout
              tone="pitfall"
              title="Time trends + RAR = false positives"
              md={`Both arms have the *same* response rate, but it drifts over time. RAR enrols more treatment patients later (or earlier) by chance, so the naive comparison confounds treatment with calendar time. Type I error here: **${pct(data.rar.rejectRate, 1)}** with RAR vs **${pct(data.fixed.rejectRate, 1)}** with 1:1. Remedies: stratify the analysis by period, keep a fixed control allocation, or use randomization-based tests.`}
            />
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="evidence"
          title="What the methodological literature found"
          md={`In **two-arm** trials, RAR typically needs more patients for the same power, produces highly variable allocation (a real chance of putting *more* patients on the inferior arm) and is biased under time trends (Korn & Freidlin, *JCO* 2011; Thall, Fox & Wathen, *Ann Oncol* 2015; Proschan & Evans, *CID* 2020). Its benefit to trial patients is usually small. Robertson et al. (*Stat Sci* 2023) show the picture is better in **multi-arm** settings with a protected control allocation, burn-in and restriction.`}
        />
        <Callout
          tone="evidence"
          title="The ECMO lesson"
          md="The 1985 Michigan neonatal ECMO trial used randomized play-the-winner: 11 infants received ECMO and survived; **one** received conventional therapy and died. The allocation was too lopsided to persuade anyone; the result was contested for years and further randomized trials (Boston 1989; UK Collaborative 1996) were needed."
        />
        <Callout
          tone="regulatory"
          md="FDA's adaptive design guidance (2019) notes RAR can be useful in multi-arm dose-finding and exploratory settings, but highlights the risks of bias from time trends and inflated error, and expects simulated operating characteristics for such designs."
        />
        <Callout
          tone="practice"
          title="If you use RAR"
          md={`- Prefer multi-arm settings; keep the control allocation fixed (e.g. ≥ 1/K or the √K rule)
- Burn-in with equal allocation; clip allocation probabilities (e.g. 10–90%)
- Short outcome lag relative to accrual
- Analyse with methods robust to drift (stratify by time block) and report simulated operating characteristics`}
        />
      </div>
    </LabLayout>
  )
}
