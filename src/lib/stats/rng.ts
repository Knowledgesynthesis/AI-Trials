/**
 * Seeded pseudo-random numbers so every simulation in the app is reproducible:
 * the same seed always produces the same synthetic trial.
 */

export type Rng = () => number

/** murmur3 finaliser: decorrelates nearby seeds (0, 1, 2, …) before they reach the generator. */
export function mixSeed(n: number): number {
  let h = n >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}

/** FNV-1a hash of a string, for deriving stable seeds from ids. */
export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32: small, fast, well-distributed 32-bit generator (seed mixed first). */
export function createRng(seed: number): Rng {
  let a = mixSeed(seed)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

/** Standard normal via Box–Muller. */
export function rnorm(rng: Rng, mean = 0, sd = 1): number {
  let u = 0
  while (u === 0) u = rng()
  const v = rng()
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function rbern(rng: Rng, p: number): 0 | 1 {
  return rng() < p ? 1 : 0
}

export function rbinom(rng: Rng, n: number, p: number): number {
  let k = 0
  for (let i = 0; i < n; i++) if (rng() < p) k++
  return k
}

/** Gamma(shape, 1) by Marsaglia–Tsang (2000). */
export function rgamma(rng: Rng, shape: number): number {
  if (shape < 1) {
    const u = rng()
    return rgamma(rng, shape + 1) * Math.pow(u, 1 / shape)
  }
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  for (;;) {
    let x: number
    let v: number
    do {
      x = rnorm(rng)
      v = 1 + c * x
    } while (v <= 0)
    v = v * v * v
    const u = rng()
    if (u < 1 - 0.0331 * x * x * x * x) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

export function rbeta(rng: Rng, a: number, b: number): number {
  const x = rgamma(rng, a)
  const y = rgamma(rng, b)
  return x / (x + y)
}

/** Fisher–Yates shuffle (in place). */
export function shuffle<T>(rng: Rng, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function quantile(sorted: ArrayLike<number>, q: number): number {
  if (sorted.length === 0) return NaN
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export function mean(xs: ArrayLike<number>): number {
  let s = 0
  for (let i = 0; i < xs.length; i++) s += xs[i]
  return xs.length ? s / xs.length : NaN
}

export function sd(xs: ArrayLike<number>): number {
  const m = mean(xs)
  let s = 0
  for (let i = 0; i < xs.length; i++) s += (xs[i] - m) ** 2
  return xs.length > 1 ? Math.sqrt(s / (xs.length - 1)) : NaN
}
