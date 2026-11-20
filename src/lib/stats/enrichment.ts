/**
 * Prognostic enrichment with an ML risk model, on a synthetic population of two groups.
 *
 * True control-arm risk: logit(r) ~ N(μ_g, 1). The model's score is logit(r) + noise
 * (noise controls discrimination) minus a group-B bias (systematic under-prediction, the
 * mechanism documented by Obermeyer et al., Science 2019, when cost is used as a proxy label).
 * Patients above a predicted-risk percentile are enrolled; a constant relative risk reduction
 * is assumed. Everything is synthetic; the point is the trade-offs, not the numbers.
 */

import { createRng, rnorm } from './rng'
import { nProportions } from './sampleSize'

export interface EnrichmentParams {
  population: number
  propB: number
  baseRiskA: number // mean control risk (probability) in group A
  baseRiskB: number
  modelNoise: number // SD of noise added on the logit scale (0 = perfect ranking)
  biasB: number // logit units the model under-predicts group B
  rrr: number // relative risk reduction of treatment
  seed: number
}

export const defaultEnrichment: EnrichmentParams = {
  population: 20000,
  propB: 0.25,
  baseRiskA: 0.12,
  baseRiskB: 0.12,
  modelNoise: 0.6,
  biasB: 0.8,
  rrr: 0.25,
  seed: 11,
}

const logit = (p: number) => Math.log(p / (1 - p))
const expit = (x: number) => 1 / (1 + Math.exp(-x))

export interface Patient {
  group: 0 | 1 // 1 = B
  trueRisk: number
  predRisk: number
  event: 0 | 1 // simulated control-arm outcome (for AUC / calibration)
}

export function makePopulation(p: EnrichmentParams): Patient[] {
  const rng = createRng(p.seed)
  const out: Patient[] = []
  for (let i = 0; i < p.population; i++) {
    const g: 0 | 1 = rng() < p.propB ? 1 : 0
    // choose μ so the mean risk ≈ requested base risk: E[expit(N(μ,1))] ≈ expit(μ/√(1+π/8))
    const mu = logit(g ? p.baseRiskB : p.baseRiskA) * Math.sqrt(1 + Math.PI / 8)
    const L = rnorm(rng, mu, 1)
    const score = L + rnorm(rng, 0, p.modelNoise) - (g ? p.biasB : 0)
    const r = expit(L)
    out.push({ group: g, trueRisk: r, predRisk: expit(score), event: rng() < r ? 1 : 0 })
  }
  return out
}

export interface EnrichmentPoint {
  fractionEnrolled: number
  controlRisk: number
  nPerArm: number
  screened: number
  shareB: number
  sensitivityA: number // share of truly high-risk A patients who are enrolled
  sensitivityB: number
}

/** Evaluate enrollment of the top q fraction by predicted risk, for a grid of q. */
export function enrichmentCurve(pop: Patient[], rrr: number, grid: number[]): EnrichmentPoint[] {
  const sorted = [...pop].sort((a, b) => b.predRisk - a.predRisk)
  const byTrue = [...pop].sort((a, b) => b.trueRisk - a.trueRisk)
  // "truly high risk" = top 30% by true risk
  const hiCut = byTrue[Math.floor(0.3 * byTrue.length)].trueRisk
  const totalHiA = pop.filter((x) => x.group === 0 && x.trueRisk >= hiCut).length
  const totalHiB = pop.filter((x) => x.group === 1 && x.trueRisk >= hiCut).length
  return grid.map((q) => {
    const m = Math.max(1, Math.round(q * sorted.length))
    let risk = 0
    let nB = 0
    let hiA = 0
    let hiB = 0
    for (let i = 0; i < m; i++) {
      const x = sorted[i]
      risk += x.trueRisk
      if (x.group === 1) nB++
      if (x.trueRisk >= hiCut) {
        if (x.group === 0) hiA++
        else hiB++
      }
    }
    const pC = risk / m
    const pT = pC * (1 - rrr)
    const n = nProportions({ pControl: pC, pExperimental: pT, alphaOneSided: 0.025, power: 0.8 })
    const nPerArm = n.perArmRounded[0]
    return {
      fractionEnrolled: q,
      controlRisk: pC,
      nPerArm,
      screened: Math.ceil((2 * nPerArm) / q),
      shareB: nB / m,
      sensitivityA: totalHiA ? hiA / totalHiA : NaN,
      sensitivityB: totalHiB ? hiB / totalHiB : NaN,
    }
  })
}

export interface GroupMetrics {
  meanPredicted: number
  observedRate: number
  auc: number
  n: number
}

function auc(xs: Patient[]): number {
  const s = [...xs].sort((a, b) => a.predRisk - b.predRisk)
  let rankSum = 0
  let nPos = 0
  s.forEach((x, i) => {
    if (x.event) {
      rankSum += i + 1
      nPos++
    }
  })
  const nNeg = s.length - nPos
  if (nPos === 0 || nNeg === 0) return NaN
  return (rankSum - (nPos * (nPos + 1)) / 2) / (nPos * nNeg)
}

export function groupMetrics(pop: Patient[], group: 0 | 1): GroupMetrics {
  const xs = pop.filter((x) => x.group === group)
  return {
    n: xs.length,
    meanPredicted: xs.reduce((a, x) => a + x.predRisk, 0) / xs.length,
    observedRate: xs.reduce((a, x) => a + x.event, 0) / xs.length,
    auc: auc(xs),
  }
}
