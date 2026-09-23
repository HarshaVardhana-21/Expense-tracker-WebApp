import { useMemo } from 'react'
import { budgetsFor } from '@/domain/budgets'
import { monthData, totalBudget } from '@/domain/selectors'
import { useExpenseState } from '@/store/expense-store'
import { useView } from '@/store/view-store'

/** Derived figures for the month in view, including that month's own budgets. */
export function useMonthData() {
  const state = useExpenseState()
  const { expenses } = state
  const { ym, today } = useView()
  const month = useMemo(() => monthData(expenses, ym, today), [expenses, ym, today])
  const budgets = budgetsFor(state, ym)
  const budget = useMemo(() => totalBudget(budgets), [budgets])
  return { month, budgets, budget }
}
