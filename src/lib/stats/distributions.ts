/**
 * Core probability functions, implemented to double precision so that every number
 * shown in the app can be checked against R / SAS / published tables.
 *
 *  - normCdf:      Hart (1968) algorithm 5666 (West 2005) + Laplace continued fraction in the tails
 *  - normQuantile: Acklam's rational approximation + one Halley step, |error| < 1e-13
 *  - logGamma:     Lanczos (g = 7, n = 9), relative error < 1e-14
 *  - betaInc:      regularized incomplete beta via Lentz continued fraction (Numerical Recipes)
 */

const SQRT2PI = Math.sqrt(2 * Math.PI)
const LOG_SQRT_2PI = 0.5 * Math.log(2 * Math.PI)

export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT2PI
}

/**
 * Standard normal CDF Φ(x). Accurate in both tails (no 1 − Φ cancellation):
 * Hart's rational approximation for |x| < 4.5, Laplace's continued fraction beyond
 * (40 terms → full double precision, verified against mpmath).
 */
export function normCdf(x: number): number {
  if (Number.isNaN(x)) return NaN
  const ax = Math.abs(x)
  let c: number
  if (ax > 38.5) {
    c = 0
  } else if (ax >= 4.5) {
    let f = ax
    for (let k = 40; k >= 1; k--) f = ax + k / f
    c = Math.exp((-ax * ax) / 2) / SQRT2PI / f
  } else {
    const e = Math.exp((-ax * ax) / 2)
    let b = 3.52624965998911e-2 * ax + 0.700383064443688
    b = b * ax + 6.37396220353165
    b = b * ax + 33.912866078383
    b = b * ax + 112.079291497871
    b = b * ax + 221.213596169931
    b = b * ax + 220.206867912376
    c = e * b
    b = 8.83883476483184e-2 * ax + 1.75566716318264
    b = b * ax + 16.064177579207
    b = b * ax + 86.7807322029461
    b = b * ax + 296.564248779674
    b = b * ax + 637.333633378831
    b = b * ax + 793.826512519948
    b = b * ax + 440.413735824752
    c = c / b
  }
  return x > 0 ? 1 - c : c
}

/** Upper tail 1 − Φ(x), computed without cancellation. */
export function normSf(x: number): number {
  return normCdf(-x)
}

const A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
  -3.066479806614716e1, 2.506628277459239,
]
const B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
  -1.328068155288572e1,
]
const C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
  4.374664141464968, 2.938163982698783,
]
const D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]

/** Standard normal quantile Φ⁻¹(p). */
export function normQuantile(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  const pLow = 0.02425
  let x: number
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p))
    x =
      (((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1)
  } else if (p <= 1 - pLow) {
    const q = p - 0.5
    const r = q * q
    x =
      ((((((A[0] * r + A[1]) * r + A[2]) * r + A[3]) * r + A[4]) * r + A[5]) * q) /
      (((((B[0] * r + B[1]) * r + B[2]) * r + B[3]) * r + B[4]) * r + 1)
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p))
    x =
      -(((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1)
  }
  // One Halley refinement step brings the result to full double precision.
  const e = (p < 0.5 ? normCdf(x) - p : -(normSf(x) - (1 - p)))
  const u = e * SQRT2PI * Math.exp((x * x) / 2)
  x = x - u / (1 + (x * u) / 2)
  return x
}

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
]

/** log Γ(x) for x > 0. */
export function logGamma(x: number): number {
  if (x < 0.5) {
    return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - logGamma(1 - x)
  }
  const xm1 = x - 1
  let a = LANCZOS[0]
  const t = xm1 + 7.5
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (xm1 + i)
  return LOG_SQRT_2PI + (xm1 + 0.5) * Math.log(t) - t + Math.log(a)
}

export function logBeta(a: number, b: number): number {
  return logGamma(a) + logGamma(b) - logGamma(a + b)
}

/** Beta(a, b) density. */
export function betaPdf(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) return 0
  if (x === 0) return a < 1 ? Infinity : a === 1 ? b : 0
  if (x === 1) return b < 1 ? Infinity : b === 1 ? a : 0
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log1p(-x) - logBeta(a, b))
}

function betaContinuedFraction(a: number, b: number, x: number): number {
  const MAXIT = 10000
  const EPS = 1e-16
  const FPMIN = 1e-300
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1 / d
  let h = d
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < EPS) break
  }
  return h
}

/** Regularized incomplete beta I_x(a, b) = P(X ≤ x) for X ~ Beta(a, b). */
export function betaCdf(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const lbt = a * Math.log(x) + b * Math.log1p(-x) - logBeta(a, b)
  if (x < (a + 1) / (a + b + 2)) {
    return (Math.exp(lbt) * betaContinuedFraction(a, b, x)) / a
  }
  return 1 - (Math.exp(lbt) * betaContinuedFraction(b, a, 1 - x)) / b
}

