import { useMemo, useState } from 'react'
import { AlertOctagon, AlertTriangle, CheckCircle2, Download, Info } from 'lucide-react'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { NumberField, Select, Toggle } from '@/components/ui/controls'
import { Button } from '@/components/ui/primitives'
import { flawedPlan, reviewPlan, reviewToMarkdown, strongPlan, type Finding, type Severity, type TrialPlan } from '@/lib/designReview'
import { cn } from '@/lib/utils'

const SEV: Record<Severity, { label: string; icon: typeof Info; cls: string }> = {
  critical: { label: 'Critical', icon: AlertOctagon, cls: 'text-bad' },
  major: { label: 'Major', icon: AlertTriangle, cls: 'text-warn' },
  minor: { label: 'Minor', icon: Info, cls: 'text-info' },
  good: { label: 'Good practice', icon: CheckCircle2, cls: 'text-good' },
}

type Adaptation = TrialPlan['adaptations'][number]
const ADAPTATIONS: Array<{ id: Adaptation; label: string }> = [
  { id: 'ssr-blinded', label: 'Blinded sample-size re-estimation' },
  { id: 'ssr-unblinded', label: 'Unblinded sample-size re-estimation' },
  { id: 'enrichment', label: 'Adaptive enrichment' },
  { id: 'arm-dropping', label: 'Arm dropping (MAMS)' },
  { id: 'rar', label: 'Response-adaptive randomization' },
]

