const SPAN = 50
const SWEEP = 70 // degrees either side of centre
const CX = 160
const CY = 170
const R = 140

export type TuneState = 'idle' | 'flat' | 'sharp' | 'close' | 'in-tune'

export function tuneState(cents: number | null): TuneState {
  if (cents === null) return 'idle'
  const off = Math.abs(cents)
  if (off <= 5) return 'in-tune'
  if (off <= 15) return 'close'
  return cents < 0 ? 'flat' : 'sharp'
}

function polar(deg: number, radius: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)]
}

function arc(from: number, to: number, radius: number): string {
  const [x1, y1] = polar(from, radius)
  const [x2, y2] = polar(to, radius)
  return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`
}

const ticks = Array.from({ length: 21 }, (_, i) => (i - 10) * 5)

export function Gauge({ cents }: { cents: number | null }) {
  const clamped = cents === null ? 0 : Math.max(-SPAN, Math.min(SPAN, cents))
  const angle = (clamped / SPAN) * SWEEP
  const zone = (5 / SPAN) * SWEEP
  return (
    <svg className={`gauge gauge--${tuneState(cents)}`} viewBox="0 0 320 190" role="img" aria-label={cents === null ? 'No pitch' : `${cents.toFixed(0)} cents`}>
      <defs>
        <linearGradient id="gauge-heat" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--bad)' }} />
          <stop offset="0.32" style={{ stopColor: 'var(--warn)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--good)' }} />
          <stop offset="0.68" style={{ stopColor: 'var(--warn)' }} />
          <stop offset="1" style={{ stopColor: 'var(--bad)' }} />
        </linearGradient>
      </defs>
      <path className="gauge__track" d={arc(-SWEEP, SWEEP, R)} />
      <path className="gauge__heat" d={arc(-SWEEP, SWEEP, R)} stroke="url(#gauge-heat)" />
      <path className="gauge__zone" d={arc(-zone, zone, R)} />
      {ticks.map((t) => {
        const deg = (t / SPAN) * SWEEP
        const major = t % 25 === 0
        const [x1, y1] = polar(deg, R - (major ? 22 : 12))
        const [x2, y2] = polar(deg, R - 4)
        return <line key={t} className={major ? 'gauge__tick gauge__tick--major' : 'gauge__tick'} x1={x1} y1={y1} x2={x2} y2={y2} />
      })}
      {[-50, -25, 0, 25, 50].map((t) => {
        const [x, y] = polar((t / SPAN) * SWEEP, R + 16)
        return (
          <text key={t} className="gauge__label" x={x} y={y} textAnchor="middle" dominantBaseline="middle">
            {t > 0 ? `+${t}` : t}
          </text>
        )
      })}
      <g className="gauge__needle" style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
        <line x1={CX} y1={CY} x2={CX} y2={CY - R + 6} />
      </g>
      <circle className="gauge__hub" cx={CX} cy={CY} r={9} />
    </svg>
  )
}
