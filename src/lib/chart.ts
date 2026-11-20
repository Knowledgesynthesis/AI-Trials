/** Shared chart styling: hairline solid grid, recessive axes, text tokens for all text. */
export const axisProps = {
  stroke: 'var(--axis)',
  tickLine: false,
  tick: { fill: 'var(--axis-text)', fontSize: 12 },
} as const

export const gridProps = {
  stroke: 'var(--grid)',
  vertical: false,
} as const

export const SERIES = {
  s1: 'var(--series-1)',
  s2: 'var(--series-2)',
  s3: 'var(--series-3)',
  w1: 'var(--series-1-wash)',
  w2: 'var(--series-2-wash)',
  w3: 'var(--series-3-wash)',
  ink: 'var(--ink-2)',
  muted: 'var(--axis)',
} as const


/** Clean axis ticks from 0 to ≥ max using steps of 1, 2, 2.5 or 5 × 10^k. */
export function niceTicks(max: number, count = 5): number[] {
  if (!(max > 0)) return [0, 1]
  const raw = max / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag
  const ticks: number[] = []
  for (let v = 0; v < max + step * 0.999; v += step) ticks.push(+v.toPrecision(12))
  return ticks
}
