import { useMemo } from 'react'
import { monthData, totalBudget } from '@/domain/selectors'
import { useExpenseState } from '@/store/expense-store'
import { useView } from '@/store/view-store'

/** Derived figures for the month in view. */
export function useMonthData() {
  const { expenses, budgets } = useExpenseState()
  const { ym, today } = useView()
  const month = useMemo(() => monthData(expenses, ym, today), [expenses, ym, today])
  const budget = useMemo(() => totalBudget(budgets), [budgets])
  return { month, budget }
}
