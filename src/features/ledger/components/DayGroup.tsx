import type { Expense } from '@/domain/types'
import { useMoney } from '@/hooks/use-money'
import { parseDate, toIso } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { useView } from '@/store/view-store'
import { LedgerRow } from './LedgerRow'

interface DayGroupProps {
  date: string
  items: Expense[]
  first: boolean
  last: boolean
  onOpen: (e: Expense) => void
}

export function DayGroup({ date, items, first, last, onOpen }: DayGroupProps) {
  const { today } = useView()
  const money = useMoney()
  const d = parseDate(date)
  const yesterday = toIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))
  const name =
    date === toIso(today) ? 'Today' : date === yesterday ? 'Yesterday' : d.toLocaleDateString('en-GB', { weekday: 'long' })
  const dayTotal = items.reduce((a, e) => a + e.amount, 0)

  return (
    <div>
      <div
        className={cn(
          'relative flex items-baseline justify-between gap-3 pt-4 pr-[18px] pb-2 pl-[82px] max-[560px]:pl-[62px]',
          first && 'pt-[18px]',
        )}
      >
        <span className="absolute top-3.5 left-0 w-[62px] text-center font-display text-[22px] leading-none font-bold tracking-[-0.03em] max-[560px]:w-12 max-[560px]:text-[19px]">
          {d.getDate()}
          <small className="mt-0.5 block font-mono text-[10px] leading-[1.4] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            {d.toLocaleDateString('en-GB', { month: 'short' })}
          </small>
        </span>
        <span className="text-[13px] font-semibold text-ink-2">{name}</span>
        <span className="font-mono text-[13px] font-medium text-muted-foreground tabular-nums">{money(dayTotal)}</span>
      </div>
      {items.map((e, i) => (
        <LedgerRow key={e.id} expense={e} lastRow={last && i === items.length - 1} onOpen={onOpen} />
      ))}
    </div>
  )
}
