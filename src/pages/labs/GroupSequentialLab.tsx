import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Dices, StepForward } from 'lucide-react'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { NumberField, Segmented, Select, Slider, Tabs } from '@/components/ui/controls'
import { Badge, Button, Card, CardBody, CardHeader, Stat } from '@/components/ui/primitives'
import { ChartFrame, TooltipBox } from '@/components/ChartKit'
import { axisProps, gridProps, SERIES } from '@/lib/chart'
import { Callout } from '@/components/Callout'
import { useCompute } from '@/lib/useCompute'
import type { GsdResponse } from '@/workers/compute.worker'
import { BOUNDARY_LABELS, equalTiming, type BoundaryFamily, type FutilityRule } from '@/lib/stats/groupSequential'
import { nProportions } from '@/lib/stats/sampleSize'
import { normQuantile } from '@/lib/stats/distributions'
import { simulateGsTrial, type StoppingBiasResult } from '@/lib/stats/simulate'
import { cn, fmt, fmtInt, fmtP, pct } from '@/lib/utils'

type Tab = 'design' | 'peeking' | 'dmc' | 'bias'
type FutType = 'none' | 'z' | 'cp'

const Z_CAP = 6

export default function GroupSequentialLab() {
  const [tab, setTab] = useState<Tab>('design')
  const [K, setK] = useState(4)
  const [family, setFamily] = useState<BoundaryFamily>('ldof')
  const [gamma, setGamma] = useState(-4)
  const [hpZ, setHpZ] = useState(3)
  const [alpha, setAlpha] = useState(0.025)
  const [power, setPower] = useState(0.9)
  const [futType, setFutType] = useState<FutType>('cp')
  const [futZ, setFutZ] = useState(0)
  const [futCp, setFutCp] = useState(0.1)
  const [pC, setPC] = useState(0.3)
  const [pT, setPT] = useState(0.4)

  const timing = useMemo(() => equalTiming(K), [K])
  const futility: FutilityRule =
    futType === 'none' ? { type: 'none' } : futType === 'z' ? { type: 'z', z: futZ } : { type: 'cp', threshold: futCp }
  const spec = { family, param: family === 'hsd' ? gamma : family === 'power' ? 3 : undefined, hpZ }
  const { data, loading } = useCompute<'gsd', GsdResponse>('gsd', { timing, alpha, power, spec, futility })

  const fixedPerArm = useMemo(
    () => nProportions({ pControl: pC, pExperimental: pT, alphaOneSided: alpha, power }).nControl,
    [pC, pT, alpha, power],
  )
  const maxPerArm = data ? Math.ceil(fixedPerArm * data.inflation) : Math.ceil(fixedPerArm)

  const chartData = useMemo(
    () =>
      data
        ? data.timing.map((t, k) => ({
            t,
            eff: Number.isFinite(data.upper[k]) ? Math.min(data.upper[k], Z_CAP) : null,
            effRaw: data.upper[k],
            fut: Number.isFinite(data.lower[k]) ? Math.max(data.lower[k], -3) : null,
            futRaw: data.lower[k],
          }))
        : [],
    [data],
  )

  const controls = (
    <>
      <ControlCard title="Boundaries">
        <Slider label="Number of analyses (incl. final)" value={K} min={1} max={8} onChange={setK} />
        <Select
          label="Efficacy boundary"
          value={family}
          onChange={setFamily}
          options={(Object.keys(BOUNDARY_LABELS) as BoundaryFamily[]).map((f) => ({ value: f, label: BOUNDARY_LABELS[f] }))}
        />
        {family === 'hsd' && <Slider label="HSD γ" value={gamma} min={-8} max={2} step={0.5} onChange={setGamma} hint="γ = −4 ≈ O'Brien–Fleming; γ = 1 ≈ Pocock" />}
        {family === 'haybittle' && <Slider label="Interim critical Z" value={hpZ} min={2.5} max={3.5} step={0.05} onChange={setHpZ} format={(v) => fmt(v, 2)} />}
        <Segmented
          label="One-sided α"
          value={alpha}
          onChange={setAlpha}
          options={[
            { value: 0.025, label: '0.025' },
            { value: 0.05, label: '0.05' },
            { value: 0.005, label: '0.005' },
          ]}
        />
        <Slider label="Power" value={power} min={0.7} max={0.95} step={0.05} onChange={setPower} format={(v) => pct(v, 0)} />
      </ControlCard>
      <ControlCard title="Futility (non-binding)">
        <Segmented
          value={futType}
          onChange={setFutType}
          options={[
            { value: 'none', label: 'None' },
            { value: 'z', label: 'Z below' },
            { value: 'cp', label: 'CP below' },
          ]}
        />
        {futType === 'z' && <Slider label="Stop if interim Z <" value={futZ} min={-1} max={1.5} step={0.1} onChange={setFutZ} format={(v) => fmt(v, 1)} />}
        {futType === 'cp' && (
          <Slider
            label="Stop if conditional power (design effect) <"
            value={futCp}
            min={0.05}
            max={0.3}
            step={0.05}
            onChange={setFutCp}
            format={(v) => pct(v, 0)}
          />
        )}
      </ControlCard>
      <ControlCard title="Endpoint (binary, for sample size)">
        <NumberField label="Control response rate" value={pC} min={0.01} max={0.95} step={0.01} onChange={setPC} />
        <NumberField label="Design treatment rate" value={pT} min={0.01} max={0.99} step={0.01} onChange={setPT} />
        <p className="text-xs text-muted">Fixed design: {fmtInt(Math.ceil(fixedPerArm))}/arm.</p>
      </ControlCard>
    </>
  )

  return (
    <LabLayout
      id="group-sequential"
      lead="Boundaries are computed exactly by recursive numerical integration (the method behind gsDesign, rpact and EAST) and reproduce the published Pocock, O'Brien–Fleming and Lan–DeMets tables."
      controls={controls}
    >
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'design', label: 'Design & operating characteristics' },
          { id: 'peeking', label: 'Why not just peek?' },
          { id: 'dmc', label: 'You are the DMC' },
          { id: 'bias', label: 'Early-stopping bias' },
        ]}
      />
      {!data ? (
        <div className="py-16 text-center text-sm text-muted">Computing boundaries…</div>
      ) : (
        <div className={cn('space-y-6', loading && 'opacity-60 transition-opacity')}>
          {tab === 'design' && <DesignTab data={data} chartData={chartData} fixedPerArm={fixedPerArm} maxPerArm={maxPerArm} power={power} alpha={alpha} />}
          {tab === 'peeking' && <PeekingTab data={data} />}
          {tab === 'dmc' && <DmcTab data={data} pC={pC} pT={pT} maxPerArm={maxPerArm} />}
          {tab === 'bias' && <BiasTab data={data} />}
        </div>
      )}
    </LabLayout>
  )
}

