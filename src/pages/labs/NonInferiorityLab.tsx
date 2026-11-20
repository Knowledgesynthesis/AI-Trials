import { useState } from 'react'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { Slider } from '@/components/ui/controls'
import { Badge, Card, CardBody, CardHeader, Stat } from '@/components/ui/primitives'
import { ForestPlot, type ForestRow } from '@/components/ForestPlot'
import { Legend } from '@/components/ChartKit'
import { Callout } from '@/components/Callout'
import { Markdown } from '@/components/Markdown'
import { NiClassifier } from '@/components/widgets/NiClassifier'
import { VERDICT, classifyNI } from '@/lib/ni'
import { normQuantile } from '@/lib/stats/distributions'
import { pct } from '@/lib/utils'

const SCENARIOS: Array<{ label: string; est: number; half: number }> = [
  { label: 'A', est: 0.04, half: 0.03 },
  { label: 'B', est: 0.01, half: 0.04 },
  { label: 'C', est: -0.025, half: 0.02 },
  { label: 'D', est: -0.03, half: 0.06 },
  { label: 'E', est: -0.14, half: 0.025 },
  { label: 'F', est: 0.0, half: 0.12 },
]

export default function NonInferiorityLab() {
  // Historical evidence: active control vs placebo, success-rate difference
  const [histEst, setHistEst] = useState(0.2)
  const [histHalf, setHistHalf] = useState(0.08)
  const [discount, setDiscount] = useState(0)
  const [preserve, setPreserve] = useState(0.5)
  // New trial: experimental vs active control
  const [est, setEst] = useState(-0.015)
  const [se, setSe] = useState(0.022)

  const m1 = Math.max(0, (histEst - histHalf) * (1 - discount))
  const m2 = m1 * (1 - preserve)
  const z = normQuantile(0.975)
  const lo = est - z * se
  const hi = est + z * se
  const verdict = classifyNI(lo, hi, m2)
  // Synthesis method preview: effect of new vs putative placebo
  const putative = est + histEst
  const putativeSe = Math.sqrt(se * se + (histHalf / z) ** 2)

  const rows: ForestRow[] = [
    ...SCENARIOS.map((s) => {
      const v = classifyNI(s.est - s.half, s.est + s.half, m2)
      return { label: `${s.label} · ${VERDICT[v].label.split(',')[0].split(' (')[0]}`, est: s.est, lo: s.est - s.half, hi: s.est + s.half }
    }),
    { label: 'Your trial', est, lo, hi, emphasis: 'overall' as const },
  ]

  const controls = (
    <>
      <ControlCard title="1 · Historical evidence (control vs placebo)">
        <Slider label="Pooled effect of active control" value={histEst} min={0.05} max={0.4} step={0.005} onChange={setHistEst} format={(v) => pct(v, 1)} />
        <Slider label="95% CI half-width of that effect" value={histHalf} min={0.01} max={0.2} step={0.005} onChange={setHistHalf} format={(v) => pct(v, 1)} />
        <Slider
          label="Discount for constancy doubts"
          value={discount}
          min={0}
          max={0.5}
          step={0.05}
          onChange={setDiscount}
          format={(v) => pct(v, 0)}
          hint="Shrink M1 if standard of care, populations or endpoints have changed since the historical trials."
        />
        <Slider label="Fraction of control effect to preserve" value={preserve} min={0} max={0.9} step={0.05} onChange={setPreserve} format={(v) => pct(v, 0)} />
      </ControlCard>
      <ControlCard title="2 · Your NI trial (new − control)">
        <Slider label="Observed difference" value={est} min={-0.15} max={0.1} step={0.005} onChange={setEst} format={(v) => pct(v, 1)} />
        <Slider label="Standard error" value={se} min={0.005} max={0.06} step={0.001} onChange={setSe} format={(v) => pct(v, 1)} />
      </ControlCard>
    </>
  )

  return (
    <LabLayout
      id="non-inferiority"
      lead="A non-inferiority trial can only show that a new treatment is 'not much worse' than an active control — and only if you can argue, from external evidence, how much better than placebo that control is in your trial."
      controls={controls}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="M1 (whole control effect, conservative)" value={pct(m1, 1)} sub="lower 95% limit, discounted" />
        <Stat label="M2 (clinical margin)" value={pct(m2, 1)} sub={`preserves ${pct(preserve, 0)} of M1`} />
        <Stat label="Your 95% CI" value={`${pct(lo, 1)} to ${pct(hi, 1)}`} />
        <Stat label="Verdict vs M2" value={VERDICT[verdict].label.split(',')[0].split(' (')[0]} tone={VERDICT[verdict].tone === 'info' ? 'warn' : VERDICT[verdict].tone} />
      </div>

      <Card>
        <CardHeader title="Reading NI results against the margin" subtitle="Six textbook patterns (A–F) plus your trial, classified against M2." />
        <CardBody>
          <Legend
            className="mb-2"
            items={[
              { label: `Unacceptable (< −M2 = ${pct(-m2, 1)})`, color: 'var(--bad-soft)', kind: 'area' },
              { label: 'No difference', color: 'var(--axis)', kind: 'line' },
              { label: '−M1', color: 'var(--series-2)', kind: 'dash' },
            ]}
          />
          <ForestPlot
            rows={rows}
            domain={[-0.25, 0.15]}
            ticks={[-0.2, -0.1, 0, 0.1]}
            tickFormat={(v) => pct(v, 0)}
            refLines={[
              { x: 0, label: '0', color: 'var(--axis)' },
              { x: -m1, label: '−M1', color: 'var(--series-2)', dashed: true },
            ]}
            shade={{ from: -0.25, to: -m2, color: 'var(--bad-soft)' }}
            labelWidth={200}
            xLabel="Difference in success rate (new − control); higher is better"
          />
          <div className="mt-3 flex flex-wrap items-start gap-2 text-sm">
            <Badge tone={VERDICT[verdict].tone}>{VERDICT[verdict].label}</Badge>
            <span className="text-ink-2">{VERDICT[verdict].text}</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Cross-check: the synthesis method" subtitle="Combines your trial with the historical estimate to infer the new treatment's effect versus a putative placebo." />
        <CardBody>
          <Markdown compact>{`Effect of new vs placebo ≈ (new − control) + (control − placebo) = ${pct(est, 1)} + ${pct(histEst, 1)} = **${pct(putative, 1)}**, 95% CI ${pct(putative - z * putativeSe, 1)} to ${pct(putative + z * putativeSe, 1)}. It is ${putative - z * putativeSe > 0 ? '**better than placebo**' : '**not shown to beat placebo**'}; it retains ≈ ${pct(Math.max(0, putative / histEst), 0)} of the control's effect (point estimate). The synthesis method is more efficient than the fixed-margin (95–95) method but relies even more heavily on the constancy assumption.`}</Markdown>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="regulatory"
          md={`FDA's 2016 NI guidance: M1 is the effect of the active control vs placebo that can reliably be assumed in the new trial (typically the conservative limit of a meta-analysis, discounted when constancy is doubtful); M2 is the largest loss of effect that is clinically acceptable and is usually a fraction of M1 (preserving ≥ 50% is common). EMA's 2005 guideline on choosing the margin follows the same logic.`}
        />
        <Callout
          tone="pitfall"
          title="ITT is not automatically conservative in NI"
          md="Poor adherence, crossovers and measurement noise push both arms toward each other — toward *apparent* non-inferiority. Pre-specify an estimand that matches the question (often treatment policy), handle intercurrent events explicitly, and show the conclusion is robust in supportive analyses."
        />
        <Callout
          tone="key"
          title="Assay sensitivity and biocreep"
          md="An NI trial can 'succeed' even if neither drug works — e.g. in a population or setting where the control's effect has vanished. Repeated NI trials, each against the last 'non-inferior' drug, can slide toward placebo (**biocreep**). Include a placebo or a third arm when ethical; otherwise defend constancy explicitly."
        />
        <Callout
          tone="formula"
          title="Equivalence"
          md="Two one-sided tests (TOST) at level α each: conclude equivalence when the **(1 − 2α) CI** — the 90% CI for α = 0.05 — lies entirely within (−M, +M). Common in bioequivalence (80–125% on the ratio scale)."
        />
      </div>

      <section>
        <h2 className="mb-2 text-base font-semibold">Practice: classify by eye</h2>
        <NiClassifier />
      </section>
    </LabLayout>
  )
}
