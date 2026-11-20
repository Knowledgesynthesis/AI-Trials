import { useId } from 'react'

export interface ForestRow {
  label: string
  est: number
  lo: number
  hi: number
  emphasis?: 'flag' | 'overall'
  note?: string
}

export interface RefLine {
  x: number
  label: string
  color: string
  dashed?: boolean
}

/**
 * Minimal, dependency-free forest plot. Points are ≥ 8px with a surface ring; CI lines 2px;
 * a hover title on each row carries the exact numbers (keyboard users get them via the table text).
 */
export function ForestPlot({
  rows,
  domain,
  log = false,
  refLines = [],
  ticks,
  tickFormat = (v: number) => String(v),
  xLabel,
  labelWidth = 150,
  shade,
}: {
  rows: ForestRow[]
  domain: [number, number]
  log?: boolean
  refLines?: RefLine[]
  ticks: number[]
  tickFormat?: (v: number) => string
  xLabel?: string
  labelWidth?: number
  shade?: { from: number; to: number; color: string; label?: string }
}) {
  const id = useId()
  const rowH = 26
  const top = 10
  const width = 640
  const plotW = width - labelWidth - 16
  const height = top + rows.length * rowH + 44
  const tf = (v: number) => (log ? Math.log(v) : v)
  const [d0, d1] = [tf(domain[0]), tf(domain[1])]
  const x = (v: number) => labelWidth + ((Math.min(Math.max(tf(v), d0), d1) - d0) / (d1 - d0)) * plotW
  const plotBottom = top + rows.length * rowH

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-labelledby={`${id}-t`}>
      <title id={`${id}-t`}>Forest plot with {rows.length} rows</title>
      {shade && (
        <rect
          x={Math.min(x(shade.from), x(shade.to))}
          y={top - 4}
          width={Math.abs(x(shade.to) - x(shade.from))}
          height={plotBottom - top + 8}
          fill={shade.color}
        />
      )}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top - 4} y2={plotBottom + 4} stroke="var(--grid)" strokeWidth={1} />
          <text x={x(t)} y={plotBottom + 18} textAnchor="middle" fontSize={11} fill="var(--axis-text)">
            {tickFormat(t)}
          </text>
        </g>
      ))}
      {refLines.map((r) => (
        <g key={r.label}>
          <line
            x1={x(r.x)}
            x2={x(r.x)}
            y1={top - 6}
            y2={plotBottom + 4}
            stroke={r.color}
            strokeWidth={1.5}
            strokeDasharray={r.dashed ? '4 3' : undefined}
          />
        </g>
      ))}
      {rows.map((r, i) => {
        const cy = top + i * rowH + rowH / 2
        const color = r.emphasis === 'flag' ? 'var(--series-2)' : r.emphasis === 'overall' ? 'var(--ink)' : 'var(--series-1)'
        return (
          <g key={`${r.label}-${i}`}>
            <title>{`${r.label}: ${tickFormat(r.est)} (95% CI ${tickFormat(r.lo)} to ${tickFormat(r.hi)})${r.note ? ` — ${r.note}` : ''}`}</title>
            <rect x={0} y={cy - rowH / 2} width={width} height={rowH} fill="transparent" />
            <text
              x={labelWidth - 10}
              y={cy + 4}
              textAnchor="end"
              fontSize={12}
              fill={r.emphasis === 'overall' ? 'var(--ink)' : 'var(--ink-2)'}
              fontWeight={r.emphasis === 'overall' ? 650 : 400}
            >
              {r.label}
            </text>
            <line x1={x(r.lo)} x2={x(r.hi)} y1={cy} y2={cy} stroke={color} strokeWidth={2} strokeLinecap="round" />
            {r.emphasis === 'overall' ? (
              <path
                d={`M ${x(r.est)} ${cy - 7} L ${x(r.est) + 7} ${cy} L ${x(r.est)} ${cy + 7} L ${x(r.est) - 7} ${cy} Z`}
                fill={color}
                stroke="var(--surface)"
                strokeWidth={2}
              />
            ) : (
              <circle cx={x(r.est)} cy={cy} r={5} fill={color} stroke="var(--surface)" strokeWidth={2} />
            )}
          </g>
        )
      })}
      {xLabel && (
        <text x={labelWidth + plotW / 2} y={height - 6} textAnchor="middle" fontSize={11} fill="var(--axis-text)">
          {xLabel}
        </text>
      )}
    </svg>
  )
}
