import { cn } from '@/lib/utils'

interface BudgetMeterProps {
  /** spent / budget */
  ratio: number
  over: boolean
  /** share of the month elapsed; the marker only shows for the current month */
  pace: number
  showPace: boolean
  dayLabel: string
  maxLabel: string
}

export function BudgetMeter({ ratio, over, pace, showPace, dayLabel, maxLabel }: BudgetMeterProps) {
  // Keep the "Day N" label inside the meter near either edge.
  const labelShift = pace > 0.85 ? 'translateX(-100%)' : pace < 0.15 ? 'translateX(0)' : 'translateX(-50%)'

  return (
    <div className="relative pt-[22px]">
      <div className="relative h-3.5 overflow-hidden rounded-full border border-border bg-secondary">
        <div
          className={cn(
            'h-full rounded-full bg-primary transition-[width] duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)]',
            over && 'bg-destructive',
          )}
          style={{ width: `${Math.min(100, ratio * 100)}%` }}
        />
      </div>
      {showPace && (
        <div className="absolute top-0 -bottom-1.5 w-0 border-l-2 border-foreground" style={{ left: `${pace * 100}%` }}>
          <span
            className="absolute top-0 font-mono text-[10.5px] leading-none font-semibold tracking-[0.06em] whitespace-nowrap text-foreground uppercase"
            style={{ transform: labelShift }}
          >
            {dayLabel}
          </span>
        </div>
      )}
      <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
        <span className="tabular-nums">0</span>
        <span className="tabular-nums">{maxLabel}</span>
      </div>
    </div>
  )
}
