import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Check, Dices, Plus, Trash2, X } from 'lucide-react'
import { LabLayout } from '@/components/LabLayout'
import { Slider } from '@/components/ui/controls'
import { Button, Card, CardBody, CardHeader, Stat } from '@/components/ui/primitives'
import { ChartFrame, Legend, TooltipBox } from '@/components/ChartKit'
import { axisProps, gridProps, SERIES } from '@/lib/chart'
import { ForestPlot, type ForestRow } from '@/components/ForestPlot'
import { Callout } from '@/components/Callout'
import { bonferroni, fixedSequence, fwerIndependent, hochberg, holm } from '@/lib/stats/multiplicity'
import { createRng } from '@/lib/stats/rng'
import { normQuantile, normSf } from '@/lib/stats/distributions'
import { fmt, fmtP, pct } from '@/lib/utils'

interface Hyp {
  id: number
  name: string
  p: number
}

let hid = 10

const PRESET: Hyp[] = [
  { id: 1, name: 'Primary: CV death or HF hospitalisation', p: 0.012 },
  { id: 2, name: 'Key secondary: total HF hospitalisations', p: 0.031 },
  { id: 3, name: 'Key secondary: KCCQ score at 8 months', p: 0.018 },
  { id: 4, name: 'Key secondary: all-cause mortality', p: 0.21 },
]

function Mark({ ok }: { ok: boolean }) {
  return ok ? <Check className="mx-auto h-4 w-4 text-good" aria-label="rejected" /> : <X className="mx-auto h-4 w-4 text-muted" aria-label="not rejected" />
}

// ---------------------------------------------------------------------------
// Subgroup lottery: one trial, uniform true effect, 10 baseline characteristics
// ---------------------------------------------------------------------------

const CHARACTERISTICS = [
  ['Age < 65', 'Age ≥ 65'],
  ['Female', 'Male'],
  ['Diabetes', 'No diabetes'],
  ['eGFR < 60', 'eGFR ≥ 60'],
  ['Prior MI', 'No prior MI'],
  ['Region: Europe', 'Region: other'],
  ['BMI ≥ 30', 'BMI < 30'],
  ['Smoker', 'Non-smoker'],
  ['Enrolled Mon–Wed', 'Enrolled Thu–Sun'],
  ['Born Jan–Jun', 'Born Jul–Dec'],
] as const

function lotteryTrial(seed: number, nPerArm: number, pControl: number, trueOR: number) {
  const rng = createRng(seed)
  const oddsC = pControl / (1 - pControl)
  const pT = (oddsC * trueOR) / (1 + oddsC * trueOR)
  // counts[char][level][arm][event]
  const counts = CHARACTERISTICS.map(() => [
    [
      [0, 0],
      [0, 0],
    ],
    [
      [0, 0],
      [0, 0],
    ],
  ])
  const overall = [
    [0, 0],
    [0, 0],
  ]
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < nPerArm; i++) {
      const y = rng() < (arm === 1 ? pT : pControl) ? 1 : 0
      overall[arm][y]++
      for (let c = 0; c < CHARACTERISTICS.length; c++) {
        const lvl = rng() < 0.5 ? 0 : 1
        counts[c][lvl][arm][y]++
      }
    }
  }
  const logOr = (t: number[][]) => {
    // Woolf with 0.5 correction: t[arm][event]
    const a = t[1][1] + 0.5
    const b = t[1][0] + 0.5
    const c = t[0][1] + 0.5
    const d = t[0][0] + 0.5
    return { est: Math.log((a * d) / (b * c)), se: Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d) }
  }
  const z = normQuantile(0.975)
  const rows: ForestRow[] = []
  let sig = 0
  let interactions = 0
  const ov = logOr(overall)
  CHARACTERISTICS.forEach((pair, c) => {
    const l0 = logOr(counts[c][0])
    const l1 = logOr(counts[c][1])
    const zInt = (l0.est - l1.est) / Math.sqrt(l0.se ** 2 + l1.se ** 2)
    const intP = 2 * normSf(Math.abs(zInt))
    if (intP < 0.05) interactions++
    ;[l0, l1].forEach((l, lvl) => {
      const lo = Math.exp(l.est - z * l.se)
      const hi = Math.exp(l.est + z * l.se)
      const flagged = hi < 1 || lo > 1
      if (flagged) sig++
      rows.push({
        label: pair[lvl],
        est: Math.exp(l.est),
        lo,
        hi,
        emphasis: intP < 0.05 ? 'flag' : undefined,
        note: `interaction p = ${fmtP(intP)}`,
      })
    })
  })
  rows.push({ label: 'All patients', est: Math.exp(ov.est), lo: Math.exp(ov.est - z * ov.se), hi: Math.exp(ov.est + z * ov.se), emphasis: 'overall' })
  const overallSig = Math.exp(ov.est + z * ov.se) < 1
  const notSigBenefit = rows.slice(0, -1).filter((r) => r.hi >= 1).length
  return { rows, sig, interactions, overallSig, notSigBenefit }
}

