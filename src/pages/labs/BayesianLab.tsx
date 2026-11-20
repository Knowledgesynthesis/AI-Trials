import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, RotateCcw } from 'lucide-react'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { Segmented, Slider, Tabs } from '@/components/ui/controls'
import { Button, Card, CardBody, CardHeader, Stat } from '@/components/ui/primitives'
import { ChartFrame, TooltipBox } from '@/components/ChartKit'
import { axisProps, gridProps, SERIES } from '@/lib/chart'
import { Callout } from '@/components/Callout'
import { Markdown } from '@/components/Markdown'
import { betaInterval, betaMean, betaPdf, betaCdf, normQuantile, normSf, probGreater } from '@/lib/stats/distributions'
import { createRng, rbeta } from '@/lib/stats/rng'
import { useCompute } from '@/lib/useCompute'
import { cn, fmt, fmtP, pct } from '@/lib/utils'

type Tab = 'single' | 'two' | 'oc'
type PriorKey = 'flat' | 'jeffreys' | 'skeptical' | 'enthusiastic' | 'custom'

const PRIOR_LABEL: Record<PriorKey, string> = {
  flat: 'Uniform Beta(1,1)',
  jeffreys: 'Jeffreys Beta(½,½)',
  skeptical: 'Sceptical',
  enthusiastic: 'Enthusiastic',
  custom: 'Custom',
}

export default function BayesianLab() {
  const [tab, setTab] = useState<Tab>('single')
  return (
    <LabLayout
      id="bayesian"
      lead="A posterior is a compromise between what you believed and what you saw, weighted by how much of each you have. Every number here is computed exactly (Beta–binomial conjugacy) unless labelled otherwise."
    >
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'single', label: 'Prior × likelihood → posterior' },
          { id: 'two', label: 'Two-arm decision & sensitivity' },
          { id: 'oc', label: 'Operating characteristics' },
        ]}
      />
      {tab === 'single' && <SingleArm />}
      {tab === 'two' && <TwoArm />}
      {tab === 'oc' && <BayesOC />}
    </LabLayout>
  )
}

function priorParams(key: PriorKey, mean: number, ess: number): [number, number] {
  switch (key) {
    case 'flat':
      return [1, 1]
    case 'jeffreys':
      return [0.5, 0.5]
    case 'skeptical':
      return [0.2 * 20, 0.8 * 20]
    case 'enthusiastic':
      return [0.45 * 20, 0.55 * 20]
    case 'custom':
      return [mean * ess, (1 - mean) * ess]
  }
}

