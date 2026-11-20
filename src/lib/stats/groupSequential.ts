/**
 * Group-sequential design engine.
 *
 * Exact computation of crossing probabilities for the canonical joint distribution of
 * sequential Z-statistics (Jennison & Turnbull 2000, ch. 3 and ch. 19): with information
 * fractions t_1 < … < t_K = 1 and drift θ (= E[Z] at full information),
 *   Z_k ~ N(θ√t_k, 1),  Cov(Z_j, Z_k) = √(t_j / t_k).
 * Densities are propagated stage-to-stage by numerical integration (composite Simpson),
 * the method of Armitage, McPherson & Rowe (1969). Results reproduce published tables
 * (Pocock 1977; O'Brien & Fleming 1979; Lan & DeMets 1983) to 3 decimals — see tests.
 */

import { normCdf, normPdf, normQuantile, normSf } from './distributions'

export type SpendingFamily = 'ldof' | 'ldpocock' | 'hsd' | 'power'
export type ClassicalFamily = 'pocock' | 'obf' | 'haybittle'
export type BoundaryFamily = SpendingFamily | ClassicalFamily

export interface BoundarySpec {
  family: BoundaryFamily
  /** HSD γ or power-family ρ */
  param?: number
  /** Haybittle–Peto interim critical value (default 3) */
  hpZ?: number
}

export const BOUNDARY_LABELS: Record<BoundaryFamily, string> = {
  ldof: "Lan–DeMets O'Brien–Fleming-type spending",
  ldpocock: 'Lan–DeMets Pocock-type spending',
  hsd: 'Hwang–Shih–DeCani spending (γ)',
  power: 'Power-family spending αt^ρ',
  obf: "Classical O'Brien–Fleming (c/√t)",
  pocock: 'Classical Pocock (constant)',
  haybittle: 'Haybittle–Peto (fixed interim Z)',
}

/** Cumulative α spent by information fraction t under a spending function. */
export function spendingFunction(spec: BoundarySpec, alpha: number, t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return alpha
  switch (spec.family) {
    case 'ldof':
      // Lan & DeMets (1983): α(t) = 2 − 2Φ(z_{1−α/2} / √t)
      return 2 * normSf(normQuantile(1 - alpha / 2) / Math.sqrt(t))
    case 'ldpocock':
      return alpha * Math.log(1 + (Math.E - 1) * t)
    case 'hsd': {
      const g = spec.param ?? -4
      if (Math.abs(g) < 1e-9) return alpha * t
      return (alpha * (1 - Math.exp(-g * t))) / (1 - Math.exp(-g))
    }
    case 'power':
      return alpha * Math.pow(t, spec.param ?? 3)
    default:
      throw new Error('Not a spending family')
  }
}

// ---------------------------------------------------------------------------
// Numerical integration machinery
// ---------------------------------------------------------------------------

interface Grid {
  z: Float64Array
  w: Float64Array // Simpson weights × density, i.e. the integrand mass at each node
}

const GRID_POINTS = 241 // odd, for Simpson
const TAIL = 8.5 // integrate ±8.5 SD around the mean (mass outside < 1e-16)

function simpsonGrid(lo: number, hi: number, n = GRID_POINTS): { z: Float64Array; sw: Float64Array } {
  const z = new Float64Array(n)
  const sw = new Float64Array(n)
  if (hi <= lo) return { z: new Float64Array(0), sw: new Float64Array(0) }
  const h = (hi - lo) / (n - 1)
  for (let i = 0; i < n; i++) {
    z[i] = lo + i * h
    sw[i] = ((i === 0 || i === n - 1 ? 1 : i % 2 === 1 ? 4 : 2) * h) / 3
  }
  return { z, sw }
}

export interface StageBounds {
  /** upper (efficacy) critical value; Infinity = no efficacy stop */
  upper: number
  /** lower critical value; -Infinity = none */
  lower: number
}

export interface CrossingResult {
  upper: number[] // P(stop by crossing upper at stage k, not before)
  lower: number[] // P(stop by crossing lower at stage k, not before)
  continueProb: number[] // P(still continuing after stage k)
}

