/**
 * Allocation schemes and their trade-off between balance and predictability.
 * Predictability is measured with the Blackwell–Hodges "convergence strategy": an unblinded
 * recruiter who knows previous assignments guesses the arm that is currently behind
 * (within the stratum, for stratified schemes; the minimisation-preferred arm for minimisation).
 * 50% correct = unpredictable.
 */

import { createRng, quantile, shuffle, type Rng } from './rng'

export type Scheme = 'simple' | 'block4' | 'blockRandom' | 'stratified' | 'minimization'

export const SCHEME_LABELS: Record<Scheme, string> = {
  simple: 'Simple (coin flip)',
  block4: 'Permuted blocks, fixed size 4',
  blockRandom: 'Permuted blocks, random size 2/4/6',
  stratified: 'Stratified permuted blocks (size 4)',
  minimization: 'Minimisation (Pocock–Simon, p = 0.8)',
}

export interface RandomizationParams {
  n: number
  prevalenceX1: number // e.g. diabetes
  prevalenceX2: number // e.g. age ≥ 65
  reps: number
  seed: number
}

export interface SchemeSummary {
  scheme: Scheme
  meanAbsImbalance: number
  p95AbsImbalance: number
  probImbalanceOver10pct: number
  meanFactorImbalance: number // |#X1 in A − #X1 in B|
  guessAccuracy: number
}

class BlockSource {
  private queue: number[] = []
  private readonly rng: Rng
  private readonly sizes: number[]
  constructor(rng: Rng, sizes: number[]) {
    this.rng = rng
    this.sizes = sizes
  }
  next(): number {
    if (this.queue.length === 0) {
      const size = this.sizes[Math.floor(this.rng() * this.sizes.length)]
      const block = Array.from({ length: size }, (_, i) => (i < size / 2 ? 0 : 1))
      this.queue = shuffle(this.rng, block)
    }
    return this.queue.shift()!
  }
}

function runOne(scheme: Scheme, p: RandomizationParams, rng: Rng) {
  const blocks = new Map<string, BlockSource>()
  const counts = new Map<string, [number, number]>()
  // minimisation marginal counts: [factor][level][arm]
  const marg = [
    [
      [0, 0],
      [0, 0],
    ],
    [
      [0, 0],
      [0, 0],
    ],
  ]
  let nA = 0
  let nB = 0
  let x1A = 0
  let x1B = 0
  let correct = 0
  for (let i = 0; i < p.n; i++) {
    const x1 = rng() < p.prevalenceX1 ? 1 : 0
    const x2 = rng() < p.prevalenceX2 ? 1 : 0
    const stratum = scheme === 'stratified' ? `${x1}${x2}` : 'all'
    const sc = counts.get(stratum) ?? [0, 0]
    let arm: number
    let guess: number
    switch (scheme) {
      case 'simple':
        arm = rng() < 0.5 ? 0 : 1
        guess = nA === nB ? (rng() < 0.5 ? 0 : 1) : nA < nB ? 0 : 1
        break
      case 'block4':
      case 'blockRandom':
      case 'stratified': {
        const sizes = scheme === 'blockRandom' ? [2, 4, 6] : [4]
        if (!blocks.has(stratum)) blocks.set(stratum, new BlockSource(rng, sizes))
        arm = blocks.get(stratum)!.next()
        guess = sc[0] === sc[1] ? (rng() < 0.5 ? 0 : 1) : sc[0] < sc[1] ? 0 : 1
        break
      }
      case 'minimization': {
        const scoreA = Math.abs(marg[0][x1][0] + 1 - marg[0][x1][1]) + Math.abs(marg[1][x2][0] + 1 - marg[1][x2][1])
        const scoreB = Math.abs(marg[0][x1][0] - (marg[0][x1][1] + 1)) + Math.abs(marg[1][x2][0] - (marg[1][x2][1] + 1))
        let preferred: number
        if (scoreA === scoreB) preferred = rng() < 0.5 ? 0 : 1
        else preferred = scoreA < scoreB ? 0 : 1
        arm = rng() < 0.8 ? preferred : 1 - preferred
        guess = preferred
        break
      }
    }
    if (guess === arm) correct++
    sc[arm]++
    counts.set(stratum, sc)
    marg[0][x1][arm]++
    marg[1][x2][arm]++
    if (arm === 0) {
      nA++
      if (x1) x1A++
    } else {
      nB++
      if (x1) x1B++
    }
  }
  return { imbalance: Math.abs(nA - nB), factorImbalance: Math.abs(x1A - x1B), accuracy: correct / p.n }
}

export function simulateRandomization(p: RandomizationParams): SchemeSummary[] {
  const schemes: Scheme[] = ['simple', 'block4', 'blockRandom', 'stratified', 'minimization']
  return schemes.map((scheme, si) => {
    const rng = createRng(p.seed + si * 7919)
    const imb: number[] = []
    const fac: number[] = []
    const acc: number[] = []
    for (let r = 0; r < p.reps; r++) {
      const o = runOne(scheme, p, rng)
      imb.push(o.imbalance)
      fac.push(o.factorImbalance)
      acc.push(o.accuracy)
    }
    imb.sort((a, b) => a - b)
    return {
      scheme,
      meanAbsImbalance: imb.reduce((a, b) => a + b, 0) / imb.length,
      p95AbsImbalance: quantile(imb, 0.95),
      probImbalanceOver10pct: imb.filter((v) => v > 0.1 * p.n).length / imb.length,
      meanFactorImbalance: fac.reduce((a, b) => a + b, 0) / fac.length,
      guessAccuracy: acc.reduce((a, b) => a + b, 0) / acc.length,
    }
  })
}

/** One allocation sequence for display. */
export function sampleSequence(scheme: Scheme, n: number, seed: number): number[] {
  const rng = createRng(seed)
  const out: number[] = []
  if (scheme === 'simple') {
    for (let i = 0; i < n; i++) out.push(rng() < 0.5 ? 0 : 1)
    return out
  }
  const src = new BlockSource(rng, scheme === 'blockRandom' ? [2, 4, 6] : [4])
  for (let i = 0; i < n; i++) out.push(src.next())
  return out
}
