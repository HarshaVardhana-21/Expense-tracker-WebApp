import type { CSSProperties } from 'react'
import { categoryOf } from '@/domain/categories'
import type { Expense } from '@/domain/types'
import { useMoney } from '@/hooks/use-money'
import { cn } from '@/lib/utils'

interface LedgerRowProps {
  expense: Expense
  lastRow: boolean
  onOpen: (e: Expense) => void
}

export function LedgerRow({ expense: e, lastRow, onOpen }: LedgerRowProps) {
  const money = useMoney()
  const c = categoryOf(e.cat)

  return (
    <button
      type="button"
      onClick={() => onOpen(e)}
      aria-label={`Edit ${e.note}, ${money(e.amount)}`}
      className={cn(
        'grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-0 border-b border-ledger bg-transparent py-2.5 pr-[18px] pl-[82px] text-left',
        'hover:bg-[color-mix(in_srgb,var(--primary)_5%,transparent)]',
        'max-[560px]:gap-2.5 max-[560px]:pr-3.5 max-[560px]:pl-[62px]',
        lastRow && 'border-b-0',
      )}
    >
      <span className="code-chip max-[560px]:min-w-[34px] max-[560px]:px-1" style={{ '--c': c.color } as CSSProperties}>
        {c.code}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">{e.note}</span>
        <span className="text-[12.5px] text-muted-foreground">
          {c.name} · {e.method}
          {e.sample ? ' · example' : ''}
        </span>
      </span>
      <span className="font-mono text-[15px] font-medium tracking-[-0.02em] tabular-nums">{money(e.amount)}</span>
    </button>
  )
}
