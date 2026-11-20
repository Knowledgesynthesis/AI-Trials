/**
 * Two-arm Bayesian response-adaptive randomization (Thall & Wathen 2007) versus fixed 1:1,
 * simulated with identical settings so their operating characteristics can be compared.
 *
 * Allocation to T:  π = P^c / (P^c + (1 − P)^c),  P = Pr(p_T > p_C | data so far), Beta(1,1) priors.
 * c is fixed or grows as n/(2N). Optional burn-in, clipping, outcome lag, and a linear time
 * trend in response probability (the same in both arms) — the bias mechanism highlighted by
 * Korn & Freidlin (2011), Thall, Fox & Wathen (2015) and Proschan & Evans (2020).
 */

import { normQuantile, probGreater } from './distributions'
import { createRng, quantile, type Rng } from './rng'

export interface RarParams {
  pControl: number
  pTreatment: number
  n: number
  tuning: 'fixed' | 'thall'
  c: number
  burnIn: number
  clip: number // minimum allocation probability for either arm (0 = none)
  lag: number // number of later enrolments before a patient's outcome is known
  drift: number // absolute change in response probability from first to last patient (both arms)
  updateEvery: number
  alphaOneSided: number
  reps: number
  seed: number
}

export const defaultRarParams: RarParams = {
  pControl: 0.3,
  pTreatment: 0.45,
  n: 200,
  tuning: 'thall',
  c: 0.5,
  burnIn: 20,
  clip: 0.1,
  lag: 0,
  drift: 0,
  updateEvery: 1,
  alphaOneSided: 0.025,
  reps: 1000,
  seed: 2026,
}

interface TrialOutcome {
  nT: number
  nC: number
  sT: number
  sC: number
  reject: boolean
  estDiff: number
}

export interface TracePoint {
  patient: number
  allocProb: number
  nT: number
  nC: number
}

function rateAt(base: number, drift: number, i: number, n: number): number {
  const p = base + (n > 1 ? (drift * i) / (n - 1) : 0)
  return Math.min(0.999, Math.max(0.001, p))
}

function zTest(sT: number, nT: number, sC: number, nC: number): number {
  if (nT === 0 || nC === 0) return 0
  const pT = sT / nT
  const pC = sC / nC
  const pbar = (sT + sC) / (nT + nC)
  const se = Math.sqrt(pbar * (1 - pbar) * (1 / nT + 1 / nC))
  return se > 0 ? (pT - pC) / se : 0
}

function runTrial(p: RarParams, adaptive: boolean, rng: Rng, trace?: TracePoint[]): TrialOutcome {
  const N = p.n
  const arm = new Uint8Array(N) // 1 = treatment
  const y = new Uint8Array(N)
  let sT = 0
  let fT = 0
  let sC = 0
  let fC = 0
  let observedUpTo = 0 // patients [0, observedUpTo) have known outcomes
  let pi = 0.5
  let nT = 0
  let nC = 0
  for (let i = 0; i < N; i++) {
    // reveal outcomes that are now known
    const known = Math.max(0, i - p.lag)
    while (observedUpTo < known) {
      const j = observedUpTo++
      if (arm[j] === 1) {
        if (y[j]) sT++
        else fT++
      } else if (y[j]) sC++
      else fC++
    }
    if (!adaptive || i < p.burnIn) {
      pi = 0.5
    } else if ((i - p.burnIn) % p.updateEvery === 0) {
      const P = probGreater(1 + sT, 1 + fT, 1 + sC, 1 + fC)
      const c = p.tuning === 'thall' ? i / (2 * N) : p.c
      const a = Math.pow(P, c)
      const b = Math.pow(1 - P, c)
      pi = a + b > 0 ? a / (a + b) : 0.5
      if (p.clip > 0) pi = Math.min(1 - p.clip, Math.max(p.clip, pi))
    }
    const toT = rng() < pi
    arm[i] = toT ? 1 : 0
    const rate = rateAt(toT ? p.pTreatment : p.pControl, p.drift, i, N)
    y[i] = rng() < rate ? 1 : 0
    if (toT) nT++
    else nC++
    if (trace) trace.push({ patient: i + 1, allocProb: pi, nT, nC })
  }
  let ST = 0
  let SC = 0
  for (let i = 0; i < N; i++) {
    if (arm[i] === 1) ST += y[i]
    else SC += y[i]
  }
  const zc = normQuantile(1 - p.alphaOneSided)
  const z = zTest(ST, nT, SC, nC)
  return {
    nT,
    nC,
    sT: ST,
    sC: SC,
    reject: z > zc,
    estDiff: nT > 0 && nC > 0 ? ST / nT - SC / nC : NaN,
  }
}

export interface DesignSummary {
  meanPropT: number
  p05PropT: number
  p95PropT: number
  probMoreOnInferior: number
  rejectRate: number
  meanResponders: number
  meanEstDiff: number
  histogram: number[] // proportion allocated to T in 20 bins over [0, 1]
}

export interface RarResult {
  rar: DesignSummary
  fixed: DesignSummary
  trace: TracePoint[]
  trueDiff: number
}

function summarize(outs: TrialOutcome[], better: 'T' | 'C' | 'none'): DesignSummary {
  const props = outs.map((o) => o.nT / (o.nT + o.nC)).sort((a, b) => a - b)
  const hist = new Array(20).fill(0)
  for (const v of props) hist[Math.min(19, Math.floor(v * 20))]++
  const valid = outs.filter((o) => Number.isFinite(o.estDiff))
  return {
    meanPropT: props.reduce((a, b) => a + b, 0) / props.length,
    p05PropT: quantile(props, 0.05),
    p95PropT: quantile(props, 0.95),
    probMoreOnInferior:
      better === 'none'
        ? NaN
        : outs.filter((o) => (better === 'T' ? o.nC > o.nT : o.nT > o.nC)).length / outs.length,
    rejectRate: outs.filter((o) => o.reject).length / outs.length,
    meanResponders: outs.reduce((a, o) => a + o.sT + o.sC, 0) / outs.length,
    meanEstDiff: valid.reduce((a, o) => a + o.estDiff, 0) / Math.max(1, valid.length),
    histogram: hist.map((h) => h / outs.length),
  }
}

export function simulateRar(p: RarParams, onProgress?: (f: number) => void): RarResult {
  const rngA = createRng(p.seed)
  const rngF = createRng(p.seed ^ 0x9e3779b9)
  const rar: TrialOutcome[] = []
  const fixed: TrialOutcome[] = []
  const trace: TracePoint[] = []
  for (let r = 0; r < p.reps; r++) {
    rar.push(runTrial(p, true, rngA, r === 0 ? trace : undefined))
    fixed.push(runTrial(p, false, rngF))
    if (onProgress && r % 50 === 0) onProgress(r / p.reps)
  }
  const better = p.pTreatment > p.pControl ? 'T' : p.pTreatment < p.pControl ? 'C' : 'none'
  return { rar: summarize(rar, better), fixed: summarize(fixed, better), trace, trueDiff: p.pTreatment - p.pControl }
}
