import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Dices } from 'lucide-react'
import type { WidgetId } from '@/data/types'
import { Slider } from '@/components/ui/controls'
import { Button, Stat } from '@/components/ui/primitives'
import { ForestPlot, type ForestRow } from '@/components/ForestPlot'
import { Legend, TooltipBox } from '@/components/ChartKit'
import { axisProps, gridProps, SERIES } from '@/lib/chart'
import { NiClassifier } from './NiClassifier'
import { betaInterval, betaPdf, normCdf, normQuantile, normSf } from '@/lib/stats/distributions'
import { createRng, rnorm } from '@/lib/stats/rng'
import { conditionalPower, conditionalPowerCurrentTrend, predictivePower } from '@/lib/stats/groupSequential'
import { designEffect } from '@/lib/stats/sampleSize'
import { fmt, fmtInt, fmtP, pct } from '@/lib/utils'

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 text-xs font-semibold tracking-wide text-accent-text uppercase">Try it · {title}</div>
      {children}
    </div>
  )
}

function PValueDance() {
  const [delta, setDelta] = useState(0.3)
  const [n, setN] = useState(100)
  const [seed, setSeed] = useState(1)
  const se = Math.sqrt(2 / n)
  const z = normQuantile(0.975)
  const power = normCdf(delta / se - z) + normCdf(-delta / se - z)
  const trials = useMemo(() => {
    const rng = createRng(seed * 101 + n)
    return Array.from({ length: 20 }, (_, i) => {
      const est = rnorm(rng, delta, se)
      const p = 2 * normSf(Math.abs(est / se))
      return { i, est, p }
    })
  }, [seed, n, delta, se])
  const sig = trials.filter((t) => t.p < 0.05).length
  const ps = trials.map((t) => t.p).sort((a, b) => a - b)
  const rows: ForestRow[] = trials.map((t) => ({
    label: `Trial ${t.i + 1} · p ${fmtP(t.p)}`,
    est: t.est,
    lo: t.est - z * se,
    hi: t.est + z * se,
    emphasis: t.p < 0.05 ? 'flag' : undefined,
  }))
  return (
    <Frame title="the dance of the p-values">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="True effect (SD units)" value={delta} min={0} max={0.8} step={0.05} onChange={setDelta} format={(v) => fmt(v, 2)} />
        <Slider label="Patients per arm" value={n} min={20} max={400} step={10} onChange={setN} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="True power" value={pct(power, 0)} />
        <Stat label="Significant (p < 0.05)" value={`${sig} / 20`} />
        <Stat label="p-value range" value={`${fmtP(ps[0])} – ${fmtP(ps[19])}`} />
      </div>
      <div className="mt-3">
        <Legend
          className="mb-1"
          items={[
            { label: 'p < 0.05', color: SERIES.s2, kind: 'dot' },
            { label: 'p ≥ 0.05', color: SERIES.s1, kind: 'dot' },
            { label: 'True effect', color: 'var(--accent)', kind: 'line' },
          ]}
        />
        <ForestPlot
          rows={rows}
          domain={[-0.6, 1.2]}
          ticks={[-0.5, 0, 0.5, 1]}
          tickFormat={(v) => fmt(v, 1)}
          refLines={[
            { x: 0, label: '0', color: 'var(--axis)' },
            { x: delta, label: 'truth', color: 'var(--accent)' },
          ]}
          labelWidth={150}
          xLabel="Estimated effect with 95% CI (identical trials, different patients)"
        />
      </div>
      <Button variant="secondary" size="sm" className="mt-2" onClick={() => setSeed((s) => s + 1)}>
        <Dices className="h-4 w-4" /> Run 20 more identical trials
      </Button>
      <p className="mt-2 text-sm text-ink-2">
        Same truth, same design — yet p-values span orders of magnitude. With {pct(power, 0)} power, about {Math.round(power * 20)} of 20 replications “succeed”. A single p-value is a
        noisy summary; the confidence interval shows the uncertainty honestly.
      </p>
    </Frame>
  )
}