export default function MultiplicityLab() {
  const [hyps, setHyps] = useState<Hyp[]>(PRESET)
  const [alpha, setAlpha] = useState(0.05)
  const [m, setM] = useState(10)
  const [seed, setSeed] = useState(4)
  const [trialsRun, setTrialsRun] = useState(1)

  const ps = hyps.map((h) => h.p)
  const results = useMemo(() => {
    const valid = ps.every((p) => p >= 0 && p <= 1)
    if (!valid || ps.length === 0) return null
    return { bon: bonferroni(ps, alpha), holm: holm(ps, alpha), hoch: hochberg(ps, alpha), fs: fixedSequence(ps, alpha) }
  }, [ps, alpha])

  const fwer = useMemo(
    () => Array.from({ length: 50 }, (_, i) => ({ m: i + 1, fwer: fwerIndependent(i + 1, alpha), expected: (i + 1) * alpha })),
    [alpha],
  )

  const lottery = useMemo(() => lotteryTrial(seed, 1500, 0.2, 0.8), [seed])

  return (
    <LabLayout
      id="multiplicity"
      lead="Every extra test is another ticket in a lottery you can win by chance. Control the familywise error rate for claims you intend to make, and treat everything else as hypothesis-generating."
    >
      <Card>
        <CardHeader
          title="Adjust your own p-values"
          subtitle="Hypotheses are listed in the pre-specified testing order (used by fixed-sequence). Edit names and p-values."
          right={
            <div className="w-48">
              <Slider label="FWER α" value={alpha} min={0.01} max={0.1} step={0.005} onChange={setAlpha} format={(v) => fmt(v, 3)} />
            </div>
          }
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-xs text-ink-2">
                <tr className="border-b border-line">
                  <th className="py-2 pr-2 font-semibold">#</th>
                  <th className="py-2 pr-2 font-semibold">Hypothesis</th>
                  <th className="py-2 pr-2 font-semibold">Raw p</th>
                  <th className="py-2 text-center font-semibold">Bonferroni</th>
                  <th className="py-2 text-center font-semibold">Holm</th>
                  <th className="py-2 text-center font-semibold">Hochberg</th>
                  <th className="py-2 text-center font-semibold">Fixed sequence</th>
                  <th />
                </tr>
              </thead>
              <tbody className="tabular">
                {hyps.map((h, i) => (
                  <tr key={h.id} className="border-b border-line">
                    <td className="py-1.5 pr-2 text-muted">{i + 1}</td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={h.name}
                        aria-label={`Hypothesis ${i + 1} name`}
                        onChange={(e) => setHyps(hyps.map((x) => (x.id === h.id ? { ...x, name: e.target.value } : x)))}
                        className="h-8 w-full min-w-48 rounded-md border border-line bg-surface px-2"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="0.001"
                        min={0}
                        max={1}
                        value={h.p}
                        aria-label={`Hypothesis ${i + 1} p-value`}
                        onChange={(e) => setHyps(hyps.map((x) => (x.id === h.id ? { ...x, p: Number(e.target.value) } : x)))}
                        className="h-8 w-24 rounded-md border border-line bg-surface px-2"
                      />
                    </td>
                    {results ? (
                      [results.bon, results.holm, results.hoch, results.fs].map((r, j) => (
                        <td key={j} className="py-1.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Mark ok={r.reject[i]} />
                            <span className="text-xs text-muted">{fmtP(r.adjusted[i])}</span>
                          </div>
                        </td>
                      ))
                    ) : (
                      <td colSpan={4} />
                    )}
                    <td className="py-1.5 text-right">
                      <Button variant="ghost" size="sm" aria-label="Remove" onClick={() => setHyps(hyps.filter((x) => x.id !== h.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => setHyps([...hyps, { id: hid++, name: `Hypothesis ${hyps.length + 1}`, p: 0.04 }])}>
              <Plus className="h-4 w-4" /> Add hypothesis
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setHyps(PRESET)}>
              Reset example
            </Button>
            <span className="text-xs text-muted">Numbers next to marks are adjusted p-values (compare with α).</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <p>
              <strong>Holm</strong> always rejects at least what Bonferroni rejects, under any dependence. <strong>Hochberg</strong> is more powerful still but
              needs independence or positive dependence. <strong>Fixed sequence</strong> spends full α on each test in order and stops at the first failure — powerful
              when the order reflects importance and likelihood of success, fatal when an early test fails.
            </p>
            {results && (
              <p className="text-ink-2">
                With these p-values: Bonferroni claims <strong className="text-ink">{results.bon.reject.filter(Boolean).length}</strong>, Holm{' '}
                <strong className="text-ink">{results.holm.reject.filter(Boolean).length}</strong>, Hochberg{' '}
                <strong className="text-ink">{results.hoch.reject.filter(Boolean).length}</strong>, fixed sequence{' '}
                <strong className="text-ink">{results.fs.reject.filter(Boolean).length}</strong>
                {results.fs.reject.includes(false) && <> (stops at hypothesis {results.fs.reject.indexOf(false) + 1})</>}. Move a weak hypothesis to the top of the
                list and watch the fixed sequence collapse.
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <ChartFrame
          title="Familywise error rate for independent true-null tests"
          subtitle={`P(at least one false positive) = 1 − (1 − α)^m at α = ${fmt(alpha, 3)}`}
        >
          <ResponsiveContainer>
            <LineChart data={fwer} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="m" type="number" domain={[1, 50]} {...axisProps} label={{ value: 'Number of tests (m)', position: 'insideBottom', offset: -8 }} />
              <YAxis domain={[0, 1]} tickFormatter={(v) => pct(v, 0)} {...axisProps} width={44} />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipBox title={`${payload[0].payload.m} tests`} rows={[{ label: 'FWER', value: pct(payload[0].payload.fwer, 1), color: SERIES.s1 }]} />
                  ) : null
                }
              />
              <Line dataKey="fwer" stroke={SERIES.s1} strokeWidth={2} dot={false} isAnimationActive={false} />
              <ReferenceDot x={m} y={fwerIndependent(m, alpha)} r={5} fill={SERIES.s1} stroke="var(--surface)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartFrame>
        <div className="space-y-3">
          <Slider label="Number of tests" value={m} min={1} max={50} onChange={setM} />
          <Stat label="Chance of ≥ 1 false positive" value={pct(fwerIndependent(m, alpha), 1)} />
          <Stat label="Expected false positives" value={fmt(m * alpha, 2)} />
          <Stat label="Bonferroni per-test level" value={fmt(alpha / m, 4)} />
        </div>
      </div>

      <Card>
        <CardHeader
          title="The subgroup lottery"
          subtitle="One simulated trial (1,500 per arm, control risk 20%). The true treatment effect is identical in every patient: OR = 0.80. Every apparent difference between subgroups below is chance."
          right={
            <Button
              variant="secondary"
              onClick={() => {
                setSeed((s) => s + 1)
                setTrialsRun((t) => t + 1)
              }}
            >
              <Dices className="h-4 w-4" /> Run another trial
            </Button>
          }
        />
        <CardBody>
          <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Overall result" value={lottery.overallSig ? 'Significant' : 'Not significant'} tone={lottery.overallSig ? 'good' : 'warn'} />
            <Stat label="Subgroups with CI excluding 1" value={`${lottery.sig} / 20`} />
            <Stat label="Subgroups whose CI includes 1" value={`${lottery.notSigBenefit} / 20`} sub="“no benefit in…” claims" />
            <Stat label="Interaction p < 0.05" value={`${lottery.interactions} / 10`} sub="all false by construction" tone={lottery.interactions > 0 ? 'warn' : undefined} />
          </div>
          <Legend
            className="mb-2"
            items={[
              { label: 'Subgroup OR (95% CI)', color: SERIES.s1, kind: 'dot' },
              { label: 'Characteristic with interaction p < 0.05', color: SERIES.s2, kind: 'dot' },
              { label: 'Overall', color: 'var(--ink)', kind: 'dot' },
              { label: 'True OR 0.80', color: 'var(--accent)', kind: 'line' },
              { label: 'No effect (OR 1)', color: 'var(--axis)', kind: 'line' },
            ]}
          />
          <ForestPlot
            rows={lottery.rows}
            log
            domain={[0.35, 2.2]}
            ticks={[0.4, 0.6, 0.8, 1, 1.5, 2]}
            tickFormat={(v) => fmt(v, 2)}
            refLines={[
              { x: 1, label: 'null', color: 'var(--axis)' },
              { x: 0.8, label: 'truth', color: 'var(--accent)' },
            ]}
            xLabel="Odds ratio (log scale) — left of 1 favours treatment"
            labelWidth={140}
          />
          <p className="mt-2 text-xs text-muted">Trials run this session: {trialsRun}. Hover a row for exact numbers and the interaction p-value.</p>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Callout
          tone="evidence"
          title="ISIS-2 and the astrologers"
          md="ISIS-2 (Lancet 1988; 17,187 patients) showed aspirin reduced vascular mortality after MI. Asked by reviewers to report subgroups, the authors split by star sign: patients born under Gemini or Libra appeared to get no benefit (a non-significant 9% increase), everyone else a 28% reduction (2p < 0.00001). The point: subgroup results that look striking are routinely produced by chance."
        />
        <Callout
          tone="practice"
          title="Credible subgroup claims (ICEMAN, Schandelmaier et al. CMAJ 2020)"
          md={`- Pre-specified, with a stated **direction** and biological rationale
- Based on a **test of interaction**, not separate p-values per subgroup
- One of **few** subgroup hypotheses tested
- **Consistent** across related outcomes and replicated in other trials
- Large effect modification relative to the precision of the estimate`}
        />
      </div>
      <p className="text-xs text-muted">The preset p-values are illustrative, not from a real trial.</p>
    </LabLayout>
  )
}
