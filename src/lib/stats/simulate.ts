/**
 * Monte Carlo companions to the exact engines:
 *  - one patient-level group-sequential trial ("you are the DMC")
 *  - the bias of effect estimates in trials that stop early (Bassler et al., JAMA 2010)
 *  - frequentist operating characteristics of Bayesian posterior-probability monitoring
 *  - empirical power of a fixed two-arm design, to verify the closed-form sample size
 */

import { normQuantile, probGreater } from './distributions'
import { conditionalPower, conditionalPowerCurrentTrend, predictivePower } from './groupSequential'
import { createRng, rnorm, type Rng } from './rng'

// ---------------------------------------------------------------------------
// One group-sequential trial with binary outcomes
// ---------------------------------------------------------------------------

export interface LookResult {
  look: number
  t: number
  nPerArm: number
  respC: number
  respT: number
  z: number
  efficacyBound: number
  futilityBound: number
  cpTrend: number
  cpDesign: number
  predictive: number
  decision: 'efficacy' | 'futility' | 'continue' | 'final-success' | 'final-fail'
}

export function simulateGsTrial(opts: {
  pControl: number
  pTreatment: number
  nMaxPerArm: number
  timing: number[]
  upper: number[]
  lower: number[]
  designDrift: number
  seed: number
}): LookResult[] {
  const { pControl, pTreatment, nMaxPerArm, timing, upper, lower, designDrift, seed } = opts
  const rng = createRng(seed)
  const yC: number[] = []
  const yT: number[] = []
  for (let i = 0; i < nMaxPerArm; i++) {
    yC.push(rng() < pControl ? 1 : 0)
    yT.push(rng() < pTreatment ? 1 : 0)
  }
  const out: LookResult[] = []
  const K = timing.length
  const c = upper[K - 1]
  for (let k = 0; k < K; k++) {
    const n = Math.max(2, Math.round(timing[k] * nMaxPerArm))
    let sC = 0
    let sT = 0
    for (let i = 0; i < n; i++) {
      sC += yC[i]
      sT += yT[i]
    }
    const pbar = (sC + sT) / (2 * n)
    const se = Math.sqrt(pbar * (1 - pbar) * (2 / n))
    const z = se > 0 ? (sT / n - sC / n) / se : 0
    const t = timing[k]
    const last = k === K - 1
    let decision: LookResult['decision'] = 'continue'
    if (last) decision = z >= upper[k] ? 'final-success' : 'final-fail'
    else if (z >= upper[k]) decision = 'efficacy'
    else if (z < lower[k]) decision = 'futility'
    out.push({
      look: k + 1,
      t,
      nPerArm: n,
      respC: sC,
      respT: sT,
      z,
      efficacyBound: upper[k],
      futilityBound: last ? NaN : lower[k],
      cpTrend: conditionalPowerCurrentTrend(z, t, c),
      cpDesign: conditionalPower(z, t, c, designDrift),
      predictive: predictivePower(z, t, c),
      decision,
    })
    if (decision !== 'continue') break
  }
  return out
}

// ---------------------------------------------------------------------------
// Early-stopping bias (Brownian-motion approximation)
// ---------------------------------------------------------------------------

export interface StoppingBiasResult {
  byLook: Array<{ look: number; probStop: number; meanRatio: number; medianRatio: number }>
  overallMeanRatio: number
  earlyStopMeanRatio: number
  samples: number[] // θ̂/θ for histogram (capped)
  stopLook: number[]
}

/**
 * Simulate the B-value process with drift θ; stop at the first efficacy crossing.
 * Report θ̂/θ (estimated ÷ true effect), where θ̂ = S_k / t_k is the naive MLE at stopping.
 */
export function simulateStoppingBias(timing: number[], upper: number[], theta: number, reps: number, seed: number): StoppingBiasResult {
  const rng: Rng = createRng(seed)
  const K = timing.length
  const ratiosByLook: number[][] = Array.from({ length: K }, () => [])
  const samples: number[] = []
  const stopLook: number[] = []
  for (let r = 0; r < reps; r++) {
    let S = 0
    let tPrev = 0
    for (let k = 0; k < K; k++) {
      const d = timing[k] - tPrev
      S += rnorm(rng, theta * d, Math.sqrt(d))
      tPrev = timing[k]
      const z = S / Math.sqrt(timing[k])
      if (z >= upper[k] || k === K - 1) {
        const ratio = S / timing[k] / theta
        ratiosByLook[k].push(ratio)
        samples.push(ratio)
        stopLook.push(z >= upper[k] ? k + 1 : K)
        break
      }
    }
  }
  const med = (xs: number[]) => {
    if (!xs.length) return NaN
    const s = [...xs].sort((a, b) => a - b)
    return s[Math.floor(s.length / 2)]
  }
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN)
  const early = ratiosByLook.slice(0, K - 1).flat()
  return {
    byLook: ratiosByLook.map((xs, k) => ({ look: k + 1, probStop: xs.length / reps, meanRatio: avg(xs), medianRatio: med(xs) })),
    overallMeanRatio: avg(samples),
    earlyStopMeanRatio: avg(early),
    samples,
    stopLook,
  }
}

