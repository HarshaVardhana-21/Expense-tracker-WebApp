import { Button } from '@/components/ui/button'
import { monthStatus, paceOf, previousPeriodTotal, projectedTotal } from '@/domain/selectors'
import { MonthlyBudgetDialog } from '@/features/budgets/components/MonthlyBudgetDialog'
import { useMoney } from '@/hooks/use-money'
import { useMonthData } from '@/hooks/use-month-data'
import { daysInMonth, formatMonth, monthLong, monthShort, parseDate } from '@/lib/dates'
import { moneyParts } from '@/lib/money'
import { useExpenseState } from '@/store/expense-store'
import { BudgetMeter } from './BudgetMeter'
import { StatsRow } from './StatsRow'
import { StatusPill } from './StatusPill'

const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`

export function MonthSummary() {
  const { expenses, currency } = useExpenseState()
  const { month: m, budget } = useMonthData()
  const money = useMoney()

  const spent = m.total
  const left = budget - spent
  const pace = paceOf(m)
  const ratio = budget ? spent / budget : 0
  const daysLeft = m.days - m.elapsed
  const monthName = monthLong(m.ym)

  const avg = m.elapsed ? spent / m.elapsed : 0
  const proj = projectedTotal(m)
  const projDiff = budget - proj
  const lastDay = parseDate(`${m.ym}-01`)
  lastDay.setMonth(lastDay.getMonth() + 1, 0)
  const endLabel = lastDay.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  const prev = previousPeriodTotal(expenses, m)
  const prevShort = monthShort(prev.ym)
  const delta = prev.total > 0 ? ((spent - prev.total) / prev.total) * 100 : null

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="eyebrow">{m.isCurrent ? `Spent so far in ${monthName}` : `Spent in ${monthName}`}</span>
        <StatusPill status={monthStatus(m, budget)} />
        <MonthlyBudgetDialog
          trigger={
            <Button variant="outline" size="xs" className="ml-auto">
              Change budget
            </Button>
          }
        />
      </div>

      <p className="big-amount m-0 font-display text-[clamp(52px,8.5vw,88px)] leading-[0.92] font-extrabold tracking-[-0.045em] tabular-nums">
        {moneyParts(spent, currency).map((p, i) =>
          p.kind === 'plain' ? p.value : (
            <span key={i} className={p.kind}>
              {p.value}
            </span>
          ),
        )}
      </p>

      <p className="m-0 max-w-[36ch] text-base text-pretty text-ink-2 [&_strong]:font-[650] [&_strong]:text-foreground">
        of a <strong>{money(budget, { whole: true })}</strong> budget — <strong>{money(Math.abs(left))}</strong>{' '}
        {left >= 0
          ? `left${m.isCurrent ? `, ${plural(daysLeft, 'day')} to go` : ''}.`
          : `over${m.isCurrent ? ` with ${plural(daysLeft, 'day')} to go` : ''}.`}
      </p>

      <BudgetMeter
        ratio={ratio}
        over={spent > budget}
        pace={pace}
        showPace={m.isCurrent}
        dayLabel={`Day ${m.elapsed}`}
        maxLabel={money(budget, { whole: true })}
      />

      <StatsRow
        stats={[
          {
            label: 'Daily average',
            value: money(avg),
            note: `per day across ${plural(m.elapsed, 'day')}`,
          },
          {
            label: m.isCurrent ? `Projected by ${endLabel}` : 'Month total',
            value: money(proj, { whole: true }),
            note:
              projDiff >= 0
                ? `${money(projDiff, { whole: true })} under budget`
                : `${money(-projDiff, { whole: true })} over budget`,
            noteClassName: projDiff < 0 ? 'text-destructive' : undefined,
          },
          {
            label: m.isCurrent
              ? `vs ${prevShort} 1–${Math.min(m.elapsed, daysInMonth(prev.ym))}`
              : `vs ${formatMonth(prev.ym).split(' ')[0]}`,
            value:
              delta === null ? (
                '—'
              ) : (
                <span className={delta > 0 ? 'text-destructive' : 'text-good'}>
                  {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(0)}%
                </span>
              ),
            note:
              delta === null
                ? `No expenses recorded for ${prevShort}`
                : `${money(Math.abs(spent - prev.total), { whole: true })} ${delta > 0 ? 'more' : 'less'} than ${money(prev.total, { whole: true })}`,
          },
        ]}
      />
    </div>
  )
}
