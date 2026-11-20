import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { Select } from '@/components/ui/controls'
import { Badge, Button } from '@/components/ui/primitives'
import { Callout } from '@/components/Callout'
import { cn } from '@/lib/utils'

type Strategy = 'treatment-policy' | 'hypothetical' | 'composite' | 'while-on-treatment' | 'principal-stratum'
type IceKind = 'death' | 'rescue' | 'discontinuation' | 'switch' | 'other'

interface Ice {
  id: number
  label: string
  kind: IceKind
  strategy: Strategy
}

interface Spec {
  population: string
  treatment: string
  variable: string
  summary: string
  ices: Ice[]
}

const STRATEGIES: Record<Strategy, { name: string; question: string; data: string; estimation: string; caution: string }> = {
  'treatment-policy': {
    name: 'Treatment policy',
    question: 'The event is part of the treatment strategy being compared; the outcome is used whatever happens.',
    data: 'Keep following patients and measuring the outcome after the event (including after stopping study drug). Retention after discontinuation is the critical design feature.',
    estimation: 'Analyse all randomized patients as randomized. Remaining missing data need an assumption consistent with the strategy (e.g. reference- or retrieved-dropout-based imputation), not MAR on on-treatment data.',
    caution: 'Answers a pragmatic question ("what happens if we start this drug?"). The effect is diluted by rescue/switching that may differ from practice. Not definable for outcomes after death.',
  },
  hypothetical: {
    name: 'Hypothetical',
    question: 'The effect in a precisely specified scenario in which the event would not occur.',
    data: 'Collect data up to the event and the covariates that predict both the event and the outcome; post-event data are not used for this estimand but help sensitivity analyses.',
    estimation: 'Model-based (e.g. MMRM or multiple imputation under MAR given observed history; inverse-probability weighting). Untestable assumptions → sensitivity analyses (tipping point, δ-adjustment) are mandatory.',
    caution: 'The scenario must be clinically meaningful: "if rescue medication were not available" can be; "if patients had not died" usually is not.',
  },
  composite: {
    name: 'Composite variable',
    question: 'The event itself carries information about outcome and is built into the endpoint (e.g. counted as treatment failure or worst rank).',
    data: 'Record the event and its timing precisely; the endpoint definition must state how it is combined.',
    estimation: 'Responder analysis, ranking methods (e.g. win ratio, trimmed means) or a composite time-to-event endpoint.',
    caution: 'Changes the variable: a continuous endpoint usually becomes binary or ordinal. Components of very different clinical weight make interpretation hard.',
  },
  'while-on-treatment': {
    name: 'While on treatment / while alive',
    question: 'The response before the event occurs (e.g. symptoms while on drug, or while alive).',
    data: 'Outcome data up to the event; time to the event.',
    estimation: 'Summaries over the observed period (e.g. average over time on treatment, days alive and free of an outcome).',
    caution: 'If arms differ in how long patients stay on treatment (or alive), the comparison can mislead: a drug that kills sick patients early can look better "while alive".',
  },
  'principal-stratum': {
    name: 'Principal stratum',
    question: 'The effect in the subpopulation in which the event would not occur under either treatment (e.g. patients who would tolerate both).',
    data: 'Rich baseline and post-baseline data to model the unobservable stratum membership.',
    estimation: 'Requires strong, untestable assumptions (e.g. monotonicity, principal ignorability); bounds or sensitivity analyses.',
    caution: 'Stratum membership is never observed for an individual, so the target population cannot be enrolled or identified in practice.',
  },
}

const PRESETS: Record<string, Spec> = {
  diabetes: {
    population: 'Adults with type 2 diabetes inadequately controlled on metformin (HbA1c 7.5–10.0%)',
    treatment: 'New oral agent + metformin vs placebo + metformin, for 26 weeks',
    variable: 'Change in HbA1c from baseline to week 26',
    summary: 'Difference in means',
    ices: [
      { id: 1, label: 'Initiation of rescue medication for hyperglycaemia', kind: 'rescue', strategy: 'treatment-policy' },
      { id: 2, label: 'Discontinuation of study drug due to adverse event', kind: 'discontinuation', strategy: 'treatment-policy' },
    ],
  },
  depression: {
    population: 'Adults with major depressive disorder, MADRS ≥ 26',
    treatment: 'Drug X 20 mg daily vs placebo for 8 weeks',
    variable: 'Change in MADRS total score from baseline to week 8',
    summary: 'Difference in means',
    ices: [
      { id: 1, label: 'Discontinuation due to lack of efficacy', kind: 'discontinuation', strategy: 'composite' },
      { id: 2, label: 'Discontinuation due to adverse event', kind: 'discontinuation', strategy: 'hypothetical' },
      { id: 3, label: 'Start of a prohibited antidepressant', kind: 'rescue', strategy: 'hypothetical' },
    ],
  },
  oncology: {
    population: 'Previously untreated advanced NSCLC, PD-L1 ≥ 50%',
    treatment: 'Drug Y every 3 weeks vs platinum doublet',
    variable: 'Time from randomization to death from any cause (overall survival)',
    summary: 'Hazard ratio (with restricted mean survival time difference as supplementary)',
    ices: [
      { id: 1, label: 'Start of subsequent anticancer therapy, including crossover to Drug Y', kind: 'switch', strategy: 'treatment-policy' },
      { id: 2, label: 'Discontinuation of randomized treatment', kind: 'discontinuation', strategy: 'treatment-policy' },
    ],
  },
  covid: {
    population: 'Adults hospitalised with COVID-19 pneumonia requiring supplemental oxygen',
    treatment: 'Usual care + Drug Z vs usual care alone',
    variable: 'Days alive and free of respiratory support up to day 28',
    summary: 'Difference in means (or proportional-odds ratio)',
    ices: [{ id: 1, label: 'Death before day 28', kind: 'death', strategy: 'composite' }],
  },
}