// ---------------------------------------------------------------------------
// Bayesian posterior-probability monitoring: frequentist operating characteristics
// ---------------------------------------------------------------------------

export function bayesMonitoringOC(opts: {
  pControl: number
  pTreatment: number
  nPerArm: number
  looks: number
  threshold: number
  reps: number
  seed: number
}): { rejectRate: number; meanNPerArm: number; byLook: number[] } {
  const { pControl, pTreatment, nPerArm, looks, threshold, reps, seed } = opts
  const rng = createRng(seed)
  const byLook = new Array(looks).fill(0)
  let rejects = 0
  let nSum = 0
  for (let r = 0; r < reps; r++) {
    let sC = 0
    let sT = 0
    let n = 0
    let stopped = false
    for (let k = 1; k <= looks; k++) {
      const target = Math.round((k / looks) * nPerArm)
      while (n < target) {
        if (rng() < pControl) sC++
        if (rng() < pTreatment) sT++
        n++
      }
      if (probGreater(1 + sT, 1 + n - sT, 1 + sC, 1 + n - sC) > threshold) {
        rejects++
        byLook[k - 1]++
        stopped = true
        break
      }
    }
    nSum += stopped ? n : nPerArm
  }
  return { rejectRate: rejects / reps, meanNPerArm: nSum / reps, byLook: byLook.map((b) => b / reps) }
}

// ---------------------------------------------------------------------------
// Empirical power of a fixed design (verifies closed-form sample sizes)
// ---------------------------------------------------------------------------

export function empiricalPowerBinary(p1: number, p2: number, n1: number, n2: number, alphaOneSided: number, reps: number, seed: number): number {
  const rng = createRng(seed)
  const zc = normQuantile(1 - alphaOneSided)
  let rej = 0
  const sign = p2 >= p1 ? 1 : -1
  for (let r = 0; r < reps; r++) {
    let s1 = 0
    let s2 = 0
    for (let i = 0; i < n1; i++) if (rng() < p1) s1++
    for (let i = 0; i < n2; i++) if (rng() < p2) s2++
    const pbar = (s1 + s2) / (n1 + n2)
    const se = Math.sqrt(pbar * (1 - pbar) * (1 / n1 + 1 / n2))
    if (se > 0 && (sign * (s2 / n2 - s1 / n1)) / se > zc) rej++
  }
  return rej / reps
}

/** Non-inferiority Wald test on the risk difference (higher = better), unpooled SE. */
export function empiricalPowerBinaryNI(pC: number, pE: number, nC: number, nE: number, margin: number, alphaOneSided: number, reps: number, seed: number): number {
  const rng = createRng(seed)
  const zc = normQuantile(1 - alphaOneSided)
  let rej = 0
  for (let r = 0; r < reps; r++) {
    let sC = 0
    let sE = 0
    for (let i = 0; i < nC; i++) if (rng() < pC) sC++
    for (let i = 0; i < nE; i++) if (rng() < pE) sE++
    const a = sC / nC
    const b = sE / nE
    const se = Math.sqrt((a * (1 - a)) / nC + (b * (1 - b)) / nE)
    if (se > 0 && (b - a + margin) / se > zc) rej++
  }
  return rej / reps
}

export function empiricalPowerMeans(delta: number, sd: number, n1: number, n2: number, alphaOneSided: number, reps: number, seed: number, margin = 0): number {
  const rng = createRng(seed)
  const zc = normQuantile(1 - alphaOneSided)
  let rej = 0
  for (let r = 0; r < reps; r++) {
    let m1 = 0
    let m2 = 0
    let ss1 = 0
    let ss2 = 0
    const x1: number[] = []
    const x2: number[] = []
    for (let i = 0; i < n1; i++) x1.push(rnorm(rng, 0, sd))
    for (let i = 0; i < n2; i++) x2.push(rnorm(rng, delta, sd))
    for (const v of x1) m1 += v
    for (const v of x2) m2 += v
    m1 /= n1
    m2 /= n2
    for (const v of x1) ss1 += (v - m1) ** 2
    for (const v of x2) ss2 += (v - m2) ** 2
    const sp = Math.sqrt((ss1 + ss2) / (n1 + n2 - 2))
    const se = sp * Math.sqrt(1 / n1 + 1 / n2)
    if ((m2 - m1 + margin) / se > zc) rej++
  }
  return rej / reps
}