/** Sub-density of Z_1 on its continuation region. */
function firstGrid(t1: number, b: StageBounds, theta: number): Grid {
  const meanK = theta * Math.sqrt(t1)
  const lo = Math.max(b.lower, meanK - TAIL)
  const hi = Math.min(b.upper, meanK + TAIL)
  const { z, sw } = simpsonGrid(lo, hi)
  const w = new Float64Array(z.length)
  for (let i = 0; i < z.length; i++) w[i] = sw[i] * normPdf(z[i] - meanK)
  return { z, w }
}

/** P(cross upper / lower at stage k) given the sub-density on the stage k−1 continuation region. */
function crossAt(prev: Grid, tPrev: number, tk: number, b: StageBounds, theta: number): [number, number] {
  const sqrtPrev = Math.sqrt(tPrev)
  const sqrtTk = Math.sqrt(tk)
  const delta = tk - tPrev
  const sqrtDelta = Math.sqrt(delta)
  let pU = 0
  let pL = 0
  for (let j = 0; j < prev.z.length; j++) {
    const m = prev.z[j] * sqrtPrev + theta * delta // mean of the score S_k given z_j
    if (b.upper !== Infinity) pU += prev.w[j] * normSf((b.upper * sqrtTk - m) / sqrtDelta)
    if (b.lower !== -Infinity) pL += prev.w[j] * normCdf((b.lower * sqrtTk - m) / sqrtDelta)
  }
  return [pU, pL]
}

/** Propagate the sub-density from stage k−1 to the stage-k continuation region. */
function propagate(prev: Grid, tPrev: number, tk: number, b: StageBounds, theta: number): Grid {
  const sqrtPrev = Math.sqrt(tPrev)
  const sqrtTk = Math.sqrt(tk)
  const delta = tk - tPrev
  const sqrtDelta = Math.sqrt(delta)
  const meanK = theta * sqrtTk
  const lo = Math.max(b.lower, meanK - TAIL)
  const hi = Math.min(b.upper, meanK + TAIL)
  const { z, sw } = simpsonGrid(lo, hi)
  const w = new Float64Array(z.length)
  const jac = sqrtTk / sqrtDelta
  for (let i = 0; i < z.length; i++) {
    let dens = 0
    const sk = z[i] * sqrtTk
    for (let j = 0; j < prev.z.length; j++) {
      const m = prev.z[j] * sqrtPrev + theta * delta
      dens += prev.w[j] * normPdf((sk - m) / sqrtDelta)
    }
    w[i] = sw[i] * dens * jac
  }
  return { z, w }
}

function firstCross(t1: number, b: StageBounds, theta: number): [number, number] {
  const meanK = theta * Math.sqrt(t1)
  return [
    b.upper === Infinity ? 0 : normSf(b.upper - meanK),
    b.lower === -Infinity ? 0 : normCdf(b.lower - meanK),
  ]
}

/**
 * Probabilities of first crossing each boundary at each stage under drift θ.
 * The final stage's continuation region is treated as "no rejection".
 */
export function crossingProbabilities(t: number[], bounds: StageBounds[], theta: number): CrossingResult {
  const K = t.length
  const upper: number[] = []
  const lower: number[] = []
  const continueProb: number[] = []
  let grid: Grid | null = null
  for (let k = 0; k < K; k++) {
    const [pU, pL]: [number, number] =
      k === 0 ? firstCross(t[0], bounds[0], theta) : crossAt(grid!, t[k - 1], t[k], bounds[k], theta)
    upper.push(pU)
    lower.push(pL)
    if (k < K - 1) {
      grid = k === 0 ? firstGrid(t[0], bounds[0], theta) : propagate(grid!, t[k - 1], t[k], bounds[k], theta)
    }
    const prevCont = k === 0 ? 1 : continueProb[k - 1]
    continueProb.push(Math.max(0, prevCont - pU - pL))
  }
  return { upper, lower, continueProb }
}

function bisect(f: (x: number) => number, lo: number, hi: number, tol = 1e-10, maxIt = 200): number {
  let flo = f(lo)
  for (let i = 0; i < maxIt; i++) {
    const mid = (lo + hi) / 2
    const fm = f(mid)
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid
      flo = fm
    } else {
      hi = mid
    }
    if (hi - lo < tol) break
  }
  return (lo + hi) / 2
}