function SingleArm() {
  const [prior, setPrior] = useState<PriorKey>('skeptical')
  const [cMean, setCMean] = useState(0.3)
  const [cEss, setCEss] = useState(10)
  const [x, setX] = useState(9)
  const [n, setN] = useState(25)
  const [p0, setP0] = useState(0.2)
  const [truth, setTruth] = useState(0.35)
  const [seed, setSeed] = useState(1)

  const [a0, b0] = priorParams(prior, cMean, cEss)
  const a1 = a0 + x
  const b1 = b0 + n - x
  const ess = a0 + b0
  const ci = betaInterval(a1, b1)
  const pAbove = 1 - betaCdf(p0, a1, b1)
  const w = ess / (ess + n)

  const curve = useMemo(() => {
    const pts = []
    for (let i = 1; i < 200; i++) {
      const t = i / 200
      pts.push({
        t,
        prior: betaPdf(t, a0, b0),
        like: betaPdf(t, x + 1, n - x + 1), // normalised likelihood
        post: betaPdf(t, a1, b1),
      })
    }
    const cap = Math.max(...pts.map((p) => p.post)) * 1.15
    return pts.map((p) => ({ ...p, prior: Math.min(p.prior, cap), like: Math.min(p.like, cap) }))
  }, [a0, b0, a1, b1, x, n])

  const add = (k: number) => {
    const rng = createRng(seed * 7919 + n)
    let s = 0
    for (let i = 0; i < k; i++) if (rng() < truth) s++
    setX(x + s)
    setN(n + k)
    setSeed(seed + 1)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-5">
        <ControlCard title="Prior">
          <Segmented
            size="sm"
            value={prior}
            onChange={setPrior}
            options={(Object.keys(PRIOR_LABEL) as PriorKey[]).map((k) => ({ value: k, label: PRIOR_LABEL[k] }))}
          />
          {prior === 'custom' && (
            <>
              <Slider label="Prior mean" value={cMean} min={0.05} max={0.95} step={0.01} onChange={setCMean} format={(v) => pct(v, 0)} />
              <Slider label="Prior effective sample size" value={cEss} min={1} max={200} onChange={setCEss} hint="How many patients' worth of information the prior represents (a + b)." />
            </>
          )}
          <p className="text-xs text-muted tabular">
            Beta({fmt(a0, 1)}, {fmt(b0, 1)}) · mean {pct(a0 / (a0 + b0), 0)} · ESS {fmt(ess, 1)}
            {prior === 'skeptical' && ' — centred on the historical 20% rate'}
            {prior === 'enthusiastic' && ' — centred on a hoped-for 45%'}
          </p>
        </ControlCard>
        <ControlCard title="Data">
          <Slider label="Patients" value={n} min={0} max={300} onChange={(v) => { setN(v); setX(Math.min(x, v)) }} />
          <Slider label="Responders" value={Math.min(x, n)} min={0} max={Math.max(1, n)} onChange={setX} />
          <Slider label="Threshold of interest p₀" value={p0} min={0.05} max={0.6} step={0.01} onChange={setP0} format={(v) => pct(v, 0)} />
        </ControlCard>
        <ControlCard title="Accrue patients one cohort at a time">
          <Slider label="True response rate (unknown in reality)" value={truth} min={0.05} max={0.8} step={0.01} onChange={setTruth} format={(v) => pct(v, 0)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => add(10)}>
              <Plus className="h-4 w-4" /> 10 patients
            </Button>
            <Button size="sm" variant="secondary" onClick={() => add(50)}>
              <Plus className="h-4 w-4" /> 50
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setX(0); setN(0) }}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </ControlCard>
      </div>
      <div className="min-w-0 space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Posterior mean" value={pct(betaMean(a1, b1), 1)} sub={n ? `observed ${pct(x / n, 1)}` : 'no data yet'} />
          <Stat label="95% credible interval" value={`${pct(ci[0], 0)}–${pct(ci[1], 0)}`} />
          <Stat label={`P(rate > ${pct(p0, 0)} | data)`} value={pct(pAbove, 1)} tone={pAbove > 0.95 ? 'good' : undefined} />
          <Stat label="Weight on prior" value={pct(w, 0)} sub={`ESS ${fmt(ess, 0)} vs n ${n}`} />
        </div>
        <ChartFrame
          title="Prior, likelihood and posterior for the response rate"
          subtitle="Likelihood normalised to integrate to 1. Watch the posterior sit between prior and data, then follow the data as n grows."
          legend={[
            { label: 'Prior', color: SERIES.s2 },
            { label: 'Likelihood (data alone)', color: SERIES.s3 },
            { label: 'Posterior', color: SERIES.s1 },
          ]}
          height={300}
        >
          <ResponsiveContainer>
            <LineChart data={curve} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="t" type="number" domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} label={{ value: 'Response rate', position: 'insideBottom', offset: -8 }} />
              <YAxis {...axisProps} width={36} tickFormatter={(v) => fmt(v, 0)} />
              <ReferenceLine x={p0} stroke="var(--axis)" />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={`Rate ${pct(payload[0].payload.t, 1)}`}
                      rows={[
                        { label: 'Prior', value: fmt(payload[0].payload.prior, 2), color: SERIES.s2 },
                        { label: 'Likelihood', value: fmt(payload[0].payload.like, 2), color: SERIES.s3 },
                        { label: 'Posterior', value: fmt(payload[0].payload.post, 2), color: SERIES.s1 },
                      ]}
                    />
                  ) : null
                }
              />
              <Line dataKey="prior" stroke={SERIES.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="like" stroke={SERIES.s3} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line dataKey="post" stroke={SERIES.s1} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
        <Card>
          <CardBody>
            <Markdown compact>{`**Conjugate update.** Prior Beta(a, b) + x responders in n ⇒ posterior Beta(a + x, b + n − x) = Beta(${fmt(a1, 1)}, ${fmt(b1, 1)}).
The posterior mean is a weighted average of the prior mean and the observed rate:
$$\\frac{a+x}{a+b+n} = \\underbrace{\\tfrac{a+b}{a+b+n}}_{${fmt(w, 2)}}\\cdot ${fmt(a0 / (a0 + b0), 2)} + \\underbrace{\\tfrac{n}{a+b+n}}_{${fmt(1 - w, 2)}}\\cdot ${n ? fmt(x / n, 2) : '—'}$$
A prior is "strong" or "weak" only relative to the amount of data.`}</Markdown>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function TwoArm() {
  const [nC, setNC] = useState(100)
  const [xC, setXC] = useState(30)
  const [nT, setNT] = useState(100)
  const [xT, setXT] = useState(42)
  const [mcid, setMcid] = useState(0.05)
  const [orAlt, setOrAlt] = useState(1.75)

  const aT = 1 + xT
  const bT = 1 + nT - xT
  const aC = 1 + xC
  const bC = 1 + nC - xC
  const pBetter = probGreater(aT, bT, aC, bC)

  const mc = useMemo(() => {
    const rng = createRng(12345)
    const N = 20000
    const diffs = new Float64Array(N)
    let above = 0
    for (let i = 0; i < N; i++) {
      const d = rbeta(rng, aT, bT) - rbeta(rng, aC, bC)
      diffs[i] = d
      if (d > mcid) above++
    }
    const lo = -0.4
    const hi = 0.5
    const bins = 72
    const w = (hi - lo) / bins
    const counts = new Array(bins).fill(0)
    for (const d of diffs) {
      const b = Math.floor((d - lo) / w)
      if (b >= 0 && b < bins) counts[b]++
    }
    const hist = counts.map((c, i) => {
      const mid = lo + (i + 0.5) * w
      const dens = c / (N * w)
      return { d: mid, dens, above: mid > mcid ? dens : null, below: mid <= mcid ? dens : null }
    })
    return { pAbove: above / N, hist }
  }, [aT, bT, aC, bC, mcid])

  // Frequentist comparison
  const pc = xC / nC
  const pt = xT / nT
  const diff = pt - pc
  const seU = Math.sqrt((pc * (1 - pc)) / nC + (pt * (1 - pt)) / nT)
  const pbar = (xC + xT) / (nC + nT)
  const se0 = Math.sqrt(pbar * (1 - pbar) * (1 / nC + 1 / nT))
  const z = se0 > 0 ? diff / se0 : 0
  const p2 = 2 * normSf(Math.abs(z))
  const z975 = normQuantile(0.975)

  // Sensitivity on the log-OR scale (normal approximation), Spiegelhalter-style priors
  const logOr = Math.log(((xT + 0.5) * (nC - xC + 0.5)) / ((nT - xT + 0.5) * (xC + 0.5)))
  const seLor = Math.sqrt(1 / (xT + 0.5) + 1 / (nT - xT + 0.5) + 1 / (xC + 0.5) + 1 / (nC - xC + 0.5))
  const sdPrior = Math.log(orAlt) / 1.645
  const priors: Array<{ name: string; mean: number; sd: number; desc: string }> = [
    { name: 'Flat', mean: 0, sd: Infinity, desc: 'data only' },
    { name: 'Sceptical', mean: 0, sd: sdPrior, desc: `centred on no effect; 5% prior chance OR > ${fmt(orAlt, 2)}` },
    { name: 'Enthusiastic', mean: Math.log(orAlt), sd: sdPrior, desc: `centred on OR ${fmt(orAlt, 2)}; 5% prior chance of harm` },
    { name: 'Pessimistic', mean: -Math.log(orAlt) / 2, sd: sdPrior, desc: 'centred on modest harm' },
  ]
  const sens = priors.map((pr) => {
    const precD = 1 / seLor ** 2
    const precP = Number.isFinite(pr.sd) ? 1 / pr.sd ** 2 : 0
    const v = 1 / (precD + precP)
    const m = v * (logOr * precD + pr.mean * precP)
    const s = Math.sqrt(v)
    return {
      ...pr,
      median: Math.exp(m),
      lo: Math.exp(m - z975 * s),
      hi: Math.exp(m + z975 * s),
      pBenefit: normSf(-m / s),
      pAlt: normSf((Math.log(orAlt) - m) / s),
    }
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-5">
        <ControlCard title="Control arm">
          <Slider label="Patients" value={nC} min={10} max={500} step={5} onChange={(v) => { setNC(v); setXC(Math.min(xC, v)) }} />
          <Slider label="Responders" value={Math.min(xC, nC)} min={0} max={nC} onChange={setXC} />
        </ControlCard>
        <ControlCard title="Treatment arm">
          <Slider label="Patients" value={nT} min={10} max={500} step={5} onChange={(v) => { setNT(v); setXT(Math.min(xT, v)) }} />
          <Slider label="Responders" value={Math.min(xT, nT)} min={0} max={nT} onChange={setXT} />
        </ControlCard>
        <ControlCard title="What matters clinically">
          <Slider label="Minimal important difference" value={mcid} min={0} max={0.2} step={0.01} onChange={setMcid} format={(v) => pct(v, 0)} />
          <Slider label="Clinically important odds ratio" value={orAlt} min={1.1} max={3} step={0.05} onChange={setOrAlt} format={(v) => fmt(v, 2)} hint="Anchors the sceptical / enthusiastic priors." />
        </ControlCard>
      </div>
      <div className="min-w-0 space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="P(treatment better | data)" value={pct(pBetter, 1)} sub="exact, uniform priors" tone={pBetter > 0.975 ? 'good' : undefined} />
          <Stat label={`P(difference > ${pct(mcid, 0)})`} value={pct(mc.pAbove, 1)} sub="Monte Carlo, 20,000 draws" />
          <Stat label="Risk difference (95% CI)" value={pct(diff, 1)} sub={`${pct(diff - z975 * seU, 1)} to ${pct(diff + z975 * seU, 1)}`} />
          <Stat label="Two-sided p (z-test)" value={fmtP(p2)} sub={`1 − p/2 = ${pct(diff >= 0 ? 1 - p2 / 2 : p2 / 2, 1)}`} />
        </div>
        <ChartFrame
          title="Posterior distribution of the difference in response rate (treatment − control)"
          subtitle="Shaded right of the minimal important difference: the probability of a benefit that matters, not just any benefit."
          legend={[
            { label: `Difference > ${pct(mcid, 0)}`, color: SERIES.w1, kind: 'area' },
            { label: 'Posterior density', color: SERIES.s1 },
          ]}
          height={260}
        >
          <ResponsiveContainer>
            <AreaChart data={mc.hist} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="d" type="number" domain={[-0.4, 0.5]} ticks={[-0.4, -0.2, 0, 0.2, 0.4]} tickFormatter={(v) => pct(v, 0)} {...axisProps} />
              <YAxis {...axisProps} width={32} tickFormatter={(v) => fmt(v, 0)} />
              <ReferenceLine x={0} stroke="var(--axis)" />
              <ReferenceLine x={mcid} stroke={SERIES.s1} strokeDasharray="4 3" />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? <TooltipBox title={`Difference ${pct(payload[0].payload.d, 1)}`} rows={[{ label: 'Density', value: fmt(payload[0].payload.dens, 2), color: SERIES.s1 }]} /> : null
                }
              />
              <Area dataKey="dens" stroke={SERIES.s1} strokeWidth={2} fill="transparent" type="monotone" isAnimationActive={false} />
              <Area dataKey="above" stroke="none" fill={SERIES.w1} fillOpacity={1} type="monotone" isAnimationActive={false} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartFrame>
        <Callout
          tone="key"
          md={`With flat priors and reasonable sample sizes, **P(treatment better) ≈ 1 − one-sided p** (here ${pct(pBetter, 1)} vs ${pct(diff >= 0 ? 1 - p2 / 2 : p2 / 2, 1)}). The Bayesian and frequentist numbers are not rivals; they answer different questions about the same likelihood. The Bayesian answer becomes genuinely different when the prior carries information — which is why the prior must be justified and its influence shown.`}
        />
        <Card>
          <CardHeader title="Prior sensitivity (normal approximation on the log-odds-ratio scale)" subtitle="Spiegelhalter, Freedman & Parmar (1994): show the conclusion under priors a sceptic and an enthusiast would accept." />
          <CardBody className="overflow-x-auto pt-3">
            <table className="w-full min-w-[600px] text-sm tabular">
              <thead className="text-left text-xs text-ink-2">
                <tr className="border-b border-line">
                  <th className="py-2 pr-3 font-semibold">Prior</th>
                  <th className="py-2 pr-3 font-semibold">Posterior OR (95% CrI)</th>
                  <th className="py-2 pr-3 font-semibold">P(OR &gt; 1)</th>
                  <th className="py-2 pr-3 font-semibold">P(OR &gt; {fmt(orAlt, 2)})</th>
                </tr>
              </thead>
              <tbody>
                {sens.map((s) => (
                  <tr key={s.name} className="border-b border-line">
                    <td className="py-2 pr-3">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted">{s.desc}</div>
                    </td>
                    <td className="py-2 pr-3">
                      {fmt(s.median, 2)} ({fmt(s.lo, 2)}–{fmt(s.hi, 2)})
                    </td>
                    <td className={cn('py-2 pr-3 font-medium', s.pBenefit > 0.975 && 'text-good')}>{pct(s.pBenefit, 1)}</td>
                    <td className="py-2 pr-3">{pct(s.pAlt, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted">Observed OR {fmt(Math.exp(logOr), 2)} (SE of log OR {fmt(seLor, 3)}; 0.5 added to each cell).</p>
          </CardBody>
        </Card>
        <Callout
          tone="evidence"
          title="EOLIA, re-read with priors"
          md="EOLIA (ECMO for severe ARDS, *NEJM* 2018) missed its primary endpoint: 60-day mortality 35% vs 46%, RR 0.76 (95% CI 0.55–1.04), p = 0.09. A Bayesian re-analysis (Goligher et al., *JAMA* 2018) found a posterior probability of mortality benefit between 88% and 99% across a range of priors, including sceptical ones — 'not significant' did not mean 'no effect'."
        />
      </div>
    </div>
  )
}

interface OcRow {
  K: number
  rejectRate: number
  meanNPerArm: number
  byLook: number[]
}

function BayesOC() {
  const [p0, setP0] = useState(0.3)
  const [nPerArm, setNPerArm] = useState(150)
  const [gamma, setGamma] = useState(0.975)
  const [alt, setAlt] = useState(0.15)
  const looks = [1, 2, 3, 5, 10]
  const nullRes = useCompute<'bayesOC', OcRow[]>('bayesOC', { pControl: p0, pTreatment: p0, nPerArm, looks, threshold: gamma, reps: 3000, seed: 3 })
  const altRes = useCompute<'bayesOC', OcRow[]>('bayesOC', { pControl: p0, pTreatment: Math.min(0.99, p0 + alt), nPerArm, looks, threshold: gamma, reps: 3000, seed: 4 })
  const rows =
    nullRes.data && altRes.data
      ? nullRes.data.map((r, i) => ({ K: `${r.K} look${r.K > 1 ? 's' : ''}`, typeI: r.rejectRate, power: altRes.data![i].rejectRate, n: altRes.data![i].meanNPerArm }))
      : []
  const loading = nullRes.loading || altRes.loading

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <ControlCard title="Design">
        <Slider label="Control response rate" value={p0} min={0.1} max={0.7} step={0.05} onChange={setP0} format={(v) => pct(v, 0)} />
        <Slider label="Max patients per arm" value={nPerArm} min={50} max={400} step={10} onChange={setNPerArm} />
        <Slider label="Stop for efficacy if P(T > C | data) >" value={gamma} min={0.9} max={0.999} step={0.001} onChange={setGamma} format={(v) => fmt(v, 3)} />
        <Slider label="Treatment benefit for power" value={alt} min={0.05} max={0.3} step={0.01} onChange={setAlt} format={(v) => `+${pct(v, 0)}`} />
        <p className="text-xs text-muted">Uniform priors; equally spaced looks; 3,000 simulated trials per cell.</p>
      </ControlCard>
      <div className={cn('min-w-0 space-y-6', loading && 'opacity-60')}>
        <ChartFrame
          title={`Frequentist Type I error of “stop when P(T > C) > ${fmt(gamma, 3)}”`}
          subtitle="Both arms truly equal. One look ≈ one-sided α = 1 − γ; every extra look adds false positives."
          height={260}
        >
          <ResponsiveContainer>
            <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="K" {...axisProps} />
              <YAxis tickFormatter={(v) => pct(v, 0)} {...axisProps} width={44} />
              <ReferenceLine y={1 - gamma} stroke="var(--axis)" />
              <Tooltip
                cursor={{ fill: 'var(--surface-2)' }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox
                      title={payload[0].payload.K}
                      rows={[
                        { label: 'Type I error', value: pct(payload[0].payload.typeI, 1), color: SERIES.s2 },
                        { label: 'Power', value: pct(payload[0].payload.power, 1) },
                      ]}
                    />
                  ) : null
                }
              />
              <Bar dataKey="typeI" fill={SERIES.s2} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[480px] text-sm tabular">
            <thead className="bg-surface-2 text-left text-xs text-ink-2">
              <tr>
                <th className="px-4 py-2 font-semibold">Monitoring</th>
                <th className="px-4 py-2 text-right font-semibold">Type I error</th>
                <th className="px-4 py-2 text-right font-semibold">Power (+{pct(alt, 0)})</th>
                <th className="px-4 py-2 text-right font-semibold">Mean N/arm under H1</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.K} className="border-t border-line">
                  <td className="px-4 py-2">{r.K}</td>
                  <td className={cn('px-4 py-2 text-right font-medium', r.typeI > 0.03 && 'text-warn')}>{pct(r.typeI, 1)}</td>
                  <td className="px-4 py-2 text-right">{pct(r.power, 1)}</td>
                  <td className="px-4 py-2 text-right">{fmt(r.n, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Callout
            tone="regulatory"
            md="FDA's draft guidance on Bayesian methodology for drugs and biologics (January 2026) accepts success criteria that are either **calibrated to a Type I error rate** (e.g. one-sided 2.5%, shown by simulation across plausible null scenarios) or justified directly as posterior probabilities when informative priors are well supported — with the prior's influence quantified (e.g. effective sample size). Either way, operating characteristics must be simulated and reported."
          />
          <Callout
            tone="key"
            title="Two legitimate positions"
            md="By the likelihood principle, a posterior is not changed by how often you looked. But a regulator granting approvals across thousands of trials cares about the long-run false-positive rate of the *procedure*. Bayesian adaptive trials used for approval therefore calibrate thresholds (often γ ≈ 0.98–0.995 with several looks) by simulation."
          />
        </div>
        <p className="text-xs text-muted">P(T &gt; C) is computed exactly at each look. Monte Carlo SE ≈ 0.3 percentage points at 2.5%.</p>
      </div>
    </div>
  )
}