let nextId = 100

function warningsFor(spec: Spec): Array<{ tone: 'bad' | 'warn'; text: string }> {
  const w: Array<{ tone: 'bad' | 'warn'; text: string }> = []
  for (const ice of spec.ices) {
    if (ice.kind === 'death' && ice.strategy === 'treatment-policy')
      w.push({ tone: 'bad', text: `“${ice.label}”: a treatment-policy strategy needs the outcome after the event — impossible after death unless the variable is itself survival or a composite including death.` })
    if (ice.kind === 'death' && ice.strategy === 'hypothetical')
      w.push({ tone: 'bad', text: `“${ice.label}”: “what if patients had not died” is rarely a clinically meaningful scenario. Prefer composite or while-alive.` })
    if (ice.kind === 'switch' && ice.strategy === 'hypothetical')
      w.push({ tone: 'warn', text: `“${ice.label}”: a hypothetical “no switching” effect needs methods such as IPCW or RPSFT with strong assumptions; regulators typically want treatment policy as primary.` })
    if (ice.strategy === 'principal-stratum')
      w.push({ tone: 'warn', text: `“${ice.label}”: principal-stratum estimands need untestable assumptions; justify and plan sensitivity analyses.` })
    if (ice.strategy === 'while-on-treatment')
      w.push({ tone: 'warn', text: `“${ice.label}”: check that time on treatment is similar across arms; otherwise the comparison is not like-for-like.` })
  }
  if (/hazard ratio/i.test(spec.summary))
    w.push({
      tone: 'warn',
      text: 'Hazard ratios average over time and are non-collapsible; under non-proportional hazards they are hard to interpret causally. A difference in restricted mean survival time or survival at a landmark is a useful complementary summary.',
    })
  if (spec.ices.length === 0)
    w.push({ tone: 'warn', text: 'No intercurrent events listed. Almost every trial has some (discontinuation, rescue, switching, death). Think again before concluding there are none.' })
  return w
}

function statement(spec: Spec): string {
  const ices =
    spec.ices.length === 0
      ? ''
      : ' Intercurrent events are handled as follows: ' +
        spec.ices
          .map((i) => {
            const s = STRATEGIES[i.strategy].name.toLowerCase()
            const how =
              i.strategy === 'treatment-policy'
                ? 'the outcome is used regardless of its occurrence'
                : i.strategy === 'hypothetical'
                  ? 'the outcome is targeted as if it had not occurred'
                  : i.strategy === 'composite'
                    ? 'its occurrence is incorporated into the outcome (e.g. as treatment failure)'
                    : i.strategy === 'while-on-treatment'
                      ? 'only the response before it occurs is of interest'
                      : 'the effect is targeted in patients in whom it would not occur under either treatment'
            return `${i.label.charAt(0).toLowerCase() + i.label.slice(1)} — ${s} strategy (${how})`
          })
          .join('; ') +
        '.'
  return `The ${spec.summary.toLowerCase()} in ${spec.variable.charAt(0).toLowerCase() + spec.variable.slice(1)} between ${spec.treatment.charAt(0).toLowerCase() + spec.treatment.slice(1)}, in ${spec.population.charAt(0).toLowerCase() + spec.population.slice(1)}.${ices}`
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea
        value={value}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm"
      />
    </label>
  )
}

