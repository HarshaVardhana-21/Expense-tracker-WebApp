import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { AmountField } from '@/components/form/AmountField'
import { CloseIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { budgetsFor, defaultScope, scaleBudgets, type BudgetScope } from '@/domain/budgets'
import { CATEGORIES } from '@/domain/categories'
import { totalBudget } from '@/domain/selectors'
import { formatMonth, monthLong, shiftYm, ymOf } from '@/lib/dates'
import { currencySymbol, formatMoney, parseAmount } from '@/lib/money'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import { useExpenseDispatch, useExpenseState } from '@/store/expense-store'
import { useView } from '@/store/view-store'
import { BudgetScopePicker } from './BudgetScopePicker'

const AMOUNT_ID = 'budget-total'

/** Set the month-in-view's total budget in one number; categories keep their share of it. */
export function MonthlyBudgetDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          const input = document.getElementById(AMOUNT_ID) as HTMLInputElement | null
          input?.focus()
          input?.select()
        }}
        className="max-h-[calc(100dvh-32px)] w-[min(520px,calc(100vw-32px))]"
      >
        {/* Mounted fresh on every open, so it always starts from the month's current budget. */}
        <BudgetForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function BudgetForm({ onDone }: { onDone: () => void }) {
  const state = useExpenseState()
  const { currency } = state
  const dispatch = useExpenseDispatch()
  const { ym, today } = useView()

  const budgets = budgetsFor(state, ym)
  const current = totalBudget(budgets)
  const prevYm = shiftYm(ym, -1)
  const previous = totalBudget(budgetsFor(state, prevYm))

  const [value, setValue] = useState(String(current))
  const [scope, setScope] = useState<BudgetScope>(defaultScope(ym === ymOf(today)))
  const [error, setError] = useState<string | null>(null)

  const money = (n: number, whole = true) => formatMoney(n, currency, { whole })
  const parsed = parseAmount(value)
  const valid = parsed > 0
  const preview = valid ? scaleBudgets(budgets, parsed) : budgets
  const month = monthLong(ym)

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    if (!valid) {
      setError('Enter a monthly budget greater than zero.')
      document.getElementById(AMOUNT_ID)?.focus()
      return
    }
    const before = { budgets: state.budgets, monthBudgets: state.monthBudgets }
    dispatch({ type: 'setMonthBudgets', ym, budgets: scaleBudgets(budgets, parsed), scope })
    onDone()
    notify(`${scope === 'month' ? `${month} budget` : `Budget from ${month}`} set to ${money(parsed, false)}`, {
      label: 'Undo',
      onClick: () => dispatch({ type: 'restoreBudgetPlan', ...before }),
    })
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      className="receipt-edge max-h-[calc(100dvh-32px)] overflow-auto rounded-t-2xl bg-card px-6 pt-[22px] pb-10 max-[560px]:px-[18px]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-input pb-3.5">
        <div>
          <div className="eyebrow">
            Budget · {formatMonth(ym)} · {currency}
          </div>
          <DialogTitle className="mt-1.5 mb-0 font-display text-[26px] leading-[1.05] font-[750] tracking-[-0.025em]">
            Set {month}’s budget
          </DialogTitle>
        </div>
        <DialogClose asChild>
          <Button type="button" variant="subtle" size="icon" aria-label="Close">
            <CloseIcon />
          </Button>
        </DialogClose>
      </div>

      <AmountField
        id={AMOUNT_ID}
        label={`${month} budget`}
        symbol={currencySymbol(currency)}
        value={value}
        placeholder="0"
        onChange={(v) => {
          setValue(v)
          setError(null)
        }}
      />

      <DialogDescription className="mt-3 mb-0 text-[13.5px] text-ink-2">
        Currently {money(current)} · {monthLong(prevYm)} was {money(previous)}. Each category keeps its share of the new
        total — fine-tune them with <strong className="font-semibold text-foreground">Edit budgets</strong>.
      </DialogDescription>

      {error && (
        <p role="alert" className="mt-3 mb-0 text-[13.5px] font-medium text-destructive">
          {error}
        </p>
      )}

      <BudgetScopePicker ym={ym} value={scope} onChange={setScope} />

      <div className="mt-4">
        <div className="eyebrow mb-1.5">How it splits</div>
        <ul aria-label="Category budgets after this change" className="m-0 list-none p-0">
          {CATEGORIES.map((c) => {
            const from = budgets[c.key] || 0
            const to = preview[c.key] || 0
            const changed = valid && to !== from
            return (
              <li
                key={c.key}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-ledger py-1.5 first:border-t-0"
              >
                <span className="code-chip" style={{ '--c': c.color } as CSSProperties}>
                  {c.code}
                </span>
                <span className="text-[13.5px] font-semibold">{c.name}</span>
                <span className="text-right font-mono text-[13px] whitespace-nowrap tabular-nums">
                  {changed && <span className="mr-1.5 text-muted-foreground line-through">{money(from)}</span>}
                  <b className={cn('font-semibold', !changed && 'text-ink-2')}>{money(to)}</b>
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="mt-3.5 flex justify-between font-mono text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">
        <span>New {month} total</span>
        <span className="tabular-nums">{valid ? money(parsed, false) : '—'}</span>
      </div>

      <div className="mt-[22px] flex items-center justify-end gap-2.5 border-t border-dashed border-input pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Save budget</Button>
      </div>
    </form>
  )
}