/** Quantile of Beta(a, b) by safeguarded bisection on the exact CDF. */
export function betaQuantile(p: number, a: number, b: number): number {
  if (p <= 0) return 0
  if (p >= 1) return 1
  let lo = 0
  let hi = 1
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (betaCdf(mid, a, b) < p) lo = mid
    else hi = mid
    if (hi - lo < 1e-14) break
  }
  return (lo + hi) / 2
}

export function betaMean(a: number, b: number): number {
  return a / (a + b)
}

export function betaSd(a: number, b: number): number {
  const s = a + b
  return Math.sqrt((a * b) / (s * s * (s + 1)))
}

/** Equal-tailed credible interval. */
export function betaInterval(a: number, b: number, level = 0.95): [number, number] {
  const tail = (1 - level) / 2
  return [betaQuantile(tail, a, b), betaQuantile(1 - tail, a, b)]
}

/** Binomial probability mass function. */
export function binomPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0
  if (p === 0) return k === 0 ? 1 : 0
  if (p === 1) return k === n ? 1 : 0
  const logC = logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1)
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log1p(-p))
}

// ---------------------------------------------------------------------------
// P(X_T > X_C) for independent Beta posteriors
// ---------------------------------------------------------------------------

const LOG_FACT_MAX = 20000
let logFactTable: Float64Array | null = null
function lgammaFast(x: number): number {
  // Exact table lookup for integers (the common case: Beta priors with integer parameters
  // updated by counts); Lanczos otherwise.
  if (Number.isInteger(x) && x >= 1 && x <= LOG_FACT_MAX) {
    if (!logFactTable) {
      logFactTable = new Float64Array(LOG_FACT_MAX + 1)
      for (let i = 2; i <= LOG_FACT_MAX; i++) logFactTable[i] = logFactTable[i - 1] + Math.log(i)
    }
    return logFactTable[x - 1]
  }
  return logGamma(x)
}

function lbetaFast(a: number, b: number): number {
  return lgammaFast(a) + lgammaFast(b) - lgammaFast(a + b)
}

/**
 * Closed form P(Y_B > Y_A) for Y_B ~ Beta(aB, bB), Y_A ~ Beta(aA, bA), valid when aB is a
 * positive integer (Evan Miller, "Formulas for Bayesian A/B testing"; Cook 2005).
 */
function probGreaterClosed(aB: number, bB: number, aA: number, bA: number): number {
  let total = 0
  const lbA = lbetaFast(aA, bA)
  for (let i = 0; i < aB; i++) {
    total += Math.exp(lbetaFast(aA + i, bA + bB) - Math.log(bB + i) - lbetaFast(1 + i, bB) - lbA)
  }
  return total
}

/** Numerical fallback: ∫ f_C(x) · (1 − F_T(x)) dx by composite Simpson over the support of C. */
function probGreaterNumeric(aT: number, bT: number, aC: number, bC: number): number {
  const lo = Math.max(0, betaQuantile(1e-10, aC, bC))
  const hi = Math.min(1, betaQuantile(1 - 1e-10, aC, bC))
  const n = 2000
  const h = (hi - lo) / n
  let s = 0
  for (let i = 0; i <= n; i++) {
    const x = lo + i * h
    const w = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2
    const f = betaPdf(x, aC, bC)
    if (Number.isFinite(f)) s += w * f * (1 - betaCdf(x, aT, bT))
  }
  return (s * h) / 3
}

/**
 * Exact posterior probability that the treatment rate exceeds the control rate,
 * P(p_T > p_C), with p_T ~ Beta(aT, bT) and p_C ~ Beta(aC, bC) independent.
 * Uses whichever of four algebraically equivalent closed forms needs the fewest terms.
 */
export function probGreater(aT: number, bT: number, aC: number, bC: number): number {
  const candidates: Array<[number, () => number]> = []
  if (Number.isInteger(aT)) candidates.push([aT, () => probGreaterClosed(aT, bT, aC, bC)])
  if (Number.isInteger(aC)) candidates.push([aC, () => 1 - probGreaterClosed(aC, bC, aT, bT)])
  // Using 1 − p: P(p_T > p_C) = P(1 − p_C > 1 − p_T), with 1 − p ~ Beta(b, a)
  if (Number.isInteger(bC)) candidates.push([bC, () => probGreaterClosed(bC, aC, bT, aT)])
  if (Number.isInteger(bT)) candidates.push([bT, () => 1 - probGreaterClosed(bT, aT, bC, aC)])
  candidates.sort((x, y) => x[0] - y[0])
  if (candidates.length > 0 && candidates[0][0] <= 5000) {
    const v = candidates[0][1]()
    return Math.min(1, Math.max(0, v))
  }
  return Math.min(1, Math.max(0, probGreaterNumeric(aT, bT, aC, bC)))
}
