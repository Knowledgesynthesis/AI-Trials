import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { Slider } from '@/components/ui/controls'
import { Card, CardBody, CardHeader, Stat } from '@/components/ui/primitives'
import { ChartFrame, TooltipBox } from '@/components/ChartKit'
import { axisProps, gridProps, niceTicks, SERIES } from '@/lib/chart'
import { Callout } from '@/components/Callout'
import { defaultEnrichment, enrichmentCurve, groupMetrics, makePopulation, type EnrichmentParams } from '@/lib/stats/enrichment'
import { covariateAdjustmentFactor } from '@/lib/stats/sampleSize'
import { cn, fmt, fmtInt, pct } from '@/lib/utils'

const GRID = Array.from({ length: 19 }, (_, i) => 0.1 + i * 0.05)

export default function EnrichmentLab() {
  const [p, setP] = useState<EnrichmentParams>(defaultEnrichment)
  const [q, setQ] = useState(0.4)
  const [rho, setRho] = useState(0.5)
  const set = (patch: Partial<EnrichmentParams>) => setP((x) => ({ ...x, ...patch }))

  const pop = useMemo(() => makePopulation(p), [p])
  const curve = useMemo(() => enrichmentCurve(pop, p.rrr, GRID), [pop, p.rrr])
  const [all, chosen] = useMemo(() => enrichmentCurve(pop, p.rrr, [1, q]), [pop, p.rrr, q])
  const gA = useMemo(() => groupMetrics(pop, 0), [pop])
  const gB = useMemo(() => groupMetrics(pop, 1), [pop])
  const popShareB = gB.n / pop.length

  // all-comers trial with prognostic covariate adjustment (continuous-outcome approximation 1 − ρ²)
  const adjN = Math.ceil(all.nPerArm * covariateAdjustmentFactor(rho))

  const chartData = curve.map((c) => ({ q: c.fractionEnrolled, randomized: 2 * c.nPerArm, screened: c.screened, shareB: c.shareB, sensA: c.sensitivityA, sensB: c.sensitivityB }))

  const controls = (
    <>
      <ControlCard title="Population (synthetic)">
        <Slider label="Share of group B" value={p.propB} min={0.05} max={0.5} step={0.05} onChange={(v) => set({ propB: v })} format={(v) => pct(v, 0)} />
        <Slider label="True mean risk, group A" value={p.baseRiskA} min={0.04} max={0.3} step={0.01} onChange={(v) => set({ baseRiskA: v })} format={(v) => pct(v, 0)} />
        <Slider label="True mean risk, group B" value={p.baseRiskB} min={0.04} max={0.3} step={0.01} onChange={(v) => set({ baseRiskB: v })} format={(v) => pct(v, 0)} />
        <Slider label="Treatment relative risk reduction" value={p.rrr} min={0.1} max={0.5} step={0.05} onChange={(v) => set({ rrr: v })} format={(v) => pct(v, 0)} />
      </ControlCard>
      <ControlCard title="Risk model">
        <Slider
          label="Model noise (lower = better discrimination)"
          value={p.modelNoise}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => set({ modelNoise: v })}
          format={(v) => fmt(v, 1)}
        />
        <Slider
          label="Under-prediction for group B (logit)"
          value={p.biasB}
          min={0}
          max={1.5}
          step={0.1}
          onChange={(v) => set({ biasB: v })}
          format={(v) => fmt(v, 1)}
          hint="e.g. trained on a proxy label such as healthcare cost, which under-records need in groups with less access (Obermeyer 2019)."
        />
      </ControlCard>
      <ControlCard title="Enrolment rule">
        <Slider label="Enrol top fraction by predicted risk" value={q} min={0.1} max={1} step={0.05} onChange={setQ} format={(v) => pct(v, 0)} />
      </ControlCard>
    </>
  )

  return (
    <LabLayout
      id="enrichment"
      lead="Prognostic enrichment uses a risk model to enrol patients more likely to have events, so a smaller trial reaches the same power. The price is screening, generalisability — and, if the model is miscalibrated for a group, who gets to participate."
      controls={controls}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Control event rate" value={pct(chosen.controlRisk, 1)} sub={`all-comers ${pct(all.controlRisk, 1)}`} />
        <Stat label="Randomized (total)" value={fmtInt(2 * chosen.nPerArm)} sub={`all-comers ${fmtInt(2 * all.nPerArm)}`} tone={chosen.nPerArm < all.nPerArm ? 'good' : undefined} />
        <Stat label="Screened" value={fmtInt(chosen.screened)} sub="randomized ÷ fraction enrolled" />
        <Stat label="Group B share" value={pct(chosen.shareB, 1)} sub={`population ${pct(popShareB, 1)}`} tone={chosen.shareB < popShareB * 0.75 ? 'bad' : undefined} />
        <Stat label="High-risk A enrolled" value={pct(chosen.sensitivityA, 0)} sub="of truly high-risk A" />
        <Stat label="High-risk B enrolled" value={pct(chosen.sensitivityB, 0)} sub="of truly high-risk B" tone={chosen.sensitivityB < chosen.sensitivityA - 0.1 ? 'bad' : undefined} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartFrame
          title="Patients randomized vs screened"
          subtitle="Narrower enrolment → fewer randomized, many more screened."
          legend={[
            { label: 'Randomized', color: SERIES.s1 },
            { label: 'Screened', color: SERIES.s2 },
          ]}
        >
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 16, left: 4 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="q" type="number" domain={[0.1, 1]} ticks={[0.2, 0.4, 0.6, 0.8, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} label={{ value: 'Fraction of candidates enrolled', position: 'insideBottom', offset: -8 }} />
              <YAxis ticks={niceTicks(Math.max(...chartData.map((d) => d.screened)))} tickFormatter={(v) => (v >= 10000 ? `${v / 1000}K` : fmtInt(v))} {...axisProps} width={48} />
              <ReferenceLine x={q} stroke="var(--axis)" />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={`Enrol top ${pct(payload[0].payload.q, 0)}`}
                      rows={[
                        { label: 'Randomized', value: fmtInt(payload[0].payload.randomized), color: SERIES.s1 },
                        { label: 'Screened', value: fmtInt(payload[0].payload.screened), color: SERIES.s2 },
                      ]}
                    />
                  ) : null
                }
              />
              <Line dataKey="randomized" stroke={SERIES.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="screened" stroke={SERIES.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
        <ChartFrame
          title="Who gets in: share of high-risk patients enrolled, by group"
          subtitle="With an unbiased model both lines coincide. Bias pushes group B's line down."
          legend={[
            { label: 'Group A', color: SERIES.s1 },
            { label: 'Group B', color: SERIES.s2 },
          ]}
        >
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="q" type="number" domain={[0.1, 1]} ticks={[0.2, 0.4, 0.6, 0.8, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} label={{ value: 'Fraction of candidates enrolled', position: 'insideBottom', offset: -8 }} />
              <YAxis domain={[0, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} width={44} />
              <ReferenceLine x={q} stroke="var(--axis)" />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={`Enrol top ${pct(payload[0].payload.q, 0)}`}
                      rows={[
                        { label: 'High-risk A enrolled', value: pct(payload[0].payload.sensA, 1), color: SERIES.s1 },
                        { label: 'High-risk B enrolled', value: pct(payload[0].payload.sensB, 1), color: SERIES.s2 },
                        { label: 'B share of trial', value: pct(payload[0].payload.shareB, 1) },
                      ]}
                    />
                  ) : null
                }
              />
              <Line dataKey="sensA" stroke={SERIES.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="sensB" stroke={SERIES.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
      </div>

      <Card>
        <CardHeader title="Model audit by group" subtitle="Calibration-in-the-large and discrimination, computed on the synthetic population." />
        <CardBody className="overflow-x-auto pt-3">
          <table className="w-full min-w-[520px] text-sm tabular">
            <thead className="text-left text-xs text-ink-2">
              <tr className="border-b border-line">
                <th className="py-2 pr-3 font-semibold">Group</th>
                <th className="py-2 pr-3 font-semibold">n</th>
                <th className="py-2 pr-3 font-semibold">Mean predicted risk</th>
                <th className="py-2 pr-3 font-semibold">Observed event rate</th>
                <th className="py-2 pr-3 font-semibold">Predicted ÷ observed</th>
                <th className="py-2 font-semibold">AUC</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['A', gA],
                ['B', gB],
              ].map(([name, g]) => {
                const m = g as typeof gA
                const ratio = m.meanPredicted / m.observedRate
                return (
                  <tr key={name as string} className="border-b border-line">
                    <td className="py-2 pr-3 font-medium">{name as string}</td>
                    <td className="py-2 pr-3">{fmtInt(m.n)}</td>
                    <td className="py-2 pr-3">{pct(m.meanPredicted, 1)}</td>
                    <td className="py-2 pr-3">{pct(m.observedRate, 1)}</td>
                    <td className={cn('py-2 pr-3 font-medium', Math.abs(ratio - 1) > 0.2 && 'text-bad')}>{fmt(ratio, 2)}</td>
                    <td className="py-2">{fmt(m.auc, 3)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">
            A group can have a respectable AUC (good <em>ranking</em> within the group) and still be badly <em>calibrated</em>: AUC alone would never have flagged this model.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="The alternative: keep everyone, adjust for the model's score"
          subtitle="Prognostic covariate adjustment gains efficiency without excluding anyone (FDA covariate-adjustment guidance, 2023; EMA qualification of PROCOVA, 2022)."
        />
        <CardBody>
          <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_auto_auto]">
            <Slider label="Correlation ρ between prognostic score and outcome" value={rho} min={0} max={0.8} step={0.05} onChange={setRho} format={(v) => fmt(v, 2)} />
            <Stat label="All-comers, unadjusted" value={fmtInt(2 * all.nPerArm)} />
            <Stat label="All-comers, adjusted" value={fmtInt(2 * adjN)} sub={`× (1 − ρ²) = × ${fmt(1 - rho * rho, 2)}`} tone="good" />
            <Stat label={`Enriched (top ${pct(q, 0)})`} value={fmtInt(2 * chosen.nPerArm)} sub={`${fmtInt(chosen.screened)} screened`} />
          </div>
          <p className="mt-3 text-xs text-muted">
            The (1 − ρ²) factor is exact for ANCOVA on a continuous outcome and an approximation for binary outcomes.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="evidence"
          title="Obermeyer et al., Science 2019"
          md="A widely used commercial algorithm predicted future healthcare *cost* as a proxy for health *need*. Because less was spent on Black patients at the same level of illness, Black patients assigned the same risk score were considerably sicker; correcting the label would have raised the share of Black patients flagged for extra care from 17.7% to 46.5%. The bias came from the label, not from including race as a feature."
        />
        <Callout
          tone="key"
          title="You cannot satisfy every fairness metric at once"
          md="When base rates differ between groups, a non-perfect model cannot be simultaneously calibrated within groups *and* have equal false-positive and false-negative rates (Kleinberg, Mullainathan & Raghavan 2016; Chouldechova 2017). Choose the criterion that matches the decision — for trial enrolment, calibration and equal opportunity for patients at the same true risk are usually the priorities — and report subgroup performance."
        />
        <Callout
          tone="regulatory"
          md="FDA's Enrichment Strategies guidance (2019) distinguishes **prognostic** enrichment (higher event rate) from **predictive** enrichment (more likely to respond) and expects the excluded population to be characterised and, where relevant, studied. A model used to select patients is part of the trial's design: FDA's January 2025 draft AI guidance asks for a risk-based credibility assessment for its context of use."
        />
        <Callout
          tone="practice"
          title="Before enriching with a model"
          md={`- Externally validated in the target population (discrimination **and** calibration), reported per TRIPOD+AI
- Performance reported **by subgroup** (sex, age, race/ethnicity, site)
- Fixed (locked) before enrolment; version-controlled
- Screening burden and excluded population quantified
- Consider covariate adjustment instead, or an enrichment design that still enrols some lower-risk patients`}
        />
      </div>
    </LabLayout>
  )
}
