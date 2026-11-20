import { describe, expect, it } from 'vitest'
import {
  designEffect,
  eventProbability,
  eventsSchoenfeld,
  nMeans,
  nProportions,
  nProportionsNI,
  powerMeans,
  powerProportions,
} from './sampleSize'
import { bonferroni, fixedSequence, fwerIndependent, hochberg, holm } from './multiplicity'
import { simulateRar, defaultRarParams } from './rar'
import { simulateRandomization } from './randomization'
import { defaultEnrichment, enrichmentCurve, groupMetrics, makePopulation } from './enrichment'
import { bayesMonitoringOC, empiricalPowerBinary, empiricalPowerMeans, simulateStoppingBias } from './simulate'
import { computeBoundaries, equalTiming } from './groupSequential'

describe('sample size (textbook values)', () => {
  it('means: δ = 0.5 SD, two-sided 5%, 80% power → 63 per arm', () => {
    const r = nMeans({ delta: 0.5, sd: 1, alphaOneSided: 0.025, power: 0.8 })
    expect(r.nControl).toBeCloseTo(62.79, 2)
    expect(r.perArmRounded).toEqual([63, 63])
  })
  it('proportions 40% vs 60%: 97 per arm; 107 with continuity correction', () => {
    expect(nProportions({ pControl: 0.4, pExperimental: 0.6, alphaOneSided: 0.025, power: 0.8 }).perArmRounded[0]).toBe(97)
    expect(
      nProportions({ pControl: 0.4, pExperimental: 0.6, alphaOneSided: 0.025, power: 0.8, continuityCorrection: true }).perArmRounded[0],
    ).toBe(107)
  })
  it('Schoenfeld: HR 0.75, two-sided 5%, 90% power → 508 events', () => {
    expect(Math.ceil(eventsSchoenfeld({ hr: 0.75, alphaOneSided: 0.025, power: 0.9 }))).toBe(508)
  })
  it('2:1 allocation needs more total patients than 1:1 for the same power', () => {
    const one = nMeans({ delta: 0.5, sd: 1, alphaOneSided: 0.025, power: 0.8 })
    const two = nMeans({ delta: 0.5, sd: 1, alphaOneSided: 0.025, power: 0.8, k: 2 })
    expect(two.total).toBeGreaterThan(one.total)
    expect(two.nControl * 3).toBeCloseTo(one.nControl * 2 * (9 / 8), 6) // total ∝ (1+k)²/k
  })
  it('NI proportions: 85% vs 85%, margin 10% → 268 per arm (one-sided 2.5%, 90% power)', () => {
    const r = nProportionsNI({ pControl: 0.85, pExperimental: 0.85, margin: 0.1, alphaOneSided: 0.025, power: 0.9 })
    expect(r.perArmRounded[0]).toBe(268)
  })
  it('power functions invert the sample-size formulas', () => {
    expect(powerMeans(0.5, 1, 62.79, 62.79, 0.025)).toBeCloseTo(0.8, 3)
    const n = nProportions({ pControl: 0.3, pExperimental: 0.45, alphaOneSided: 0.025, power: 0.9 }).nControl
    expect(powerProportions(0.3, 0.45, n, n, 0.025)).toBeCloseTo(0.9, 3)
  })
  it('simulation confirms the formulas (±3%)', () => {
    expect(Math.abs(empiricalPowerBinary(0.4, 0.6, 97, 97, 0.025, 4000, 1) - 0.8)).toBeLessThan(0.03)
    expect(Math.abs(empiricalPowerMeans(0.5, 1, 63, 63, 0.025, 4000, 2) - 0.8)).toBeLessThan(0.03)
  })
  it('event probability and design effect', () => {
    expect(eventProbability(0.2, 1)).toBeCloseTo(0.2, 12)
    expect(eventProbability(0.2, 0.5)).toBeCloseTo(0.5 * 0.2 + 0.5 * (1 - 0.8 ** 0.5), 12)
    expect(designEffect(20, 0.05)).toBeCloseTo(1.95, 12)
  })
})

describe('multiplicity procedures', () => {
  const p = [0.01, 0.04, 0.03, 0.005]
  it('Bonferroni rejects only p ≤ α/m', () => {
    expect(bonferroni(p, 0.05).reject).toEqual([true, false, false, true])
  })
  it('Holm is uniformly more powerful than Bonferroni', () => {
    expect(holm(p, 0.05).reject).toEqual([true, false, false, true])
    expect(holm([0.01, 0.02, 0.03, 0.04], 0.05).reject).toEqual([true, false, false, false])
    expect(holm([0.011, 0.012, 0.013, 0.2], 0.05).reject).toEqual([true, true, true, false])
  })
  it('Hochberg rejects all when the largest p ≤ α', () => {
    expect(hochberg([0.01, 0.02, 0.03, 0.04], 0.05).reject).toEqual([true, true, true, true])
    expect(hochberg(p, 0.05).adjusted.map((x) => +x.toFixed(4))).toEqual([0.03, 0.04, 0.04, 0.02])
  })
  it('fixed sequence stops at the first failure', () => {
    expect(fixedSequence([0.01, 0.2, 0.001], 0.05).reject).toEqual([true, false, false])
  })
  it('FWER for 20 independent tests ≈ 64%', () => {
    expect(fwerIndependent(20, 0.05)).toBeCloseTo(0.6415, 4)
  })
})