export default function EstimandLab() {
  const [preset, setPreset] = useState('diabetes')
  const [spec, setSpec] = useState<Spec>(PRESETS.diabetes)
  const update = (patch: Partial<Spec>) => setSpec((s) => ({ ...s, ...patch }))
  const warnings = warningsFor(spec)

  const controls = (
    <>
      <ControlCard title="Start from a scenario">
        <Select
          label="Scenario"
          value={preset}
          onChange={(v) => {
            setPreset(v)
            setSpec(PRESETS[v])
          }}
          options={[
            { value: 'diabetes', label: 'Type 2 diabetes (rescue medication)' },
            { value: 'depression', label: 'Depression (discontinuations)' },
            { value: 'oncology', label: 'Oncology OS (crossover)' },
            { value: 'covid', label: 'Hospitalised COVID-19 (death)' },
          ]}
        />
        <p className="text-xs text-muted">Edit anything below; the statement and review update live.</p>
      </ControlCard>
      <ControlCard title="Attributes 1–3 and 5">
        <Field label="Population" value={spec.population} onChange={(v) => update({ population: v })} />
        <Field label="Treatment conditions" value={spec.treatment} onChange={(v) => update({ treatment: v })} />
        <Field label="Variable (endpoint)" value={spec.variable} onChange={(v) => update({ variable: v })} />
        <Field label="Population-level summary" value={spec.summary} onChange={(v) => update({ summary: v })} />
      </ControlCard>
    </>
  )

  return (
    <LabLayout
      id="estimands"
      wideControls
      lead="An estimand is the precise treatment effect the trial is meant to estimate. ICH E9(R1) requires five attributes; the hard part is attribute 4 — what to do about events that happen after randomization and change the meaning of the outcome."
      controls={controls}
    >
      <section className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Attribute 4 · Intercurrent events and strategies</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => update({ ices: [...spec.ices, { id: nextId++, label: 'New intercurrent event', kind: 'other', strategy: 'treatment-policy' }] })}
          >
            <Plus className="h-4 w-4" /> Add event
          </Button>
        </div>
        <div className="space-y-4">
          {spec.ices.map((ice) => {
            const st = STRATEGIES[ice.strategy]
            const set = (patch: Partial<Ice>) => update({ ices: spec.ices.map((x) => (x.id === ice.id ? { ...x, ...patch } : x)) })
            return (
              <div key={ice.id} className="rounded-lg border border-line p-3">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_220px_auto] md:items-end">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-2">Event</span>
                    <input
                      value={ice.label}
                      onChange={(e) => set({ label: e.target.value })}
                      className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm"
                    />
                  </label>
                  <Select
                    label={<span className="text-xs text-ink-2">Type</span>}
                    value={ice.kind}
                    onChange={(v) => set({ kind: v })}
                    options={[
                      { value: 'discontinuation', label: 'Treatment discontinuation' },
                      { value: 'rescue', label: 'Rescue / prohibited medication' },
                      { value: 'switch', label: 'Switching / crossover' },
                      { value: 'death', label: 'Death' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                  <Select
                    label={<span className="text-xs text-ink-2">Strategy</span>}
                    value={ice.strategy}
                    onChange={(v) => set({ strategy: v })}
                    options={(Object.keys(STRATEGIES) as Strategy[]).map((k) => ({ value: k, label: STRATEGIES[k].name }))}
                  />
                  <Button variant="ghost" size="sm" aria-label="Remove event" onClick={() => update({ ices: spec.ices.filter((x) => x.id !== ice.id) })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold text-ink-2">Question answered</dt>
                    <dd>{st.question}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-ink-2">Data you must collect</dt>
                    <dd>{st.data}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-ink-2">Estimation</dt>
                    <dd>{st.estimation}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-ink-2">Watch out</dt>
                    <dd>{st.caution}</dd>
                  </div>
                </dl>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-accent/40 bg-accent-soft p-4">
        <h2 className="mb-2 text-sm font-semibold">Estimand statement</h2>
        <p className="leading-relaxed">{statement(spec)}</p>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Review</h2>
        {warnings.length === 0 ? (
          <p className="text-sm text-good">No structural problems detected. Now check that the estimator, the handling of missing data and the sensitivity analyses all target this same estimand.</p>
        ) : (
          <ul className="space-y-2">
            {warnings.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <Badge tone={w.tone} className="mt-0.5 shrink-0">
                  {w.tone === 'bad' ? 'Problem' : 'Check'}
                </Badge>
                <span>{w.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="key"
          title="Intercurrent events ≠ missing data"
          md="Rescue medication is an *event* that changes what the outcome means; a missed visit is *missing data*. Decide the strategy for each event first (that defines the estimand); only then choose how to handle data that are genuinely missing for that estimand."
        />
        <Callout
          tone="regulatory"
          md="ICH E9(R1) (adopted 2019; FDA final 2021) requires the estimand to be specified in the protocol, aligned with the trial objective, and followed through to estimator, sensitivity analyses and reporting. SPIRIT 2025 and CONSORT 2025 ask for the estimand where relevant."
        />
      </div>
      <p className={cn('text-xs text-muted')}>
        Strategy definitions follow ICH E9(R1) §A.3.
      </p>
    </LabLayout>
  )
}
