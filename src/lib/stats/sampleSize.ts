/**
 * Sample-size formulas (normal approximation). References:
 *  - Continuous: Chow, Shao & Wang, Sample Size Calculations in Clinical Research (3rd ed.), §3.2
 *  - Binary superiority: Fleiss, Tytun & Ury (1980) with optional continuity correction
 *  - Binary non-inferiority: Blackwelder (1982), unpooled variance
 *  - Time-to-event: Schoenfeld (1983) number of events
 * k = allocation ratio n_E / n_C. α is one-sided (two-sided tests pass α/2).
 */

import { normCdf, normQuantile } from './distributions'

export interface SampleSizeResult {
  nControl: number // unrounded
  nExperimental: number
  total: number // rounded up per arm, then summed
  perArmRounded: [number, number]
}

function finalize(nC: number, k: number): SampleSizeResult {
  const nE = nC * k
  const rc = Math.ceil(nC - 1e-9)
  const re = Math.ceil(nE - 1e-9)
  return { nControl: nC, nExperimental: nE, total: rc + re, perArmRounded: [rc, re] }
}

const z = (p: number) => normQuantile(p)

/** Difference in means, superiority (δ > 0) or non-inferiority (margin > 0, expected difference δ). */
export function nMeans(opts: {
  delta: number
  sd: number
  alphaOneSided: number
  power: number
  k?: number
  margin?: number // non-inferiority margin (same units); 0 = superiority
}): SampleSizeResult {
  const { delta, sd, alphaOneSided, power, k = 1, margin = 0 } = opts
  const effect = delta + margin
  const nC = ((1 + 1 / k) * sd * sd * (z(1 - alphaOneSided) + z(power)) ** 2) / (effect * effect)
  return finalize(nC, k)
}

/** Two proportions, superiority (pooled variance under H0; Fleiss continuity correction optional). */
export function nProportions(opts: {
  pControl: number
  pExperimental: number
  alphaOneSided: number
  power: number
  k?: number
  continuityCorrection?: boolean
}): SampleSizeResult {
  const { pControl: p1, pExperimental: p2, alphaOneSided, power, k = 1, continuityCorrection = false } = opts
  const d = Math.abs(p2 - p1)
  const pbar = (p1 + k * p2) / (1 + k)
  const za = z(1 - alphaOneSided)
  const zb = z(power)
  const num = za * Math.sqrt(pbar * (1 - pbar) * (1 + 1 / k)) + zb * Math.sqrt(p1 * (1 - p1) + (p2 * (1 - p2)) / k)
  let nC = (num * num) / (d * d)
  if (continuityCorrection) {
    nC = (nC / 4) * (1 + Math.sqrt(1 + (2 * (k + 1)) / (k * nC * d))) ** 2
  }
  return finalize(nC, k)
}

/** Two proportions, non-inferiority: H0 pE − pC ≤ −M (higher = better). Unpooled variance. */
export function nProportionsNI(opts: {
  pControl: number
  pExperimental: number
  margin: number
  alphaOneSided: number
  power: number
  k?: number
}): SampleSizeResult {
  const { pControl: pC, pExperimental: pE, margin, alphaOneSided, power, k = 1 } = opts
  const effect = pE - pC + margin
  const nC = ((z(1 - alphaOneSided) + z(power)) ** 2 * (pC * (1 - pC) + (pE * (1 - pE)) / k)) / (effect * effect)
  return finalize(nC, k)
}

/** Schoenfeld: required number of events for a log-rank test of hazard ratio HR. */
export function eventsSchoenfeld(opts: { hr: number; alphaOneSided: number; power: number; k?: number }): number {
  const { hr, alphaOneSided, power, k = 1 } = opts
  const r = k / (1 + k)
  return (z(1 - alphaOneSided) + z(power)) ** 2 / (r * (1 - r) * Math.log(hr) ** 2)
}

/**
 * Probability that a randomized patient has an event during follow-up, under proportional
 * hazards: F_E = 1 − (1 − F_C)^HR. Ignores staggered entry and drop-out.
 */
export function eventProbability(controlCumIncidence: number, hr: number, k = 1): number {
  const fE = 1 - (1 - controlCumIncidence) ** hr
  const r = k / (1 + k)
  return (1 - r) * controlCumIncidence + r * fE
}

/** Power of the two-proportion z-test (pooled) for given per-arm sizes. */
export function powerProportions(p1: number, p2: number, n1: number, n2: number, alphaOneSided: number): number {
  const pbar = (n1 * p1 + n2 * p2) / (n1 + n2)
  const se0 = Math.sqrt(pbar * (1 - pbar) * (1 / n1 + 1 / n2))
  const se1 = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2)
  const d = Math.abs(p2 - p1)
  return normCdf((d - z(1 - alphaOneSided) * se0) / se1)
}

/** Power of the non-inferiority Wald test for proportions (higher = better): H0 pE − pC ≤ −M. */
export function powerProportionsNI(pC: number, pE: number, nC: number, nE: number, margin: number, alphaOneSided: number): number {
  const se = Math.sqrt((pC * (1 - pC)) / nC + (pE * (1 - pE)) / nE)
  return normCdf((pE - pC + margin) / se - z(1 - alphaOneSided))
}

export function powerMeans(delta: number, sd: number, n1: number, n2: number, alphaOneSided: number, margin = 0): number {
  const se = sd * Math.sqrt(1 / n1 + 1 / n2)
  return normCdf((delta + margin) / se - z(1 - alphaOneSided))
}

export function powerEvents(hr: number, events: number, alphaOneSided: number, k = 1): number {
  const r = k / (1 + k)
  return normCdf(Math.sqrt(events * r * (1 - r)) * Math.abs(Math.log(hr)) - z(1 - alphaOneSided))
}

/** Inflate for anticipated loss to follow-up (assumes losses are uninformative). */
export function inflateForDropout(n: number, dropout: number): number {
  return n / (1 - dropout)
}

/** Design effect for cluster randomization: 1 + (m − 1)·ICC. */
export function designEffect(clusterSize: number, icc: number): number {
  return 1 + (clusterSize - 1) * icc
}

/** Variance reduction from adjusting for a prognostic covariate with outcome correlation ρ. */
export function covariateAdjustmentFactor(rho: number): number {
  return 1 - rho * rho
}