export default function DesignReviewLab() {
  const [plan, setPlan] = useState<TrialPlan>(flawedPlan)
  const set = <K extends keyof TrialPlan>(k: K, v: TrialPlan[K]) => setPlan((p) => ({ ...p, [k]: v }))
  const findings = useMemo(() => reviewPlan(plan), [plan])
  const counts = (s: Severity) => findings.filter((f) => f.severity === s).length

  const download = () => {
    const blob = new Blob([reviewToMarkdown(plan, findings)], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'protocol-design-review.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const controls = (
    <>
      <ControlCard title="Start from">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setPlan(flawedPlan)}>
            A flawed phase II plan
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setPlan(strongPlan)}>
            A solid phase III plan
          </Button>
        </div>
      </ControlCard>
      <ControlCard title="Question & design">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Phase" value={plan.phase} onChange={(v) => set('phase', v)} options={['I', 'II', 'III', 'IV'].map((x) => ({ value: x as TrialPlan['phase'], label: `Phase ${x}` }))} />
          <Select
            label="Objective"
            value={plan.objective}
            onChange={(v) => set('objective', v)}
            options={[
              { value: 'superiority', label: 'Superiority' },
              { value: 'non-inferiority', label: 'Non-inferiority' },
              { value: 'equivalence', label: 'Equivalence' },
            ]}
          />
          <Select
            label="Design"
            value={plan.design}
            onChange={(v) => set('design', v)}
            options={[
              { value: 'parallel', label: 'Parallel group' },
              { value: 'crossover', label: 'Crossover' },
              { value: 'factorial', label: 'Factorial' },
              { value: 'cluster', label: 'Cluster' },
            ]}
          />
          <Select
            label="Primary endpoint"
            value={plan.endpointType}
            onChange={(v) => set('endpointType', v)}
            options={[
              { value: 'binary', label: 'Binary' },
              { value: 'continuous', label: 'Continuous' },
              { value: 'time-to-event', label: 'Time-to-event' },
              { value: 'ordinal', label: 'Ordinal' },
            ]}
          />
          <NumberField label="Arms" value={plan.arms} min={2} max={8} onChange={(v) => set('arms', Math.round(v))} />
          <NumberField label="Patients per arm" value={plan.nPerArm} min={5} onChange={(v) => set('nPerArm', Math.round(v))} />
        </div>
        <Toggle label="Estimand specified (ICH E9(R1))" checked={plan.estimandSpecified} onChange={(v) => set('estimandSpecified', v)} />
        {plan.design === 'crossover' && <Toggle label="Stable condition, reversible effect" checked={plan.stableCondition} onChange={(v) => set('stableCondition', v)} />}
        {plan.design === 'cluster' && <Toggle label="ICC / design effect used" checked={plan.clusterIccUsed} onChange={(v) => set('clusterIccUsed', v)} />}
        {plan.objective !== 'superiority' && <Toggle label="Margin derived from historical evidence" checked={plan.niMarginJustified} onChange={(v) => set('niMarginJustified', v)} />}
      </ControlCard>
      <ControlCard title="Endpoints & multiplicity">
        <Toggle label="Mortality / irreversible outcome" checked={plan.irreversibleOutcome} onChange={(v) => set('irreversibleOutcome', v)} />
        <Toggle label="Subjective (patient- or clinician-rated)" checked={plan.subjectiveEndpoint} onChange={(v) => set('subjectiveEndpoint', v)} />
        <Select
          label="Surrogate endpoint?"
          value={plan.surrogate}
          onChange={(v) => set('surrogate', v)}
          options={[
            { value: 'no', label: 'No — clinical endpoint' },
            { value: 'validated', label: 'Validated surrogate' },
            { value: 'unvalidated', label: 'Unvalidated surrogate' },
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Primary endpoints" value={plan.primaryEndpoints} min={1} max={5} onChange={(v) => set('primaryEndpoints', Math.round(v))} />
          <NumberField label="Key secondaries" value={plan.keySecondaries} min={0} max={20} onChange={(v) => set('keySecondaries', Math.round(v))} />
        </div>
        <Select
          label="Multiplicity control"
          value={plan.multiplicity}
          onChange={(v) => set('multiplicity', v)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'hierarchical', label: 'Fixed-sequence hierarchy' },
            { value: 'holm', label: 'Holm' },
            { value: 'graphical', label: 'Graphical (Bretz et al.)' },
          ]}
        />
        <Select
          label="Effect size based on"
          value={plan.effectSource}
          onChange={(v) => set('effectSource', v)}
          options={[
            { value: 'mcid', label: 'Minimal clinically important difference' },
            { value: 'literature', label: 'Prior trials / meta-analysis' },
            { value: 'pilot', label: 'Our pilot study' },
            { value: 'budget', label: 'What we can afford' },
          ]}
        />
      </ControlCard>
      <ControlCard title="Bias protection">
        <Select
          label="Allocation concealment"
          value={plan.concealment}
          onChange={(v) => set('concealment', v)}
          options={[
            { value: 'central', label: 'Central web / IVRS' },
            { value: 'envelopes', label: 'Sealed envelopes' },
            { value: 'none', label: 'None / open list' },
          ]}
        />
        <Select
          label="Randomization"
          value={plan.randomization}
          onChange={(v) => set('randomization', v)}
          options={[
            { value: 'simple', label: 'Simple' },
            { value: 'fixed-blocks', label: 'Fixed-size blocks' },
            { value: 'random-blocks', label: 'Random-size blocks' },
            { value: 'stratified', label: 'Stratified blocks' },
            { value: 'minimization', label: 'Minimisation' },
            { value: 'rar', label: 'Response-adaptive' },
          ]}
        />
        <Select
          label="Blinding"
          value={plan.blinding}
          onChange={(v) => set('blinding', v)}
          options={[
            { value: 'open', label: 'Open-label' },
            { value: 'probe', label: 'Open, blinded outcome assessment (PROBE)' },
            { value: 'participant-clinician', label: 'Participants & clinicians' },
            { value: 'full', label: 'Participants, clinicians, assessors, analysts' },
          ]}
        />
      </ControlCard>
      <ControlCard title="Monitoring & adaptation">
        <Select
          label="Interim analyses"
          value={plan.interim}
          onChange={(v) => set('interim', v)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'planned-spending', label: 'Pre-specified, α-spending' },
            { value: 'unplanned', label: 'Ad hoc looks' },
          ]}
        />
        <Select
          label="Data monitoring committee"
          value={plan.dmc}
          onChange={(v) => set('dmc', v)}
          options={[
            { value: 'independent', label: 'Independent DMC' },
            { value: 'sponsor', label: 'Sponsor committee' },
            { value: 'none', label: 'None' },
          ]}
        />
        <fieldset>
          <legend className="mb-1 text-sm font-medium">Adaptations</legend>
          <div className="space-y-1.5">
            {ADAPTATIONS.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--accent)]"
                  checked={plan.adaptations.includes(a.id)}
                  onChange={(e) => set('adaptations', e.target.checked ? [...plan.adaptations, a.id] : plan.adaptations.filter((x) => x !== a.id))}
                />
                {a.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Outcome lag (weeks)" value={plan.outcomeLagWeeks} min={0} onChange={(v) => set('outcomeLagWeeks', v)} />
          <NumberField label="Accrual (months)" value={plan.accrualMonths} min={1} onChange={(v) => set('accrualMonths', v)} />
        </div>
        <Toggle label="Simulation report of operating characteristics" checked={plan.simulationReport} onChange={(v) => set('simulationReport', v)} />
        <Toggle label="Bayesian primary analysis" checked={plan.bayesian} onChange={(v) => set('bayesian', v)} />
        {plan.bayesian && (
          <>
            <Toggle label="Informative / borrowing prior" checked={plan.informativePrior} onChange={(v) => set('informativePrior', v)} />
            <Toggle label="Prior effective sample size stated" checked={plan.priorEssStated} onChange={(v) => set('priorEssStated', v)} />
          </>
        )}
      </ControlCard>
      <ControlCard title="AI / ML component">
        <Select
          label="Role of AI"
          value={plan.aiRole}
          onChange={(v) => set('aiRole', v)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'eligibility', label: 'Selects / enriches participants' },
            { value: 'covariate', label: 'Prognostic covariate in analysis' },
            { value: 'endpoint', label: 'Measures the endpoint' },
            { value: 'intervention', label: 'Is the intervention' },
          ]}
        />
        {plan.aiRole !== 'none' && (
          <>
            <Toggle label="Externally validated" checked={plan.aiExternallyValidated} onChange={(v) => set('aiExternallyValidated', v)} />
            <Toggle label="Subgroup performance reported" checked={plan.aiSubgroupPerformance} onChange={(v) => set('aiSubgroupPerformance', v)} />
            <Toggle label="Model locked & versioned" checked={plan.aiLocked} onChange={(v) => set('aiLocked', v)} />
          </>
        )}
      </ControlCard>
      <ControlCard title="Transparency">
        <Toggle label="Registered before first enrolment" checked={plan.registeredBeforeEnrolment} onChange={(v) => set('registeredBeforeEnrolment', v)} />
        <Toggle label="SAP final before unblinding" checked={plan.sapBeforeUnblinding} onChange={(v) => set('sapBeforeUnblinding', v)} />
      </ControlCard>
    </>
  )

  return (
    <LabLayout
      id="design-review"
      wideControls
      lead="Describe a trial and get the review a methodologist would write: each flag states the problem, why it matters, and the guideline or evidence behind it."
      controls={controls}
    >
      <div className="flex flex-wrap items-center gap-2">
        {(['critical', 'major', 'minor', 'good'] as Severity[]).map((s) => {
          const Icon = SEV[s].icon
          return (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm">
              <Icon className={cn('h-4 w-4', SEV[s].cls)} aria-hidden />
              <span className="font-semibold tabular">{counts(s)}</span> {SEV[s].label}
            </span>
          )
        })}
        <Button size="sm" variant="secondary" className="ml-auto" onClick={download}>
          <Download className="h-4 w-4" /> Download review (.md)
        </Button>
      </div>
      <ol className="space-y-3">
        {findings.map((f: Finding) => {
          const m = SEV[f.severity]
          const Icon = m.icon
          return (
            <li key={f.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start gap-3">
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', m.cls)} aria-label={m.label} />
                <div className="min-w-0">
                  <div className="font-semibold">{f.title}</div>
                  <p className="mt-1 text-sm text-ink-2">{f.detail}</p>
                  <p className="mt-1.5 text-xs text-muted">Source: {f.source}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="text-xs text-muted">Rules encode mainstream guidance and empirical evidence; a clean review means no common red flags, not that the design is optimal.</p>
    </LabLayout>
  )
}