export interface DesignInput {
  timing: number[] // information fractions, last must be 1
  alpha: number // one-sided α (sides = 1) or total two-sided α (sides = 2)
  sides: 1 | 2
  spec: BoundarySpec
}

export interface DesignBoundaries {
  timing: number[]
  upper: number[] // efficacy Z critical values
  nominalP: number[] // one-sided nominal p-value at each boundary: 1 − Φ(b_k)
  cumulativeAlpha: number[] // cumulative Type I error spent (total over both sides if sides = 2)
}

function boundsFor(upper: number[], sides: 1 | 2): StageBounds[] {
  return upper.map((u) => ({ upper: u, lower: sides === 2 ? -u : -Infinity }))
}

/** Compute efficacy boundaries (non-binding: futility is ignored when spending α). */
export function computeBoundaries(input: DesignInput): DesignBoundaries {
  const { timing, alpha, sides, spec } = input
  const K = timing.length
  if (K < 1 || Math.abs(timing[K - 1] - 1) > 1e-9) throw new Error('Final information fraction must be 1')
  for (let k = 1; k < K; k++) if (!(timing[k] > timing[k - 1])) throw new Error('Timing must increase')
  const upper: number[] = []

  const totalCross = (u: number[]) => {
    const r = crossingProbabilities(timing, boundsFor(u, sides), 0)
    return r.upper.reduce((a, b) => a + b, 0) + r.lower.reduce((a, b) => a + b, 0)
  }

  if (spec.family === 'pocock' || spec.family === 'obf') {
    const shape = (c: number) =>
      timing.map((tk) => (spec.family === 'pocock' ? c : c / Math.sqrt(tk)))
    const c = bisect((cc) => totalCross(shape(cc)) - alpha, 0.5, 8)
    upper.push(...shape(c))
  } else if (spec.family === 'haybittle') {
    const hp = spec.hpZ ?? 3
    const interim = Array(K - 1).fill(hp)
    const last = K === 1 ? normQuantile(1 - alpha / sides) : bisect((c) => totalCross([...interim, c]) - alpha, 0.5, 8)
    upper.push(...interim, last)
  } else {
    // Two-sided symmetric designs spend α/2 per side (DeMets & Lan 1994 convention, which
    // reproduces the published Lan–DeMets O'Brien–Fleming boundaries 4.333/2.963/2.359/2.014).
    const perSide = alpha / sides
    let spentPrev = 0
    let grid: Grid | null = null
    for (let k = 0; k < K; k++) {
      const target = spendingFunction(spec, perSide, timing[k]) - spentPrev
      const mk = (b: number): StageBounds => ({ upper: b, lower: sides === 2 ? -b : -Infinity })
      let bk: number
      if (target <= 1e-15) {
        bk = Infinity
      } else {
        const f = (b: number) => {
          const [pU] = k === 0 ? firstCross(timing[0], mk(b), 0) : crossAt(grid!, timing[k - 1], timing[k], mk(b), 0)
          return pU - target
        }
        bk = bisect(f, -2, 40, 1e-10)
      }
      upper.push(bk)
      spentPrev += target
      if (k < K - 1) {
        grid = k === 0 ? firstGrid(timing[0], mk(bk), 0) : propagate(grid!, timing[k - 1], timing[k], mk(bk), 0)
      }
    }
  }

  const r = crossingProbabilities(timing, boundsFor(upper, sides), 0)
  const cumulativeAlpha: number[] = []
  let cum = 0
  for (let k = 0; k < K; k++) {
    cum += r.upper[k] + r.lower[k]
    cumulativeAlpha.push(cum)
  }
  return { timing, upper, nominalP: upper.map((u) => normSf(u)), cumulativeAlpha }
}

export type FutilityRule =
  | { type: 'none' }
  | { type: 'z'; z: number } // stop if Z_k < z at interim looks
  | { type: 'cp'; threshold: number } // stop if conditional power under design alternative < threshold

