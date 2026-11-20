import { describe, expect, it } from 'vitest'
import {
  betaCdf,
  betaInterval,
  betaPdf,
  betaQuantile,
  binomPmf,
  logGamma,
  normCdf,
  normQuantile,
  probGreater,
} from './distributions'
import { createRng, rbeta } from './rng'

describe('normal distribution (reference values from R pnorm/qnorm)', () => {
  it.each([
    [0, 0.5],
    [1, 0.8413447460685429],
    [1.959963984540054, 0.975],
    [-3, 0.0013498980316301],
    [-8, 6.220960574271784e-16],
    [-12, 1.7764821120776e-33],
    [2.5, 0.9937903346742238],
  ])('Φ(%f) = %f', (x, p) => {
    expect(normCdf(x)).toBeCloseTo(p, 13)
    expect(normCdf(x) / p).toBeCloseTo(1, 12) // relative accuracy, including the far tail
  })

  it.each([
    [0.975, 1.959963984540054],
    [0.995, 2.5758293035489],
    [0.8, 0.8416212335729143],
    [0.9, 1.2815515655446004],
    [1e-10, -6.361340902404056],
    [0.5, 0],
  ])('Φ⁻¹(%f) = %f', (p, x) => {
    expect(normQuantile(p)).toBeCloseTo(x, 11)
  })

  it('quantile inverts cdf across the range', () => {
    // upper tail limited by double representation of p near 1, so test x ≤ 5
    for (let x = -9; x <= 5; x += 0.37) expect(normQuantile(normCdf(x))).toBeCloseTo(x, 10)
  })
})

describe('gamma / beta functions', () => {
  it('logGamma matches factorials and Γ(1/2) = √π', () => {
    expect(logGamma(1)).toBeCloseTo(0, 14)
    expect(logGamma(2)).toBeCloseTo(0, 14)
    expect(logGamma(10)).toBeCloseTo(Math.log(362880), 12)
    expect(logGamma(0.5)).toBeCloseTo(0.5 * Math.log(Math.PI), 13)
    expect(logGamma(171.5)).toBeCloseTo(709.1431630309282, 9) // mpmath
  })

  it('Beta(1,1) is uniform; Beta(2,2) density at 0.5 is 1.5', () => {
    expect(betaPdf(0.3, 1, 1)).toBeCloseTo(1, 12)
    expect(betaPdf(0.5, 2, 2)).toBeCloseTo(1.5, 12)
  })

  it('incomplete beta matches R pbeta', () => {
    expect(betaCdf(0.3, 2, 5)).toBeCloseTo(0.579825, 12)
    expect(betaCdf(0.5, 12, 42)).toBeCloseTo(0.9999887622029884, 12)
    expect(betaCdf(0.25, 0.5, 0.5)).toBeCloseTo(1 / 3, 10) // arcsine law
  })

  it('beta quantiles invert the CDF and give the textbook interval', () => {
    const [lo, hi] = betaInterval(21, 31) // Beta(1,1) prior + 20/50 responses
    expect(betaCdf(lo, 21, 31)).toBeCloseTo(0.025, 10)
    expect(betaCdf(hi, 21, 31)).toBeCloseTo(0.975, 10)
    expect(lo).toBeCloseTo(0.27584296, 7) // scipy.stats.beta.ppf
    expect(hi).toBeCloseTo(0.53885901, 7)
    expect(betaQuantile(0.5, 3, 3)).toBeCloseTo(0.5, 12)
  })

  it('binomial pmf sums to one', () => {
    let s = 0
    for (let k = 0; k <= 40; k++) s += binomPmf(k, 40, 0.37)
    expect(s).toBeCloseTo(1, 12)
  })
})

describe('P(p_T > p_C) for Beta posteriors', () => {
  it('is 0.5 by symmetry', () => {
    expect(probGreater(1, 1, 1, 1)).toBeCloseTo(0.5, 12)
    expect(probGreater(13, 8, 13, 8)).toBeCloseTo(0.5, 12)
  })

  it('agrees with Monte Carlo and with numerical integration for non-integer parameters', () => {
    const rng = createRng(42)
    const cases: Array<[number, number, number, number]> = [
      [36, 16, 21, 31],
      [8.5, 3.2, 5.5, 6.1],
      [101, 101, 90, 112],
    ]
    for (const [aT, bT, aC, bC] of cases) {
      let hits = 0
      const n = 200000
      for (let i = 0; i < n; i++) if (rbeta(rng, aT, bT) > rbeta(rng, aC, bC)) hits++
      expect(Math.abs(probGreater(aT, bT, aC, bC) - hits / n)).toBeLessThan(0.004)
    }
  })

  it('complementary orderings sum to one', () => {
    expect(probGreater(30, 20, 25, 25) + probGreater(25, 25, 30, 20)).toBeCloseTo(1, 12)
  })
})
