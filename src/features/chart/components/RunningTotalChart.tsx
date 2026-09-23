import { useId, useMemo, useRef, useState, type PointerEvent } from 'react'
import { niceStep, projectedTotal } from '@/domain/selectors'
import { useMoney } from '@/hooks/use-money'
import { useMonthData } from '@/hooks/use-month-data'
import { formatMonth, pad, parseDate } from '@/lib/dates'
import { ChartTooltip } from './ChartTooltip'

const W = 720
const H = 250
const L = 58
const R = 18
const T = 16
const B = 30

export function RunningTotalChart() {
  const { month: m, budget } = useMonthData()
  const money = useMoney()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverDay, setHoverDay] = useState<number | null>(null)
  const gradientId = `ga${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  const shown = m.elapsed
  const cum = m.cumulative
  const spentNow = shown ? cum[shown - 1] : 0
  const proj = projectedTotal(m) || spentNow
  const showProjection = m.isCurrent && shown > 0 && shown < m.days

  const scale = useMemo(() => {
    const maxV = Math.max(budget, spentNow, m.isCurrent ? proj : 0, 1) * 1.04
    const step = niceStep(maxV / 4)
    const top = Math.ceil(maxV / step) * step
    const x = (d: number) => L + (d / m.days) * (W - L - R)
    const y = (v: number) => T + (1 - v / top) * (H - T - B)
    const ticks: number[] = []
    for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v)
    return { x, y, ticks }
  }, [budget, spentNow, proj, m.isCurrent, m.days])
  const { x, y } = scale

  const dayTicks = [1, 8, 15, 22, m.days].filter((d, i, a) => a.indexOf(d) === i && (d === m.days || m.days - d > 3))

  let line = ''
  if (shown) {
    line = `M${x(0)},${y(0)}`
    for (let d = 1; d <= shown; d++) line += ` L${x(d)},${y(cum[d - 1])}`
  }

  const onMove = (ev: PointerEvent) => {
    const svg = svgRef.current
    if (!svg || !shown) return
    const rect = svg.getBoundingClientRect()
    const px = ((ev.clientX - rect.left) / rect.width) * W
    setHoverDay(Math.max(1, Math.min(shown, Math.ceil(((px - L) / (W - L - R)) * m.days))))
  }

  const hover =
    hoverDay && hoverDay <= shown
      ? {
          x: x(hoverDay),
          y: y(cum[hoverDay - 1]),
          date: parseDate(`${m.ym}-${pad(hoverDay)}`).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }),
          daySpend: m.daily[hoverDay - 1],
          toDate: cum[hoverDay - 1],
        }
      : null

  return (
    <div className="rounded-[18px] border border-border bg-card px-[18px] pt-[18px] pb-2.5 shadow-lift">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="m-0 font-display text-base font-[650] tracking-[-0.01em]">Running total</h2>
        <div className="flex flex-wrap gap-3.5 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-0 w-4 border-t-2 border-primary" />
            Spent
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-0 w-4 border-t-2 border-dashed border-muted-foreground" />
            Budget pace
          </span>
          {showProjection && (
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-0 w-4 border-t-2 border-dotted border-primary" />
              Projection
            </span>
          )}
        </div>
      </div>

      <div className="relative" onPointerMove={onMove} onPointerLeave={() => setHoverDay(null)}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Cumulative spending for ${formatMonth(m.ym)}: ${money(spentNow)} of a ${money(budget)} budget.`}
          className="block h-auto w-full overflow-visible"
        >
          {scale.ticks.map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} style={{ stroke: 'var(--border)' }} strokeWidth="1" />
              <text className="chart-axis" x={L - 10} y={y(v) + 4} textAnchor="end">
                {money(v, { compact: true })}
              </text>
            </g>
          ))}
          {dayTicks.map((d) => (
            <text key={d} className="chart-axis" x={x(d - 0.5)} y={H - 8} textAnchor="middle">
              {d}
            </text>
          ))}

          <line
            x1={L}
            x2={W - R}
            y1={y(budget)}
            y2={y(budget)}
            style={{ stroke: 'var(--ink-2)' }}
            strokeWidth="1"
            strokeDasharray="1 3"
          />
          <text className="chart-axis" x={W - R} y={y(budget) - 6} textAnchor="end" style={{ fill: 'var(--ink-2)' }}>
            Budget {money(budget, { compact: true })}
          </text>
          <line
            x1={x(0)}
            y1={y(0)}
            x2={x(m.days)}
            y2={y(budget)}
            style={{ stroke: 'var(--muted-foreground)' }}
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />

          {shown > 0 && (
            <>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style={{ stopColor: 'var(--primary)', stopOpacity: 0.26 }} />
                  <stop offset="1" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path d={`${line} L${x(shown)},${y(0)} Z`} style={{ fill: `url(#${gradientId})` }} />
              <path
                d={line}
                style={{ fill: 'none', stroke: 'var(--primary)' }}
                strokeWidth="2.4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {showProjection && (
                <>
                  <line
                    x1={x(shown)}
                    y1={y(spentNow)}
                    x2={x(m.days)}
                    y2={y(proj)}
                    style={{ stroke: 'var(--primary)' }}
                    strokeWidth="2"
                    strokeDasharray="1.5 4"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={x(m.days)}
                    cy={y(proj)}
                    r="3.5"
                    style={{ fill: 'var(--card)', stroke: 'var(--primary)' }}
                    strokeWidth="1.5"
                  />
                </>
              )}
              <circle cx={x(shown)} cy={y(spentNow)} r="8" style={{ fill: 'var(--primary)', opacity: 0.18 }} />
              <circle
                cx={x(shown)}
                cy={y(spentNow)}
                r="4.5"
                style={{ fill: 'var(--primary)', stroke: 'var(--card)' }}
                strokeWidth="2"
              />
            </>
          )}

          {hover && (
            <g>
              <line x1={hover.x} x2={hover.x} y1={T} y2={H - B} style={{ stroke: 'var(--ink-2)' }} strokeWidth="1" />
              <circle cx={hover.x} cy={hover.y} r="4" style={{ fill: 'var(--card)', stroke: 'var(--foreground)' }} strokeWidth="2" />
            </g>
          )}
          <rect x={L} y={T} width={W - L - R} height={H - T - B} style={{ fill: 'transparent' }} />
        </svg>

        {hover && (
          <ChartTooltip
            leftPct={Math.max(14, Math.min(86, (hover.x / W) * 100))}
            topPct={(hover.y / H) * 100}
            title={hover.date.toUpperCase()}
            daySpend={money(hover.daySpend)}
            toDate={money(hover.toDate)}
          />
        )}
      </div>
    </div>
  )
}
