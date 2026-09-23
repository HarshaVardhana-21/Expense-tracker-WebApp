import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/domain/categories'
import { useMonthData } from '@/hooks/use-month-data'
import { formatMonth } from '@/lib/dates'
import { useView } from '@/store/view-store'
import { BudgetEditor } from './BudgetEditor'
import { MonthlyBudgetDialog } from './MonthlyBudgetDialog'
import { CategoryBudgetRow } from './CategoryBudgetRow'
import { ShareStrip } from './ShareStrip'

export function BudgetsPanel() {
  const { month: m, budgets } = useMonthData()
  const { filter, toggleFilter } = useView()
  const [editing, setEditing] = useState(false)

  const sorted = useMemo(
    () => CATEGORIES.slice().sort((a, b) => (m.byCat[b.key] || 0) - (m.byCat[a.key] || 0)),
    [m.byCat],
  )

  return (
    <aside aria-labelledby="cat-title">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="cat-title" className="m-0 font-display text-[22px] leading-[1.1] font-bold tracking-[-0.02em]">
          Budgets
          <span className="ml-2 font-mono text-[13px] font-medium tracking-normal text-muted-foreground">
            {formatMonth(m.ym)}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {!editing && (
            <MonthlyBudgetDialog
              trigger={
                <Button variant="outline" size="sm">
                  Set total
                </Button>
              }
            />
          )}
          <Button
            variant="outline"
            size="sm"
            form={editing ? 'budget-form' : undefined}
            type={editing ? 'submit' : 'button'}
            onClick={editing ? undefined : () => setEditing(true)}
          >
            {editing ? 'Save budgets' : 'Edit budgets'}
          </Button>
        </div>
      </div>

      <ShareStrip sorted={sorted} byCat={m.byCat} total={m.total} />

      {editing ? (
        // Keyed by month: switching months while editing starts over from that month's budgets.
        <BudgetEditor key={m.ym} onDone={() => setEditing(false)} />
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {sorted.map((c) => (
            <CategoryBudgetRow
              key={c.key}
              category={c}
              spent={m.byCat[c.key] || 0}
              budget={budgets[c.key] || 0}
              month={m}
              pressed={filter === c.key}
              onToggle={() => toggleFilter(c.key)}
            />
          ))}
        </ul>
      )}
    </aside>
  )
}
