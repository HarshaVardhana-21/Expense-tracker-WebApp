import { useMemo } from 'react'
import { CATEGORY_BY_KEY } from '@/domain/categories'
import { ledgerGroups } from '@/domain/selectors'
import { useMoney } from '@/hooks/use-money'
import { useMonthData } from '@/hooks/use-month-data'
import { formatMonth } from '@/lib/dates'
import { useView } from '@/store/view-store'
import { CategoryChips } from './CategoryChips'
import { DayGroup } from './DayGroup'
import { EmptyState } from './EmptyState'
import { LedgerSearch } from './LedgerSearch'

export function Ledger() {
  const { month: m } = useMonthData()
  const { filter, query, openSheet } = useView()
  const money = useMoney()

  const { rows, groups } = useMemo(
    () => ledgerGroups(m.list, filter, query, (k) => CATEGORY_BY_KEY[k].name),
    [m.list, filter, query],
  )
  const sum = rows.reduce((a, e) => a + e.amount, 0)
  const filtered = query.trim() !== '' || filter !== 'all'

  return (
    <section aria-labelledby="ledger-title">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="ledger-title" className="m-0 font-display text-[22px] leading-[1.1] font-bold tracking-[-0.02em]">
          Ledger
          <span className="ml-2 font-mono text-[13px] font-medium tracking-normal text-muted-foreground">
            {rows.length} {rows.length === 1 ? 'entry' : 'entries'} · {money(sum)}
          </span>
        </h2>
      </div>
      <div className="mb-3 flex flex-wrap gap-2.5">
        <LedgerSearch />
      </div>
      <CategoryChips byCat={m.byCat} />

      <div className="ledger-page relative overflow-hidden rounded-[18px] border border-border bg-card shadow-lift">
        {groups.length === 0 ? (
          <EmptyState filtered={filtered} monthLabel={formatMonth(m.ym)} />
        ) : (
          groups.map((g, i) => (
            <DayGroup
              key={g.date}
              date={g.date}
              items={g.items}
              first={i === 0}
              last={i === groups.length - 1}
              onOpen={openSheet}
            />
          ))
        )}
      </div>
    </section>
  )
}
