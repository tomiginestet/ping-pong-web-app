export function Sparkline({ values, color = 'var(--accent)', height = 56 }: { values: number[]; color?: string; height?: number }) {
  if (values.length < 2) return null
  const w = 300
  const h = height
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 4
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, pad + (1 - (v - min) / range) * (h - pad * 2)] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={`ELO: de ${values[0]} a ${values[values.length - 1]}`}>
      <path d={area} fill={color} opacity={0.15} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={4} fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
