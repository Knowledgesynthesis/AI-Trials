/**
 * Familywise-error-rate procedures for m hypotheses (Dmitrienko, Tamhane & Bretz 2010).
 * All return reject flags and adjusted p-values in the original order.
 */

export interface MultiplicityResult {
  reject: boolean[]
  adjusted: number[]
}

export function bonferroni(p: number[], alpha: number): MultiplicityResult {
  const m = p.length
  const adjusted = p.map((x) => Math.min(1, x * m))
  return { adjusted, reject: adjusted.map((x) => x <= alpha) }
}

/** Holm (1979) step-down. Valid under any dependence. */
export function holm(p: number[], alpha: number): MultiplicityResult {
  const m = p.length
  const order = p.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0])
  const adjusted = new Array<number>(m)
  let running = 0
  order.forEach(([v, i], rank) => {
    running = Math.max(running, Math.min(1, (m - rank) * v))
    adjusted[i] = running
  })
  return { adjusted, reject: adjusted.map((x) => x <= alpha) }
}

/** Hochberg (1988) step-up. Requires independence or positive dependence (PRDS). */
export function hochberg(p: number[], alpha: number): MultiplicityResult {
  const m = p.length
  const order = p.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]) // descending
  const adjusted = new Array<number>(m)
  let running = 1
  order.forEach(([v, i], idx) => {
    const rankFromTop = idx + 1 // 1 for the largest p
    running = Math.min(running, rankFromTop * v)
    adjusted[i] = Math.min(1, running)
  })
  return { adjusted, reject: adjusted.map((x) => x <= alpha) }
}

/** Fixed-sequence (hierarchical) testing in the given order at full α; stop at first failure. */
export function fixedSequence(p: number[], alpha: number): MultiplicityResult {
  const adjusted: number[] = []
  let running = 0
  for (const v of p) {
    running = Math.max(running, v)
    adjusted.push(running)
  }
  return { adjusted, reject: adjusted.map((x) => x <= alpha) }
}

/** Probability of ≥1 false positive among m independent true-null tests at level α. */
export function fwerIndependent(m: number, alpha: number): number {
  return 1 - (1 - alpha) ** m
}