/** Translate a futility rule into Z-scale lower bounds at interim looks (final look: none). */
export function futilityBounds(
  timing: number[],
  upper: number[],
  rule: FutilityRule,
  designDrift: number,
): number[] {
  const K = timing.length
  return timing.map((tk, k) => {
    if (k === K - 1 || rule.type === 'none') return -Infinity
    if (rule.type === 'z') return Math.min(rule.z, upper[k] - 1e-6)
    // CP(z) = Φ((z√t + θ(1−t) − b_K)/√(1−t)) = threshold  ⇒  solve for z
    const bK = upper[K - 1]
    const z = (bK + normQuantile(rule.threshold) * Math.sqrt(1 - tk) - designDrift * (1 - tk)) / Math.sqrt(tk)
    return Math.min(z, upper[k] - 1e-6)
  })
}

export interface OperatingCharacteristics {
  theta: number
  pEfficacy: number[]
  pFutility: number[]
  power: number // P(cross efficacy at any look)
  expectedInfo: number // E[information fraction at stopping]
}

/** Operating characteristics with futility treated as binding (i.e. always followed). */
export function operatingCharacteristics(
  timing: number[],
  upper: number[],
  lower: number[],
  theta: number,
): OperatingCharacteristics {
  const K = timing.length
  const bounds: StageBounds[] = upper.map((u, k) => ({
    upper: u,
    lower: k === K - 1 ? -Infinity : lower[k],
  }))
  const r = crossingProbabilities(timing, bounds, theta)
  let expectedInfo = 0
  for (let k = 0; k < K - 1; k++) expectedInfo += timing[k] * (r.upper[k] + r.lower[k])
  expectedInfo += timing[K - 1] * (K >= 2 ? r.continueProb[K - 2] : 1)
  return {
    theta,
    pEfficacy: r.upper,
    pFutility: r.lower,
    power: r.upper.reduce((a, b) => a + b, 0),
    expectedInfo,
  }
}

/** Drift θ needed for the design to reach the target power (efficacy-only, non-binding futility ignored). */
export function driftForPower(timing: number[], upper: number[], power: number, lower?: number[]): number {
  const low = lower ?? timing.map(() => -Infinity)
  return bisect(
    (th) => operatingCharacteristics(timing, upper, low, th).power - power,
    0,
    12,
    1e-8,
  )
}

/** Fixed-sample drift for one-sided level α and given power: z_{1−α} + z_{1−β}. */
export function fixedDrift(alphaOneSided: number, power: number): number {
  return normQuantile(1 - alphaOneSided) + normQuantile(power)
}

/** Overall Type I error from naively testing at a fixed nominal critical value at every look. */
export function naiveRepeatedTestingAlpha(timing: number[], z: number, sides: 1 | 2): number {
  const r = crossingProbabilities(
    timing,
    timing.map(() => ({ upper: z, lower: sides === 2 ? -z : -Infinity })),
    0,
  )
  return r.upper.reduce((a, b) => a + b, 0) + r.lower.reduce((a, b) => a + b, 0)
}

export function equalTiming(K: number): number[] {
  return Array.from({ length: K }, (_, i) => (i + 1) / K)
}

// ---------------------------------------------------------------------------
// Conditional and predictive power (Brownian-motion / B-value formulation)
// ---------------------------------------------------------------------------

/**
 * Conditional power at information fraction t given interim Z, final critical value c,
 * and an assumed drift θ for the remainder of the trial (Lan & Wittes 1988):
 *   CP = Φ( (Z√t + θ(1 − t) − c) / √(1 − t) )
 */
export function conditionalPower(z: number, t: number, c: number, theta: number): number {
  if (t >= 1) return z >= c ? 1 : 0
  return normCdf((z * Math.sqrt(t) + theta * (1 - t) - c) / Math.sqrt(1 - t))
}

/** CP assuming the current trend continues (θ̂ = Z/√t). */
export function conditionalPowerCurrentTrend(z: number, t: number, c: number): number {
  if (t >= 1) return z >= c ? 1 : 0
  return normCdf((z / Math.sqrt(t) - c) / Math.sqrt(1 - t))
}

/**
 * Predictive power: CP averaged over the posterior of θ under a flat prior
 * (Spiegelhalter, Freedman & Blackburn 1986):  PP = Φ( (Z − c√t) / √(1 − t) ).
 */
export function predictivePower(z: number, t: number, c: number): number {
  if (t >= 1) return z >= c ? 1 : 0
  return normCdf((z - c * Math.sqrt(t)) / Math.sqrt(1 - t))
}
