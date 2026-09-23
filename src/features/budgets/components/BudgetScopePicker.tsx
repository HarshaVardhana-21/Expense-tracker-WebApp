import { budgetsFor, laterMonthsWithBudgets, type BudgetScope } from '@/domain/budgets'
import { totalBudget } from '@/domain/selectors'
import { RadioGroup, RadioGroupTile } from '@/components/ui/radio-group'
import { monthLong, monthShort, shiftYm } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { useExpenseState } from '@/store/expense-store'

interface BudgetScopePickerProps {
  ym: string
  value: BudgetScope
  onChange: (scope: BudgetScope) => void
  className?: string
}

export function BudgetScopePicker({ ym, value, onChange, className }: BudgetScopePickerProps) {
  const state = useExpenseState()
  const month = monthLong(ym)
  const next = shiftYm(ym, 1)
  const nextTotal = totalBudget(budgetsFor(state, next))
  const later = laterMonthsWithBudgets(state, ym)

  const hint =
    value === 'month'
      ? `${monthShort(next)} and later keep ${formatMoney(nextTotal, state.currency, { whole: true })} a month.`
      : later.length > 0
        ? `Carries into later months, replacing the ${later.length === 1 ? 'budget' : 'budgets'} set for ${later.map(monthShort).join(', ')}.`
        : 'Carries into the following months until you change it again.'

  const tile =
    'flex flex-col items-start gap-[3px] rounded-[10px] border border-border bg-transparent px-3 py-2 text-left text-[13px] leading-[1.25] font-semibold ' +
    'data-[state=checked]:border-primary data-[state=checked]:bg-primary-soft data-[state=checked]:shadow-[inset_0_0_0_1px_var(--primary)]'

  return (
    <fieldset className={className ?? 'm-0 mt-4 border-0 p-0'}>
      <legend className="eyebrow mb-2 p-0">Apply to</legend>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as BudgetScope)}
        aria-label="Apply budget to"
        className="grid grid-cols-2 gap-1.5"
      >
        <RadioGroupTile value="month" className={tile}>
          Only {month}
          <span className="text-xs font-normal text-muted-foreground">Other months unchanged</span>
        </RadioGroupTile>
        <RadioGroupTile value="onward" className={tile}>
          {month} onward
          <span className="text-xs font-normal text-muted-foreground">This and later months</span>
        </RadioGroupTile>
      </RadioGroup>
      <p className="mt-2 mb-0 text-[12.5px] text-muted-foreground">{hint}</p>
    </fieldset>
  )
}