describe('response-adaptive randomization simulator', () => {
  it('with no adaptation (burn-in = n) allocation is ~50% and power matches a fixed design', () => {
    const r = simulateRar({ ...defaultRarParams, burnIn: 200, reps: 400 })
    expect(Math.abs(r.rar.meanPropT - 0.5)).toBeLessThan(0.02)
    expect(Math.abs(r.rar.rejectRate - r.fixed.rejectRate)).toBeLessThan(0.08)
  })
  it('shifts allocation toward the better arm, with more variability than 1:1', () => {
    const r = simulateRar({ ...defaultRarParams, reps: 400 })
    expect(r.rar.meanPropT).toBeGreaterThan(0.55)
    expect(r.rar.p95PropT - r.rar.p05PropT).toBeGreaterThan(r.fixed.p95PropT - r.fixed.p05PropT)
    expect(r.trace.length).toBe(defaultRarParams.n)
  })
  it('a time trend under the null inflates the Type I error of RAR but not of 1:1', () => {
    const base = { ...defaultRarParams, pControl: 0.25, pTreatment: 0.25, drift: 0.3, tuning: 'fixed' as const, c: 1, clip: 0.05, reps: 1500 }
    const r = simulateRar(base)
    expect(r.fixed.rejectRate).toBeLessThan(0.04)
    expect(r.rar.rejectRate).toBeGreaterThan(r.fixed.rejectRate)
  })
})

describe('randomization schemes', () => {
  const res = simulateRandomization({ n: 100, prevalenceX1: 0.3, prevalenceX2: 0.5, reps: 1500, seed: 3 })
  const get = (s: string) => res.find((r) => r.scheme === s)!
  it('simple randomization: E|imbalance| ≈ √(2n/π) ≈ 8 and unpredictable', () => {
    expect(get('simple').meanAbsImbalance).toBeGreaterThan(6.5)
    expect(get('simple').meanAbsImbalance).toBeLessThan(9.5)
    expect(Math.abs(get('simple').guessAccuracy - 0.5)).toBeLessThan(0.02)
  })
  it('fixed blocks of 4 balance tightly but are predictable', () => {
    expect(get('block4').p95AbsImbalance).toBeLessThanOrEqual(2)
    expect(get('block4').guessAccuracy).toBeGreaterThan(0.65)
    expect(get('blockRandom').guessAccuracy).toBeLessThan(get('block4').guessAccuracy)
  })
  it('minimisation balances the prognostic factor best', () => {
    expect(get('minimization').meanFactorImbalance).toBeLessThan(get('simple').meanFactorImbalance)
    expect(get('minimization').meanFactorImbalance).toBeLessThan(get('block4').meanFactorImbalance)
  })
})

describe('ML enrichment', () => {
  const pop = makePopulation(defaultEnrichment)
  it('reproduces the requested base risk', () => {
    const mean = pop.reduce((a, x) => a + x.trueRisk, 0) / pop.length
    expect(Math.abs(mean - 0.12)).toBeLessThan(0.01)
  })
  it('enrichment raises event rate, cuts trial size, increases screening, and under-enrols a mis-scored group', () => {
    const [all, top] = enrichmentCurve(pop, 0.25, [1, 0.3])
    expect(top.controlRisk).toBeGreaterThan(all.controlRisk)
    expect(top.nPerArm).toBeLessThan(all.nPerArm)
    expect(top.screened).toBeGreaterThan(2 * top.nPerArm)
    expect(top.shareB).toBeLessThan(all.shareB)
    expect(top.sensitivityB).toBeLessThan(top.sensitivityA)
  })
  it('group B is miscalibrated (predicted < observed) while A is roughly calibrated', () => {
    const a = groupMetrics(pop, 0)
    const b = groupMetrics(pop, 1)
    expect(b.meanPredicted).toBeLessThan(b.observedRate * 0.8)
    expect(Math.abs(a.meanPredicted - a.observedRate)).toBeLessThan(0.03)
    expect(a.auc).toBeGreaterThan(0.6)
  })
})

describe('Monte Carlo companions', () => {
  it('trials that stop early overestimate the effect', () => {
    const timing = equalTiming(4)
    const d = computeBoundaries({ timing, alpha: 0.025, sides: 1, spec: { family: 'ldof' } })
    const r = simulateStoppingBias(timing, d.upper, 2.5, 6000, 9)
    expect(r.earlyStopMeanRatio).toBeGreaterThan(1.15)
  })
  it('monitoring a posterior probability at 5 looks inflates the frequentist Type I error', () => {
    const one = bayesMonitoringOC({ pControl: 0.3, pTreatment: 0.3, nPerArm: 100, looks: 1, threshold: 0.975, reps: 3000, seed: 5 })
    const five = bayesMonitoringOC({ pControl: 0.3, pTreatment: 0.3, nPerArm: 100, looks: 5, threshold: 0.975, reps: 3000, seed: 5 })
    expect(one.rejectRate).toBeLessThan(0.04)
    expect(five.rejectRate).toBeGreaterThan(one.rejectRate * 1.5)
  })
})
