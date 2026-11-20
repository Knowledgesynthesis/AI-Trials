import { describe, expect, it } from 'vitest'
import {
  computeBoundaries,
  conditionalPower,
  conditionalPowerCurrentTrend,
  driftForPower,
  equalTiming,
  fixedDrift,
  naiveRepeatedTestingAlpha,
  operatingCharacteristics,
  predictivePower,
  spendingFunction,
} from './groupSequential'
import { normQuantile } from './distributions'

// Reference values: Jennison & Turnbull (2000) Tables 2.1–2.4; Pocock (1977);
// O'Brien & Fleming (1979); DeMets & Lan (1994); Armitage, McPherson & Rowe (1969).

describe('classical boundaries (two-sided α = 0.05, equally spaced)', () => {
  it.each([
    [2, 2.178],
    [3, 2.289],
    [4, 2.361],
    [5, 2.413],
  ])('Pocock K=%i constant = %f', (K, c) => {
    const d = computeBoundaries({ timing: equalTiming(K), alpha: 0.05, sides: 2, spec: { family: 'pocock' } })
    for (const b of d.upper) expect(b).toBeCloseTo(c, 3)
    expect(d.cumulativeAlpha[K - 1]).toBeCloseTo(0.05, 6)
  })

  it.each([
    [2, 1.977],
    [3, 2.004],
    [4, 2.024],
    [5, 2.04],
  ])("O'Brien–Fleming K=%i final boundary = %f", (K, c) => {
    const d = computeBoundaries({ timing: equalTiming(K), alpha: 0.05, sides: 2, spec: { family: 'obf' } })
    expect(d.upper[K - 1]).toBeCloseTo(c, 3)
    expect(d.upper[0]).toBeCloseTo(d.upper[K - 1] * Math.sqrt(K), 9)
  })
})

describe('Lan–DeMets spending boundaries', () => {
  it("OBF-type, K = 4 equally spaced, two-sided 0.05 → 4.333, 2.963, 2.359, 2.014", () => {
    const d = computeBoundaries({ timing: equalTiming(4), alpha: 0.05, sides: 2, spec: { family: 'ldof' } })
    const ref = [4.333, 2.963, 2.359, 2.014]
    d.upper.forEach((b, i) => expect(b).toBeCloseTo(ref[i], 2))
    expect(d.cumulativeAlpha[3]).toBeCloseTo(0.05, 6)
  })

  it('one-sided 0.025 spends exactly α(t) at each look', () => {
    const timing = [0.3, 0.55, 0.8, 1]
    const spec = { family: 'hsd' as const, param: -4 }
    const d = computeBoundaries({ timing, alpha: 0.025, sides: 1, spec })
    timing.forEach((t, i) => expect(d.cumulativeAlpha[i]).toBeCloseTo(spendingFunction(spec, 0.025, t), 8))
  })

  it('a single look reduces to the fixed-sample critical value', () => {
    const d = computeBoundaries({ timing: [1], alpha: 0.025, sides: 1, spec: { family: 'ldof' } })
    expect(d.upper[0]).toBeCloseTo(1.959964, 5)
  })

  it('Haybittle–Peto keeps the final boundary close to 1.96', () => {
    const d = computeBoundaries({ timing: equalTiming(3), alpha: 0.025, sides: 1, spec: { family: 'haybittle', hpZ: 3 } })
    expect(d.upper[0]).toBe(3)
    expect(d.upper[2]).toBeGreaterThan(1.96)
    expect(d.upper[2]).toBeLessThan(2.0)
    expect(d.cumulativeAlpha[2]).toBeCloseTo(0.025, 6)
  })
})

describe('sample-size inflation (two-sided α = 0.05, power 0.9, K = 5)', () => {
  it.each([
    ['pocock', 1.207],
    ['obf', 1.026],
  ] as const)('%s inflation factor ≈ %f', (family, R) => {
    const timing = equalTiming(5)
    const d = computeBoundaries({ timing, alpha: 0.05, sides: 2, spec: { family } })
    const theta = driftForPower(timing, d.upper, 0.9)
    const fixed = fixedDrift(0.025, 0.9)
    expect((theta / fixed) ** 2).toBeCloseTo(R, 2)
  })
})

describe('the peeking problem', () => {
  it.each([
    [2, 0.083],
    [3, 0.107],
    [5, 0.142],
    [10, 0.193],
  ])('testing at |Z| > 1.96 at %i equally spaced looks gives overall α ≈ %f', (K, a) => {
    expect(naiveRepeatedTestingAlpha(equalTiming(K), 1.96, 2)).toBeCloseTo(a, 3)
  })
})

describe('operating characteristics', () => {
  it('Type I error equals α under H0 without futility, and power is reached at the solved drift', () => {
    const timing = equalTiming(3)
    const d = computeBoundaries({ timing, alpha: 0.025, sides: 1, spec: { family: 'ldof' } })
    const none = timing.map(() => -Infinity)
    expect(operatingCharacteristics(timing, d.upper, none, 0).power).toBeCloseTo(0.025, 6)
    const th = driftForPower(timing, d.upper, 0.9)
    const oc = operatingCharacteristics(timing, d.upper, none, th)
    expect(oc.power).toBeCloseTo(0.9, 6)
    expect(oc.expectedInfo).toBeLessThan(1)
    expect(oc.expectedInfo).toBeGreaterThan(timing[0])
  })

  it('non-binding futility lowers Type I error below α', () => {
    const timing = equalTiming(3)
    const d = computeBoundaries({ timing, alpha: 0.025, sides: 1, spec: { family: 'ldof' } })
    const fut = [0, 0, -Infinity]
    expect(operatingCharacteristics(timing, d.upper, fut, 0).power).toBeLessThan(0.025)
  })
})

describe('conditional and predictive power', () => {
  const c = normQuantile(0.975)
  it('equals the observed outcome at t = 1', () => {
    expect(conditionalPower(2.1, 1, c, 0)).toBe(1)
    expect(predictivePower(1.5, 1, c)).toBe(0)
  })
  it('current-trend CP matches the closed form and exceeds 50% when the trend is on track', () => {
    // Z = 1.5 at t = 0.5: trend drift = 1.5/√0.5 = 2.121 → CP = Φ((2.121 − 1.96)/√0.5)
    expect(conditionalPowerCurrentTrend(1.5, 0.5, c)).toBeCloseTo(0.5904, 3)
    expect(conditionalPower(1.5, 0.5, c, 1.5 / Math.sqrt(0.5))).toBeCloseTo(conditionalPowerCurrentTrend(1.5, 0.5, c), 12)
  })
  it('predictive power is shrunk toward 50% relative to current-trend CP', () => {
    // Below-target trend: CP_trend < PP < 0.5; above-target trend: 0.5 < PP < CP_trend
    const low = predictivePower(1.2, 0.5, c)
    expect(low).toBeGreaterThan(conditionalPowerCurrentTrend(1.2, 0.5, c))
    expect(low).toBeLessThan(0.5)
    const high = predictivePower(2.0, 0.5, c)
    expect(high).toBeLessThan(conditionalPowerCurrentTrend(2.0, 0.5, c))
    expect(high).toBeGreaterThan(0.5)
    expect(predictivePower(1.2, 0.5, c)).toBeGreaterThan(conditionalPower(1.2, 0.5, c, 0))
  })
})