function MiniBayes() {
  const [priorMean, setPriorMean] = useState(0.2)
  const [ess, setEss] = useState(20)
  const [n, setN] = useState(20)
  const [rate, setRate] = useState(0.4)
  const x = Math.round(rate * n)
  const a0 = priorMean * ess
  const b0 = (1 - priorMean) * ess
  const a1 = a0 + x
  const b1 = b0 + n - x
  const ci = betaInterval(a1, b1)
  const data = useMemo(
    () =>
      Array.from({ length: 99 }, (_, i) => {
        const t = (i + 1) / 100
        return { t, prior: betaPdf(t, a0, b0), post: betaPdf(t, a1, b1) }
      }),
    [a0, b0, a1, b1],
  )
  return (
    <Frame title="how much does the prior matter?">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Prior mean" value={priorMean} min={0.05} max={0.8} step={0.05} onChange={setPriorMean} format={(v) => pct(v, 0)} />
        <Slider label="Prior strength (effective patients)" value={ess} min={2} max={200} onChange={setEss} />
        <Slider label="Observed patients" value={n} min={0} max={400} step={5} onChange={setN} />
        <Slider label="Observed response rate" value={rate} min={0} max={1} step={0.01} onChange={setRate} format={(v) => pct(v, 0)} />
      </div>
      <Legend
        className="mt-2"
        items={[
          { label: 'Prior', color: SERIES.s2 },
          { label: 'Posterior', color: SERIES.s1 },
        ]}
      />
      <div className="h-48">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="t" type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => fmt(v, 0)} width={36} />
            <ReferenceLine x={rate} stroke="var(--axis)" />
            <Line dataKey="prior" stroke={SERIES.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="post" stroke={SERIES.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-sm text-ink-2">
        Posterior mean {pct(a1 / (a1 + b1), 1)} (95% CrI {pct(ci[0], 0)}–{pct(ci[1], 0)}): {pct(ess / (ess + n), 0)} prior, {pct(n / (ess + n), 0)} data. The grey line marks the
        observed rate.
      </p>
    </Frame>
  )
}

function CpExplainer() {
  const [z, setZ] = useState(1.2)
  const [t, setT] = useState(0.5)
  const [drift, setDrift] = useState(3.24)
  const c = normQuantile(0.975)
  const curve = useMemo(
    () =>
      Array.from({ length: 61 }, (_, i) => {
        const zz = -1 + (i * 4) / 60
        return { z: zz, trend: conditionalPowerCurrentTrend(zz, t, c), design: conditionalPower(zz, t, c, drift), pp: predictivePower(zz, t, c) }
      }),
    [t, c, drift],
  )
  return (
    <Frame title="conditional vs predictive power">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Interim Z" value={z} min={-1} max={3} step={0.05} onChange={setZ} format={(v) => fmt(v, 2)} />
        <Slider label="Information fraction" value={t} min={0.1} max={0.9} step={0.05} onChange={setT} format={(v) => pct(v, 0)} />
        <Slider label="Design drift θ" value={drift} min={1.5} max={4.5} step={0.01} onChange={setDrift} format={(v) => fmt(v, 2)} hint="3.24 = 90% power at one-sided 2.5%" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="CP, current trend" value={pct(conditionalPowerCurrentTrend(z, t, c), 1)} />
        <Stat label="CP, design effect" value={pct(conditionalPower(z, t, c, drift), 1)} />
        <Stat label="Predictive power" value={pct(predictivePower(z, t, c), 1)} />
      </div>
      <Legend
        className="mt-3"
        items={[
          { label: 'CP, current trend', color: SERIES.s1 },
          { label: 'CP, design effect', color: SERIES.s2 },
          { label: 'Predictive power', color: SERIES.s3 },
        ]}
      />
      <div className="h-52">
        <ResponsiveContainer>
          <LineChart data={curve} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="z" type="number" domain={[-1, 3]} ticks={[-1, 0, 1, 2, 3]} {...axisProps} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} width={44} />
            <ReferenceLine x={z} stroke="var(--axis)" />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TooltipBox
                    title={`Z = ${fmt(payload[0].payload.z, 2)}`}
                    rows={[
                      { label: 'CP trend', value: pct(payload[0].payload.trend, 1), color: SERIES.s1 },
                      { label: 'CP design', value: pct(payload[0].payload.design, 1), color: SERIES.s2 },
                      { label: 'Predictive', value: pct(payload[0].payload.pp, 1), color: SERIES.s3 },
                    ]}
                  />
                ) : null
              }
            />
            <Line dataKey="trend" stroke={SERIES.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="design" stroke={SERIES.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="pp" stroke={SERIES.s3} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-xs text-muted">Final critical value 1.96 (one-sided 2.5%), ignoring further interim looks. x-axis: interim Z.</p>
    </Frame>
  )
}

function DesignEffect() {
  const [m, setM] = useState(20)
  const [icc, setIcc] = useState(0.05)
  const [n, setN] = useState(400)
  const de = designEffect(m, icc)
  return (
    <Frame title="the cluster design effect">
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="Patients per cluster (m)" value={m} min={2} max={200} onChange={setM} />
        <Slider label="Intracluster correlation (ICC)" value={icc} min={0} max={0.2} step={0.005} onChange={setIcc} format={(v) => fmt(v, 3)} />
        <Slider label="N for an individually randomized trial" value={n} min={100} max={2000} step={50} onChange={setN} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Design effect 1 + (m − 1)·ICC" value={fmt(de, 2)} />
        <Stat label="Patients needed" value={fmtInt(Math.ceil(n * de))} />
        <Stat label="Clusters needed" value={fmtInt(Math.ceil((n * de) / m))} />
      </div>
      <p className="mt-2 text-sm text-ink-2">
        Even a small ICC matters when clusters are large: with m = 100 and ICC = 0.05 the design effect is 5.95. Adding clusters helps far more than adding patients per cluster.
      </p>
    </Frame>
  )
}

function CovariateAdjustment() {
  const [rho, setRho] = useState(0.5)
  const [n, setN] = useState(500)
  return (
    <Frame title="precision for free: adjusting for a prognostic covariate">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Correlation of covariate (or prognostic score) with outcome, ρ" value={rho} min={0} max={0.9} step={0.05} onChange={setRho} format={(v) => fmt(v, 2)} />
        <Slider label="Unadjusted sample size" value={n} min={100} max={2000} step={50} onChange={setN} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Variance factor 1 − ρ²" value={fmt(1 - rho * rho, 2)} />
        <Stat label="Adjusted N for same power" value={fmtInt(Math.ceil(n * (1 - rho * rho)))} tone="good" />
        <Stat label="Patients saved" value={fmtInt(n - Math.ceil(n * (1 - rho * rho)))} />
      </div>
      <p className="mt-2 text-sm text-ink-2">Exact for ANCOVA with a continuous outcome; baseline values of the outcome itself often have ρ = 0.5–0.7.</p>
    </Frame>
  )
}

export function Widget({ id }: { id: WidgetId }) {
  switch (id) {
    case 'pvalue-dance':
      return <PValueDance />
    case 'ni-classifier':
      return <NiClassifier />
    case 'mini-bayes':
      return <MiniBayes />
    case 'cp-explainer':
      return <CpExplainer />
    case 'design-effect':
      return <DesignEffect />
    case 'covariate-adjustment':
      return <CovariateAdjustment />
  }
}
