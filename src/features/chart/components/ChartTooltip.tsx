interface ChartTooltipProps {
  leftPct: number
  topPct: number
  title: string
  daySpend: string
  toDate: string
}

export function ChartTooltip({ leftPct, topPct, title, daySpend, toDate }: ChartTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 translate-y-[calc(-100%-14px)] rounded-[10px] bg-foreground px-2.5 py-2 text-[12.5px] leading-[1.35] whitespace-nowrap text-background shadow-lift"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
    >
      <b className="mb-0.5 block font-mono text-xs font-semibold tracking-[0.04em] opacity-75">{title}</b>
      That day <span className="font-mono tabular-nums">{daySpend}</span>
      <br />
      Month to date <span className="font-mono tabular-nums">{toDate}</span>
    </div>
  )
}
