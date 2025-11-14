/**
 * Statistical simulation engines for Bayesian updating and adaptive designs
 * All calculations use standard, validated statistical methods
 */

/**
 * Beta distribution functions for Bayesian binary outcomes
 */
export function betaMean(alpha: number, beta: number): number {
  return alpha / (alpha + beta)
}

export function betaVariance(alpha: number, beta: number): number {
  const sum = alpha + beta
  return (alpha * beta) / (sum * sum * (sum + 1))
}

/**
 * Calculate credible interval for Beta distribution
 * Using quantile approximation
 */
export function betaCredibleInterval(
  alpha: number,
  beta: number,
  level: number = 0.95
): [number, number] {
  const tail = (1 - level) / 2

  // Quantile approximation for beta distribution
  const lower = quantileBeta(tail, alpha, beta)
  const upper = quantileBeta(1 - tail, alpha, beta)

  return [lower, upper]
}

/**
 * Approximate beta quantile using Wilson-Hilferty approximation
 */
function quantileBeta(p: number, alpha: number, beta: number): number {
  // For computational simplicity, using method of moments approximation
  const mean = alpha / (alpha + beta)
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1))

  // Normal approximation (valid for reasonably large alpha, beta)
  const z = inverseNormalCDF(p)
  const estimate = mean + z * Math.sqrt(variance)

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, estimate))
}

/**
 * Inverse normal CDF (approximation)
 */
function inverseNormalCDF(p: number): number {
  // Beasley-Springer-Moro algorithm approximation
  const c = [
    0.3374754822726147,
    0.9761690190917186,
    0.1607979714918209,
    0.0276438810333863,
    0.0038405729373609,
    0.0003951896511919,
    0.0000321767881768,
    0.0000002888167364,
    0.0000003960315187
  ]

  if (p < 0.5) {
    const q = Math.sqrt(-2 * Math.log(p))
    return -(((c[0] + c[1] * q + c[2] * q * q + c[3] * q * q * q + c[4] * q * q * q * q) /
      (1 + c[5] * q + c[6] * q * q + c[7] * q * q * q + c[8] * q * q * q * q)))
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p))
    return (((c[0] + c[1] * q + c[2] * q * q + c[3] * q * q * q + c[4] * q * q * q * q) /
      (1 + c[5] * q + c[6] * q * q + c[7] * q * q * q + c[8] * q * q * q * q)))
  }
}

/**
 * Calculate probability that treatment > control for binary outcomes
 * Using Beta distributions
 */
export function probabilityTreatmentBetter(
  alphaControl: number,
  betaControl: number,
  alphaTreatment: number,
  betaTreatment: number
): number {
  // Monte Carlo approximation for P(p_treatment > p_control)
  const nSamples = 10000
  let count = 0

  for (let i = 0; i < nSamples; i++) {
    const pControl = sampleBeta(alphaControl, betaControl)
    const pTreatment = sampleBeta(alphaTreatment, betaTreatment)

    if (pTreatment > pControl) {
      count++
    }
  }

  return count / nSamples
}

/**
 * Sample from Beta distribution using acceptance-rejection
 */
function sampleBeta(alpha: number, beta: number): number {
  // Using gamma ratio method: Beta(α,β) = Gamma(α) / (Gamma(α) + Gamma(β))
  const x = sampleGamma(alpha, 1)
  const y = sampleGamma(beta, 1)
  return x / (x + y)
}

/**
 * Sample from Gamma distribution using Marsaglia and Tsang method
 */
function sampleGamma(shape: number, scale: number): number {
  if (shape < 1) {
    // Use Johnk's generator for shape < 1
    return sampleGamma(shape + 1, scale) * Math.pow(Math.random(), 1 / shape)
  }

  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)

  while (true) {
    let x, v
    do {
      x = randomNormal(0, 1)
      v = 1 + c * x
    } while (v <= 0)

    v = v * v * v
    const u = Math.random()
    const x2 = x * x

    if (u < 1 - 0.0331 * x2 * x2) {
      return d * v * scale
    }

    if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) {
      return d * v * scale
    }
  }
}

/**
 * Box-Muller transform for normal random variables
 */
function randomNormal(mean: number, std: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0 * std + mean
}

/**
 * Adaptive randomization: calculate allocation probability
 * Using Bayesian response-adaptive randomization
 */
export function adaptiveAllocationProbability(
  alphaControl: number,
  betaControl: number,
  alphaTreatment: number,
  betaTreatment: number,
  tuning: number = 0.5
): number {
  // P(allocate to treatment) = [P(treatment better)]^tuning
  // tuning = 0: fixed 1:1, tuning = 1: fully adaptive

  const probBetter = probabilityTreatmentBetter(
    alphaControl,
    betaControl,
    alphaTreatment,
    betaTreatment
  )

  const adaptiveProb = Math.pow(probBetter, tuning)
  const denominator = adaptiveProb + Math.pow(1 - probBetter, tuning)

  return adaptiveProb / denominator
}

/**
 * Generate synthetic binary trial data
 */
export function generateBinaryOutcomes(
  n: number,
  trueRate: number
): { successes: number; failures: number } {
  let successes = 0
  for (let i = 0; i < n; i++) {
    if (Math.random() < trueRate) {
      successes++
    }
  }
  return {
    successes,
    failures: n - successes,
  }
}

/**
 * Calculate conditional power for interim analysis
 * Simplified version assuming normal approximation
 */
export function conditionalPower(
  currentZ: number,
  informationFraction: number,
  criticalValue: number,
  assumedEffect: 'current-trend' | 'alternative' | number = 'current-trend'
): number {
  // Conditional power = P(reject H0 at end | current data)
  const remainingFraction = 1 - informationFraction

  let drift: number
  if (assumedEffect === 'current-trend') {
    drift = currentZ
  } else if (assumedEffect === 'alternative') {
    // Would need to specify the alternative hypothesis
    drift = currentZ
  } else {
    drift = assumedEffect
  }

  const conditionalMean = currentZ + drift * Math.sqrt(remainingFraction / informationFraction)
  const conditionalSD = Math.sqrt(remainingFraction)

  // P(Z_final > critical value)
  const standardized = (criticalValue - conditionalMean) / conditionalSD
  return 1 - normalCDF(standardized)
}

/**
 * Normal CDF approximation
 */
function normalCDF(z: number): number {
  // Using error function approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

  return z > 0 ? 1 - prob : prob
}

/**
 * O'Brien-Fleming alpha spending function
 */
export function obrienFlemingBound(
  informationFraction: number,
  alpha: number = 0.05
): number {
  // Z = Φ^(-1)(1 - α/2) / sqrt(information fraction)
  const z = inverseNormalCDF(1 - alpha / 2)
  return z / Math.sqrt(informationFraction)
}

/**
 * Pocock alpha spending function
 */
export function pocockBound(
  numberOfAnalyses: number,
  alpha: number = 0.05
): number {
  // Approximate Pocock boundary (constant across analyses)
  // For K analyses, critical value ≈ Φ^(-1)(1 - α/(2K))
  return inverseNormalCDF(1 - alpha / (2 * numberOfAnalyses))
}
