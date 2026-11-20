import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FlaskConical } from 'lucide-react'
import { ControlCard, LabLayout } from '@/components/LabLayout'
import { Segmented, Slider, Toggle } from '@/components/ui/controls'
import { Button, Stat } from '@/components/ui/primitives'
import { ChartFrame, TooltipBox } from '@/components/ChartKit'
import { axisProps, gridProps, niceTicks, SERIES } from '@/lib/chart'
import { Markdown } from '@/components/Markdown'
import { Callout } from '@/components/Callout'
import {
  eventProbability,
  eventsSchoenfeld,
  inflateForDropout,
  nMeans,
  nProportions,
  nProportionsNI,
  powerEvents,
  powerMeans,
  powerProportions,
  powerProportionsNI,
} from '@/lib/stats/sampleSize'
import { normQuantile } from '@/lib/stats/distributions'
import { empiricalPowerBinary, empiricalPowerBinaryNI, empiricalPowerMeans } from '@/lib/stats/simulate'
import { fmt, fmtInt, pct } from '@/lib/utils'

type Endpoint = 'continuous' | 'binary' | 'tte'
type Hyp = 'superiority' | 'ni'

export default function SampleSizeLab() {
  const [endpoint, setEndpoint] = useState<Endpoint>('binary')
  const [hyp, setHyp] = useState<Hyp>('superiority')
  const [alpha2, setAlpha2] = useState(0.05) // two-sided for superiority; NI uses one-sided α = alpha2/2
  const [power, setPower] = useState(0.8)
  const [k, setK] = useState(1)
  const [dropout, setDropout] = useState(0.1)
  // continuous
  const [delta, setDelta] = useState(5)
  const [sd, setSd] = useState(12)
  // binary
  const [pC, setPC] = useState(0.3)
  const [pE, setPE] = useState(0.2)
  const [cc, setCc] = useState(false)
  const [margin, setMargin] = useState(0.1)
  const [niMarginCont, setNiMarginCont] = useState(4)
  // tte
  const [hr, setHr] = useState(0.75)
  const [incC, setIncC] = useState(0.3)

  const [sim, setSim] = useState<{ key: string; value: number } | null>(null)

  const a1 = alpha2 / 2
  const isNI = hyp === 'ni' && endpoint !== 'tte'

  const res = useMemo(() => {
    if (endpoint === 'continuous') {
      const r = nMeans({ delta: isNI ? 0 : delta, sd, alphaOneSided: a1, power, k, margin: isNI ? niMarginCont : 0 })
      return { r, events: null as number | null }
    }
    if (endpoint === 'binary') {
      const r = isNI
        ? nProportionsNI({ pControl: pC, pExperimental: pE, margin, alphaOneSided: a1, power, k })
        : nProportions({ pControl: pC, pExperimental: pE, alphaOneSided: a1, power, k, continuityCorrection: cc })
      return { r, events: null }
    }
    const d = eventsSchoenfeld({ hr, alphaOneSided: a1, power, k })
    const pEv = eventProbability(incC, hr, k)
    const total = d / pEv
    const nC = total / (1 + k)
    return {
      r: { nControl: nC, nExperimental: nC * k, total: Math.ceil(nC) + Math.ceil(nC * k), perArmRounded: [Math.ceil(nC), Math.ceil(nC * k)] as [number, number] },
      events: Math.ceil(d),
    }
  }, [endpoint, isNI, delta, sd, a1, power, k, niMarginCont, pC, pE, margin, cc, hr, incC])

  const invalid =
    (endpoint === 'binary' && !isNI && Math.abs(pE - pC) < 0.005) ||
    (endpoint === 'binary' && isNI && pE - pC + margin <= 0) ||
    (endpoint === 'tte' && Math.abs(hr - 1) < 0.005)

  const totalAfterDropout = Math.ceil(inflateForDropout(res.r.total, dropout))

  // power as a function of total N (control fraction 1/(1+k))
  const powerCurve = useMemo(() => {
    if (invalid) return []
    const target = res.events ?? res.r.total
    const maxN = Math.max(20, Math.ceil(target * 2))
    const pts: Array<{ n: number; power: number }> = []
    for (let i = 1; i <= 60; i++) {
      const n = (maxN * i) / 60
      const n1 = n / (1 + k)
      const n2 = n - n1
      let pw: number
      if (endpoint === 'continuous') pw = powerMeans(isNI ? 0 : delta, sd, n1, n2, a1, isNI ? niMarginCont : 0)
      else if (endpoint === 'binary')
        pw = isNI
          ? powerProportionsNI(pC, pE, n1, n2, margin, a1)
          : powerProportions(pC, pE, n1, n2, a1)
      else pw = powerEvents(hr, n, a1, k)
      pts.push({ n: Math.round(n), power: pw })
    }
    return pts
  }, [invalid, res, k, endpoint, isNI, delta, sd, a1, niMarginCont, pE, pC, margin, hr])

  // required N as the effect shrinks: inverse-square law
  const sensitivity = useMemo(() => {
    if (invalid) return []
    const pts: Array<{ f: number; n: number }> = []
    for (let f = 0.5; f <= 1.501; f += 0.05) {
      let n: number
      if (endpoint === 'continuous') {
        n = isNI
          ? nMeans({ delta: 0, sd, alphaOneSided: a1, power, k, margin: niMarginCont * f }).total
          : nMeans({ delta: delta * f, sd, alphaOneSided: a1, power, k }).total
      } else if (endpoint === 'binary') {
        n = isNI
          ? nProportionsNI({ pControl: pC, pExperimental: pE, margin: margin * f, alphaOneSided: a1, power, k }).total
          : nProportions({ pControl: pC, pExperimental: pC + (pE - pC) * f, alphaOneSided: a1, power, k, continuityCorrection: cc }).total
      } else {
        n = Math.ceil(eventsSchoenfeld({ hr: Math.exp(Math.log(hr) * f), alphaOneSided: a1, power, k }))
      }
      pts.push({ f: Math.round(f * 100), n })
    }
    return pts
  }, [invalid, endpoint, isNI, sd, a1, power, k, niMarginCont, delta, pC, pE, margin, cc, hr])

  const za = normQuantile(1 - a1)
  const zb = normQuantile(power)

  const formula = useMemo(() => {
    const kk = fmt(k, k % 1 ? 1 : 0)
    if (endpoint === 'continuous') {
      const eff = isNI ? `0 + ${niMarginCont}` : `${delta}`
      return `$$n_C = \\frac{(1 + 1/k)\\,\\sigma^2\\,(z_{1-\\alpha}+z_{1-\\beta})^2}{(\\Delta${isNI ? ' + M' : ''})^2} = \\frac{(1+1/${kk})\\cdot ${sd}^2\\cdot(${fmt(za, 3)}+${fmt(zb, 3)})^2}{(${eff})^2} = ${fmt(res.r.nControl, 1)}$$`
    }
    if (endpoint === 'binary') {
      if (isNI)
        return `$$n_C = \\frac{(z_{1-\\alpha}+z_{1-\\beta})^2\\,[p_C(1-p_C) + p_E(1-p_E)/k]}{(p_E - p_C + M)^2} = ${fmt(res.r.nControl, 1)}$$`
      return `$$n_C = \\frac{\\left[z_{1-\\alpha}\\sqrt{\\bar p(1-\\bar p)(1+1/k)} + z_{1-\\beta}\\sqrt{p_C(1-p_C)+p_E(1-p_E)/k}\\right]^2}{(p_E-p_C)^2} = ${fmt(res.r.nControl, 1)}${cc ? '\\ \\text{(with continuity correction)}' : ''}$$`
    }
    return `$$d = \\frac{(z_{1-\\alpha}+z_{1-\\beta})^2}{r(1-r)\\,(\\ln \\mathrm{HR})^2} = \\frac{(${fmt(za, 3)}+${fmt(zb, 3)})^2}{${fmt(k / (1 + k), 3)}\\cdot${fmt(1 / (1 + k), 3)}\\cdot(${fmt(Math.log(hr), 3)})^2} = ${fmt(eventsSchoenfeld({ hr, alphaOneSided: a1, power, k }), 1)}\\ \\text{events}$$`
  }, [endpoint, isNI, niMarginCont, delta, sd, k, za, zb, res, cc, hr, a1, power])

  const simKey = JSON.stringify([endpoint, hyp, delta, sd, pC, pE, margin, niMarginCont, k, a1, res.r.perArmRounded, cc])
  const canSimulate = endpoint !== 'tte' && !invalid && res.r.total <= 40000
  const runSim = () => {
    const [n1, n2] = res.r.perArmRounded
    let v: number
    if (endpoint === 'continuous') v = empiricalPowerMeans(isNI ? 0 : delta, sd, n1, n2, a1, 2000, 7, isNI ? niMarginCont : 0)
    else if (isNI) {
      v = empiricalPowerBinaryNI(pC, pE, n1, n2, margin, a1, 2000, 7)
    } else v = empiricalPowerBinary(pC, pE, n1, n2, a1, 2000, 7)
    setSim({ key: simKey, value: v })
  }

  const controls = (
    <>
      <ControlCard title="Design">
        <Segmented
          label="Primary endpoint"
          value={endpoint}
          onChange={(v) => {
            setEndpoint(v)
            setSim(null)
          }}
          options={[
            { value: 'binary', label: 'Binary' },
            { value: 'continuous', label: 'Continuous' },
            { value: 'tte', label: 'Time-to-event' },
          ]}
        />
        {endpoint !== 'tte' && (
          <Segmented
            label="Hypothesis"
            value={hyp}
            onChange={(v) => {
              setHyp(v)
              setSim(null)
              if (endpoint === 'binary') {
                if (v === 'ni') {
                  setPC(0.85)
                  setPE(0.85)
                } else {
                  setPC(0.3)
                  setPE(0.2)
                }
              }
            }}
            options={[
              { value: 'superiority', label: 'Superiority' },
              { value: 'ni', label: 'Non-inferiority' },
            ]}
          />
        )}
        <Slider
          label={isNI ? 'One-sided α' : 'Two-sided α'}
          value={alpha2}
          min={0.01}
          max={0.1}
          step={0.01}
          onChange={setAlpha2}
          format={(v) => (isNI ? fmt(v / 2, 3) : fmt(v, 2))}
        />
        <Slider label="Power (1 − β)" value={power} min={0.7} max={0.95} step={0.05} onChange={setPower} format={(v) => pct(v, 0)} />
        <Segmented
          label="Allocation (experimental : control)"
          value={k}
          onChange={setK}
          options={[
            { value: 1, label: '1:1' },
            { value: 1.5, label: '3:2' },
            { value: 2, label: '2:1' },
            { value: 3, label: '3:1' },
          ]}
        />
        <Slider label="Anticipated loss to follow-up" value={dropout} min={0} max={0.3} step={0.01} onChange={setDropout} format={(v) => pct(v, 0)} />
      </ControlCard>

      <ControlCard title="Assumptions">
        {endpoint === 'continuous' && (
          <>
            {!isNI && (
              <Slider
                label="Difference to detect (Δ)"
                value={delta}
                min={1}
                max={20}
                step={0.5}
                onChange={setDelta}
                hint="Use the minimal clinically important difference, not the hoped-for effect."
              />
            )}
            {isNI && <Slider label="NI margin (M)" value={niMarginCont} min={1} max={15} step={0.5} onChange={setNiMarginCont} hint="True difference assumed 0." />}
            <Slider label="Outcome SD (σ)" value={sd} min={2} max={40} step={0.5} onChange={setSd} />
            <p className="text-xs text-muted">Standardized effect = {fmt((isNI ? niMarginCont : delta) / sd, 2)} SD</p>
          </>
        )}
        {endpoint === 'binary' && (
          <>
            <Slider label="Control event rate" value={pC} min={0.02} max={0.95} step={0.01} onChange={setPC} format={(v) => pct(v, 0)} />
            <Slider
              label={isNI ? 'Expected experimental rate' : 'Experimental event rate'}
              value={pE}
              min={0.02}
              max={0.95}
              step={0.01}
              onChange={setPE}
              format={(v) => pct(v, 0)}
            />
            {isNI ? (
              <Slider
                label="NI margin (absolute)"
                value={margin}
                min={0.01}
                max={0.2}
                step={0.01}
                onChange={setMargin}
                format={(v) => pct(v, 0)}
                hint="Higher rate = better outcome (e.g. cure). Non-inferior if pE − pC > −M."
              />
            ) : (
              <Toggle label="Continuity correction" checked={cc} onChange={setCc} hint="Fleiss–Tytun–Ury; closer to exact tests." />
            )}
            {!isNI && (
              <p className="text-xs text-muted">
                Absolute difference {pct(pE - pC, 1)} · relative risk {fmt(pE / pC, 2)} · NNT {Number.isFinite(1 / Math.abs(pE - pC)) ? Math.ceil(1 / Math.abs(pE - pC)) : '—'}
              </p>
            )}
          </>
        )}
        {endpoint === 'tte' && (
          <>
            <Slider label="Hazard ratio to detect" value={hr} min={0.4} max={0.95} step={0.01} onChange={setHr} format={(v) => fmt(v, 2)} />
            <Slider
              label="Control cumulative incidence by end of follow-up"
              value={incC}
              min={0.05}
              max={0.9}
              step={0.01}
              onChange={setIncC}
              format={(v) => pct(v, 0)}
              hint="Converts events to patients under proportional hazards; ignores staggered entry."
            />
          </>
        )}
      </ControlCard>
    </>
  )

  return (
    <LabLayout
      id="sample-size"
      lead="Every input is an assumption you must defend in the protocol. Change one and watch how strongly — and in which direction — the trial size responds."
      controls={controls}
    >
      {invalid ? (
        <Callout tone="pitfall" md="The effect is zero (or the NI hypothesis is already false at the assumed rates). No finite sample size achieves power — revise the assumptions." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {res.events !== null && <Stat label="Events required" value={fmtInt(res.events)} sub="drives power for TTE" />}
            <Stat label="Control arm" value={fmtInt(res.r.perArmRounded[0])} sub="evaluable patients" />
            <Stat label="Experimental arm" value={fmtInt(res.r.perArmRounded[1])} sub="evaluable patients" />
            <Stat label="Total" value={fmtInt(res.r.total)} sub="evaluable" />
            {res.events === null && <Stat label={`Enrol (${pct(dropout, 0)} loss)`} value={fmtInt(totalAfterDropout)} sub="N ÷ (1 − loss)" />}
          </div>
          {res.events !== null && (
            <p className="-mt-3 text-sm text-ink-2">
              Enrol ≈ <strong className="tabular">{fmtInt(totalAfterDropout)}</strong> allowing {pct(dropout, 0)} loss. Power in a time-to-event trial depends on
              the number of <em>events</em>; the patient count is whatever it takes to observe them.
            </p>
          )}

          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-1 text-sm font-semibold">The formula, with your numbers</div>
            <Markdown compact>{formula}</Markdown>
            <p className="mt-2 text-xs text-muted">
              z₁₋α = {fmt(za, 3)} (one-sided α = {fmt(a1, 4)}), z₁₋β = {fmt(zb, 3)}. k = experimental/control. Normal approximation; rounded up per arm.
            </p>
          </div>

          {canSimulate && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4">
              <Button variant="secondary" onClick={runSim}>
                <FlaskConical className="h-4 w-4" /> Verify by simulating 2,000 trials
              </Button>
              {sim && sim.key === simKey ? (
                <span className="text-sm">
                  Empirical power at this N: <strong className="tabular">{pct(sim.value, 1)}</strong>{' '}
                  <span className="text-muted">(target {pct(power, 0)}; Monte Carlo SE ≈ {pct(Math.sqrt((power * (1 - power)) / 2000), 1)})</span>
                </span>
              ) : (
                <span className="text-sm text-muted">Simulates patient-level data and runs the planned test on each synthetic trial.</span>
              )}
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartFrame
              title={res.events !== null ? 'Power vs number of events' : 'Power vs total sample size'}
              subtitle="The curve flattens: the last 10% of power costs far more patients than the first."
            >
              <ResponsiveContainer>
                <LineChart data={powerCurve} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="n" type="number" domain={[0, 'dataMax']} ticks={niceTicks(powerCurve.length ? powerCurve[powerCurve.length - 1].n : 1)} {...axisProps} label={{ value: res.events !== null ? 'Events' : 'Total N', position: 'insideBottom', offset: -8 }} />
                  <YAxis domain={[0, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} width={44} />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <TooltipBox title={`N = ${fmtInt(payload[0].payload.n)}`} rows={[{ label: 'Power', value: pct(payload[0].payload.power, 1), color: SERIES.s1 }]} />
                      ) : null
                    }
                  />
                  <ReferenceLine y={power} stroke="var(--axis)" />
                  <Line type="monotone" dataKey="power" stroke={SERIES.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
                  <ReferenceDot x={res.events ?? res.r.total} y={power} r={5} fill={SERIES.s1} stroke="var(--surface)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
            <ChartFrame
              title={isNI ? 'Required N vs margin' : 'Required N vs effect size'}
              subtitle={isNI ? 'Halving the margin roughly quadruples N.' : 'N ∝ 1/Δ²: overestimate the effect by 25% and the trial is ~36% too small.'}
            >
              <ResponsiveContainer>
                <LineChart data={sensitivity} margin={{ top: 8, right: 12, bottom: 16, left: 4 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="f" type="number" domain={[50, 150]} tickFormatter={(v) => `${v}%`} {...axisProps} label={{ value: isNI ? '% of chosen margin' : '% of assumed effect (log-HR for TTE)', position: 'insideBottom', offset: -8 }} />
                  <YAxis
                    ticks={niceTicks(Math.max(...sensitivity.map((d) => d.n)))}
                    domain={[0, 'dataMax']}
                    tickFormatter={(v) => (v >= 10000 ? `${Math.round(v / 1000)}K` : fmtInt(v))}
                    {...axisProps}
                    width={52}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <TooltipBox
                          title={`${payload[0].payload.f}% of assumed ${isNI ? 'margin' : 'effect'}`}
                          rows={[{ label: res.events !== null ? 'Events' : 'Total N', value: fmtInt(payload[0].payload.n), color: SERIES.s2 }]}
                        />
                      ) : null
                    }
                  />
                  <ReferenceLine x={100} stroke="var(--axis)" />
                  <Line type="monotone" dataKey="n" stroke={SERIES.s2} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Callout
              tone="pitfall"
              title="Pilot-study effect sizes"
              md="Effect sizes from small pilots are wildly imprecise and, after selection on 'promising' results, biased upward (Kraemer et al. 2006). Size the trial on the smallest effect that would change practice, and use pilots for feasibility and variance estimates — preferably the upper confidence limit of the SD."
            />
            <Callout
              tone="practice"
              title="What reviewers check"
              md="SPIRIT 2025 asks for the outcome, the assumed values *and their source*, α, power, allocation ratio, and the dropout allowance. If the analysis adjusts for prognostic covariates, the variance reduction (≈ 1 − ρ²) can legitimately be used — but say so in advance."
            />
          </div>
        </>
      )}
    </LabLayout>
  )
}