function DesignTab({
  data,
  chartData,
  fixedPerArm,
  maxPerArm,
  power,
  alpha,
}: {
  data: GsdResponse
  chartData: Array<{ t: number; eff: number | null; effRaw: number; fut: number | null; futRaw: number }>
  fixedPerArm: number
  maxPerArm: number
  power: number
  alpha: number
}) {
  const hasFut = data.lower.some((l) => Number.isFinite(l))
  const totalFixed = 2 * Math.ceil(fixedPerArm)
  const totalMax = 2 * maxPerArm
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Max sample size" value={fmtInt(totalMax)} sub={`inflation ×${fmt(data.inflation, 3)} vs ${fmtInt(totalFixed)} fixed`} />
        <Stat label="Expected N if H1 true" value={fmtInt(data.ocH1.expectedInfo * totalMax)} sub={`${pct(data.ocH1.expectedInfo * totalMax / totalFixed - 1, 0)} vs fixed`} tone={data.ocH1.expectedInfo * totalMax < totalFixed ? 'good' : undefined} />
        <Stat label="Expected N if H0 true" value={fmtInt(data.ocH0.expectedInfo * totalMax)} sub={hasFut ? 'futility saves patients' : 'no futility rule'} />
        <Stat label={hasFut ? 'Power, futility followed' : 'Power'} value={pct(data.ocH1.power, 1)} sub={hasFut ? `${pct(power, 0)} if futility ignored` : undefined} />
        <Stat label={hasFut ? 'Type I error, futility followed' : 'Type I error'} value={fmt(data.typeIWithFutility, 4)} sub={hasFut ? `${alpha} if ignored (non-binding)` : undefined} />
      </div>

      <ChartFrame
        title="Stopping boundaries on the Z scale"
        subtitle={`Efficacy above the upper line; futility below the lower line. Values beyond the axis (above ${Z_CAP}, below −3) are drawn at the edge.`}
        legend={[
          { label: 'Efficacy boundary', color: SERIES.s3 },
          ...(hasFut ? [{ label: 'Futility boundary', color: SERIES.s2 }] : []),
          { label: 'Fixed-design critical value', color: 'var(--axis)' },
        ]}
        height={300}
      >
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="t" type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} label={{ value: 'Information fraction', position: 'insideBottom', offset: -8 }} />
            <YAxis domain={[-3, Z_CAP]} ticks={[-3, -2, -1, 0, 1, 2, 3, 4, 5, 6]} {...axisProps} width={36} />
            <ReferenceLine y={normQuantile(1 - alpha)} stroke="var(--axis)" />
            <ReferenceLine y={0} stroke="var(--grid)" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0].payload
                return (
                  <TooltipBox
                    title={`Look at ${pct(p.t, 0)} information`}
                    rows={[
                      { label: 'Efficacy Z', value: Number.isFinite(p.effRaw) ? fmt(p.effRaw, 3) : 'no stop', color: SERIES.s3 },
                      ...(Number.isFinite(p.futRaw) ? [{ label: 'Futility Z', value: fmt(p.futRaw, 3), color: SERIES.s2 }] : []),
                    ]}
                  />
                )
              }}
            />
            <Line dataKey="eff" stroke={SERIES.s3} strokeWidth={2} dot={{ r: 5, fill: SERIES.s3, stroke: 'var(--surface)', strokeWidth: 2 }} isAnimationActive={false} connectNulls />
            {hasFut && <Line dataKey="fut" stroke={SERIES.s2} strokeWidth={2} dot={{ r: 5, fill: SERIES.s2, stroke: 'var(--surface)', strokeWidth: 2 }} isAnimationActive={false} connectNulls />}
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <Card>
        <CardHeader title="Boundary table" subtitle="What goes in the protocol / DMC charter. P(stop) columns use the design effect (H1) and no effect (H0)." />
        <CardBody className="overflow-x-auto pt-3">
          <table className="w-full min-w-[720px] text-sm tabular">
            <thead className="text-left text-xs text-ink-2">
              <tr className="border-b border-line">
                <th className="py-2 pr-3 font-semibold">Look</th>
                <th className="py-2 pr-3 font-semibold">Info</th>
                <th className="py-2 pr-3 font-semibold">N per arm</th>
                <th className="py-2 pr-3 font-semibold">Efficacy Z</th>
                <th className="py-2 pr-3 font-semibold">Nominal p (1-sided)</th>
                <th className="py-2 pr-3 font-semibold">Cumulative α</th>
                <th className="py-2 pr-3 font-semibold">Futility Z</th>
                <th className="py-2 pr-3 font-semibold">P(efficacy) H1</th>
                <th className="py-2 pr-3 font-semibold">P(futility) H1</th>
                <th className="py-2 font-semibold">P(futility) H0</th>
              </tr>
            </thead>
            <tbody>
              {data.timing.map((t, k) => (
                <tr key={k} className="border-b border-line">
                  <td className="py-2 pr-3">{k + 1}</td>
                  <td className="py-2 pr-3">{pct(t, 0)}</td>
                  <td className="py-2 pr-3">{fmtInt(Math.ceil(t * maxPerArm))}</td>
                  <td className="py-2 pr-3 font-medium">{fmt(data.upper[k], 3)}</td>
                  <td className="py-2 pr-3">{fmtP(data.nominalP[k])}</td>
                  <td className="py-2 pr-3">{fmt(data.cumulativeAlpha[k], 5)}</td>
                  <td className="py-2 pr-3">{Number.isFinite(data.lower[k]) ? fmt(data.lower[k], 3) : '—'}</td>
                  <td className="py-2 pr-3">{pct(data.ocH1.pEfficacy[k], 1)}</td>
                  <td className="py-2 pr-3">{pct(data.ocH1.pFutility[k], 1)}</td>
                  <td className="py-2">{pct(data.ocH0.pFutility[k], 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted">
            Efficacy bounds are computed ignoring futility (non-binding) so Type I error is controlled even if the DMC overrules a futility stop. With half the design
            effect, power is {pct(data.ocHalf.power, 0)} and expected N is {fmtInt(data.ocHalf.expectedInfo * 2 * maxPerArm)}.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="key"
          title="Pick the shape for the job"
          md="**O'Brien–Fleming-type** boundaries make early stopping hard (Z ≈ 4.3 at 25% information) and cost almost nothing at the end (final Z ≈ 2.0) — the default for confirmatory trials. **Pocock-type** boundaries stop early more easily but need a much larger final Z and inflate the maximum N by ~20%. **Haybittle–Peto** uses a fixed, very strict interim threshold (Z ≈ 3) that is easy to explain."
        />
        <Callout
          tone="practice"
          title="Spending functions buy flexibility"
          md="With a Lan–DeMets spending function, the number and timing of looks need not be fixed in advance: each look spends α(t) − α(t_prev) at its actual information fraction. For time-to-event trials, information is the number of events, not patients."
        />
      </div>
    </>
  )
}

function PeekingTab({ data }: { data: GsdResponse }) {
  return (
    <>
      <ChartFrame
        title="Overall false-positive rate when testing at one-sided p < 0.025 at every look"
        subtitle="Equally spaced looks, no correction. Computed exactly with the same engine."
        height={300}
      >
        <ResponsiveContainer>
          <BarChart data={data.peeking} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="K" {...axisProps} label={{ value: 'Number of looks', position: 'insideBottom', offset: -8 }} />
            <YAxis tickFormatter={(v) => pct(v, 0)} {...axisProps} width={44} />
            <ReferenceLine y={0.025} stroke="var(--axis)" />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TooltipBox title={`${payload[0].payload.K} looks`} rows={[{ label: 'Actual Type I error', value: pct(payload[0].payload.alpha, 2), color: SERIES.s2 }]} />
                ) : null
              }
            />
            <Bar dataKey="alpha" fill={SERIES.s2} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="evidence"
          md={`Armitage, McPherson & Rowe (1969) showed that repeatedly testing accumulating data at the nominal level inflates the false-positive rate: with 5 looks a nominal two-sided 5% test has a true error of about 14%, and with 10 looks about 19%. Here, one-sided: ${pct(data.peeking.find((p) => p.K === 5)!.alpha, 1)} at 5 looks, ${pct(data.peeking.find((p) => p.K === 20)!.alpha, 1)} at 20.`}
        />
        <Callout
          tone="myth"
          md="“We'll only stop if it's *really* significant.” Unless *really* is defined in advance as a boundary that accounts for the number and timing of looks, any data-driven stopping inflates error. The fix is not to avoid interim analyses — it is to plan them."
        />
      </div>
    </>
  )
}

function DmcTab({ data, pC, pT, maxPerArm }: { data: GsdResponse; pC: number; pT: number; maxPerArm: number }) {
  const [effect, setEffect] = useState<'null' | 'half' | 'design' | 'large'>('design')
  const [seed, setSeed] = useState(1)
  const [shown, setShown] = useState(1)
  const trueT = effect === 'null' ? pC : effect === 'half' ? pC + (pT - pC) / 2 : effect === 'design' ? pT : Math.min(0.99, pC + 1.5 * (pT - pC))
  const looks = useMemo(
    () =>
      simulateGsTrial({
        pControl: pC,
        pTreatment: trueT,
        nMaxPerArm: maxPerArm,
        timing: data.timing,
        upper: data.upper,
        lower: data.lower,
        designDrift: data.drift,
        seed,
      }),
    [pC, trueT, maxPerArm, data, seed],
  )
  const visible = looks.slice(0, shown)
  const last = visible[visible.length - 1]
  const finished = shown >= looks.length
  const chart = data.timing.map((t, k) => ({
    t,
    eff: Number.isFinite(data.upper[k]) ? Math.min(data.upper[k], Z_CAP) : null,
    fut: Number.isFinite(data.lower[k]) ? Math.max(data.lower[k], -3) : null,
    z: k < visible.length ? Math.max(-3, Math.min(Z_CAP, visible[k].z)) : null,
  }))

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <Segmented
          label="True effect (hidden from the DMC in real life)"
          value={effect}
          onChange={(v) => {
            setEffect(v)
            setShown(1)
          }}
          options={[
            { value: 'null', label: 'None' },
            { value: 'half', label: 'Half' },
            { value: 'design', label: 'As designed' },
            { value: 'large', label: '1.5×' },
          ]}
        />
        <Button
          variant="secondary"
          onClick={() => {
            setSeed((s) => s + 1)
            setShown(1)
          }}
        >
          <Dices className="h-4 w-4" /> New trial
        </Button>
        <Button onClick={() => setShown((s) => s + 1)} disabled={finished}>
          <StepForward className="h-4 w-4" /> Next look
        </Button>
      </div>
      <p className="text-sm text-ink-2">
        Truth: control {pct(pC, 0)}, treatment {pct(trueT, 0)}. Before pressing <em>Next look</em>, decide what you would recommend from the conditional and predictive
        power below — then compare with the pre-specified rule.
      </p>

      <ChartFrame
        title="Observed Z at each look"
        legend={[
          { label: 'Observed Z', color: SERIES.s1, kind: 'dot' },
          { label: 'Efficacy boundary', color: SERIES.s3 },
          ...(data.lower.some((l) => Number.isFinite(l)) ? [{ label: 'Futility boundary', color: SERIES.s2 }] : []),
        ]}
        height={280}
      >
        <ResponsiveContainer>
          <LineChart data={chart} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="t" type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} />
            <YAxis domain={[-3, Z_CAP]} {...axisProps} width={36} />
            <ReferenceLine y={0} stroke="var(--axis)" />
            <Line dataKey="eff" stroke={SERIES.s3} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
            <Line dataKey="fut" stroke={SERIES.s2} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls />
            <Line dataKey="z" stroke={SERIES.s1} strokeWidth={2} dot={{ r: 5, fill: SERIES.s1, stroke: 'var(--surface)', strokeWidth: 2 }} isAnimationActive={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0].payload
                return (
                  <TooltipBox
                    title={`${pct(p.t, 0)} information`}
                    rows={[
                      ...(p.z !== null ? [{ label: 'Observed Z', value: fmt(p.z, 2), color: SERIES.s1 }] : []),
                      ...(p.eff !== null ? [{ label: 'Efficacy', value: fmt(p.eff, 2), color: SERIES.s3 }] : []),
                    ]}
                  />
                )
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm tabular">
          <thead className="bg-surface-2 text-left text-xs text-ink-2">
            <tr>
              <th className="px-3 py-2 font-semibold">Look</th>
              <th className="px-3 py-2 font-semibold">Responders C / T</th>
              <th className="px-3 py-2 font-semibold">Z</th>
              <th className="px-3 py-2 font-semibold">CP (current trend)</th>
              <th className="px-3 py-2 font-semibold">CP (design effect)</th>
              <th className="px-3 py-2 font-semibold">Predictive power</th>
              <th className="px-3 py-2 font-semibold">Rule says</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((l) => (
              <tr key={l.look} className="border-t border-line">
                <td className="px-3 py-2">
                  {l.look} <span className="text-muted">({fmtInt(l.nPerArm)}/arm)</span>
                </td>
                <td className="px-3 py-2">
                  {l.respC} / {l.respT} <span className="text-muted">({pct(l.respC / l.nPerArm, 0)} vs {pct(l.respT / l.nPerArm, 0)})</span>
                </td>
                <td className="px-3 py-2 font-medium">{fmt(l.z, 2)}</td>
                <td className="px-3 py-2">{l.t < 1 ? pct(l.cpTrend, 0) : '—'}</td>
                <td className="px-3 py-2">{l.t < 1 ? pct(l.cpDesign, 0) : '—'}</td>
                <td className="px-3 py-2">{l.t < 1 ? pct(l.predictive, 0) : '—'}</td>
                <td className="px-3 py-2">
                  <Badge
                    tone={
                      l.decision === 'efficacy' || l.decision === 'final-success'
                        ? 'good'
                        : l.decision === 'futility' || l.decision === 'final-fail'
                          ? 'bad'
                          : 'neutral'
                    }
                  >
                    {{ efficacy: 'Stop: efficacy', futility: 'Stop: futility', continue: 'Continue', 'final-success': 'Final: success', 'final-fail': 'Final: not significant' }[l.decision]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {finished && last && (
        <Callout
          tone={last.decision === 'efficacy' || last.decision === 'final-success' ? 'practice' : 'pitfall'}
          md={`Trial ended at look ${last.look} (${pct(last.t, 0)} information): **${{ efficacy: 'stopped for efficacy', futility: 'stopped for futility', continue: '', 'final-success': 'significant at the final analysis', 'final-fail': 'not significant at the final analysis' }[last.decision]}**. ${effect === 'null' && (last.decision === 'efficacy' || last.decision === 'final-success') ? 'This is a false positive — it happens in at most α of trials when the boundaries are respected.' : ''} Observed difference ${pct(last.respT / last.nPerArm - last.respC / last.nPerArm, 1)} vs true ${pct(trueT - pC, 1)}.`}
        />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="pitfall"
          title="Three conditional powers, three answers"
          md="CP under the **current trend** treats a noisy interim estimate as truth; CP under the **design effect** ignores what the data say; **predictive power** averages over uncertainty (Bayesian, flat prior). Specify in the charter which one triggers a futility discussion — and remember all three are guides, not rules, unless pre-specified as binding."
        />
        <Callout
          tone="regulatory"
          md="FDA's DMC draft guidance (2024 revision) and ICH E9 expect interim comparative results to be seen only by an independent DMC and its unblinded statistician; the sponsor remains blinded. The DMC charter fixes boundaries, timing, membership and communication before the first look."
        />
      </div>
    </>
  )
}

function BiasTab({ data }: { data: GsdResponse }) {
  const [reps] = useState(6000)
  const { data: bias, loading } = useCompute<'stoppingBias', StoppingBiasResult>('stoppingBias', {
    timing: data.timing,
    upper: data.upper,
    theta: data.drift,
    reps,
    seed: 2024,
  })
  const rows = bias ? bias.byLook.map((b) => ({ look: `Look ${b.look}`, ratio: b.meanRatio, prob: b.probStop })) : []
  return (
    <>
      <p className="text-sm text-ink-2">
        {fmtInt(reps)} simulated trials with the true effect exactly as designed, monitored with your efficacy boundaries. For each trial we record the effect
        estimate at the moment it stopped, divided by the true effect.
      </p>
      {bias && (
        <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-3', loading && 'opacity-60')}>
          <Stat label="Mean estimate ÷ truth, trials stopped early" value={`${fmt(bias.earlyStopMeanRatio, 2)}×`} tone={bias.earlyStopMeanRatio > 1.1 ? 'warn' : undefined} />
          <Stat label="Mean estimate ÷ truth, all trials" value={`${fmt(bias.overallMeanRatio, 2)}×`} />
          <Stat label="Share stopped early" value={pct(1 - bias.byLook[bias.byLook.length - 1].probStop, 0)} />
        </div>
      )}
      <ChartFrame title="Average estimated effect ÷ true effect, by stopping look" subtitle="1.0 = unbiased. The earlier the stop, the larger the exaggeration." height={260}>
        <ResponsiveContainer>
          <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="look" {...axisProps} />
            <YAxis domain={[0, 'auto']} {...axisProps} width={36} tickFormatter={(v) => `${fmt(v, 1)}×`} />
            <ReferenceLine y={1} stroke="var(--axis)" />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TooltipBox
                    title={payload[0].payload.look}
                    rows={[
                      { label: 'Mean estimate ÷ truth', value: `${fmt(payload[0].payload.ratio, 2)}×`, color: SERIES.s1 },
                      { label: 'Share of trials stopping here', value: pct(payload[0].payload.prob, 1) },
                    ]}
                  />
                ) : null
              }
            />
            <Bar dataKey="ratio" fill={SERIES.s1} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="evidence"
          md="Bassler et al. (*JAMA* 2010) compared 91 RCTs stopped early for benefit with 424 similar trials that were not: truncated trials overestimated effects (ratio of relative risks 0.71), most markedly when they had fewer than 500 events."
        />
        <Callout
          tone="practice"
          title="Reporting a stopped trial"
          md="Report the boundary that was crossed, the information fraction, and — where feasible — bias-adjusted estimates and repeated or stage-wise-ordered confidence intervals alongside the naive estimate. Interpret large early effects with caution; prefer stopping rules that require overwhelming evidence early (O'Brien–Fleming-type)."
        />
      </div>
    </>
  )
}
