import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { budgetsFor, defaultScope, type BudgetScope } from '@/domain/budgets'
import { CATEGORIES } from '@/domain/categories'
import type { Budgets } from '@/domain/types'
import { monthLong, ymOf } from '@/lib/dates'
import { parseAmount } from '@/lib/money'
import { notify } from '@/lib/notify'
import { useExpenseDispatch, useExpenseState } from '@/store/expense-store'
import { useView } from '@/store/view-store'
import { BudgetScopePicker } from './BudgetScopePicker'

/**
 * In-place category budgets for the month in view; submitted by the panel's
 * "Save budgets" button (form="budget-form").
 */
export function BudgetEditor({ onDone }: { onDone: () => void }) {
  const state = useExpenseState()
  const dispatch = useExpenseDispatch()
  const { ym, today } = useView()
  const budgets = budgetsFor(state, ym)
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, String(budgets[c.key])])) as Record<keyof Budgets, string>,
  )
  const [scope, setScope] = useState<BudgetScope>(defaultScope(ym === ymOf(today)))
  useEffect(() => document.getElementById(`b-${CATEGORIES[0].key}`)?.focus(), [])

  const save = (ev: FormEvent) => {
    ev.preventDefault()
    let bad = false
    const next = { ...budgets }
    for (const c of CATEGORIES) {
      const v = parseAmount(draft[c.key])
      if (v >= 0) next[c.key] = Math.round(v * 100) / 100
      else bad = true
    }
    const before = { budgets: state.budgets, monthBudgets: state.monthBudgets }
    dispatch({ type: 'setMonthBudgets', ym, budgets: next, scope })
    onDone()
    const where = scope === 'month' ? `${monthLong(ym)} budgets saved` : `Budgets saved from ${monthLong(ym)} on`
    notify(bad ? `${where} — blank or invalid amounts were left unchanged` : where, {
      label: 'Undo',
      onClick: () => dispatch({ type: 'restoreBudgetPlan', ...before }),
    })
  }

  return (
    <form id="budget-form" onSubmit={save}>
      <ul className="m-0 flex list-none flex-col p-0">
        {CATEGORIES.map((c) => (
          <li key={c.key} className="border-t border-border last:border-b">
            <label
              htmlFor={`b-${c.key}`}
              className="grid grid-cols-[auto_minmax(0,1fr)_128px] items-center gap-3 px-1 py-2.5"
            >
              <span className="code-chip" style={{ '--c': c.color } as CSSProperties}>
                {c.code}
              </span>
              <span className="font-semibold">{c.name}</span>
              <Input
                id={`b-${c.key}`}
                inputMode="decimal"
                value={draft[c.key]}
                onChange={(e) => setDraft((d) => ({ ...d, [c.key]: e.target.value }))}
                aria-label={`${c.name} budget for ${monthLong(ym)}`}
                className="h-[34px] rounded-[9px] px-2.5 text-right font-mono text-sm font-medium"
              />
            </label>
          </li>
        ))}
      </ul>
      <BudgetScopePicker ym={ym} value={scope} onChange={setScope} className="m-0 mt-3.5 border-0 p-0" />
    </form>
  )
}
