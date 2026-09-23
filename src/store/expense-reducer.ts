import { applyMonthBudgets, type BudgetScope } from '@/domain/budgets'
import type { AppState, Budgets, Currency, Expense } from '@/domain/types'

export type ExpenseAction =
  | { type: 'add'; expense: Expense }
  | { type: 'update'; id: string; changes: Partial<Omit<Expense, 'id'>> }
  | { type: 'remove'; id: string }
  /** Put a removed expense back at its original position (undo). */
  | { type: 'restore'; expense: Expense; index: number }
  | { type: 'clearSamples' }
  | { type: 'replaceExpenses'; expenses: Expense[] }
  | { type: 'setCurrency'; currency: Currency }
  /** Merge into the base budget (months before any month-specific budget). */
  | { type: 'setBudgets'; budgets: Partial<Budgets> }
  /** Set one month's category budgets, for that month only or carried onward. */
  | { type: 'setMonthBudgets'; ym: string; budgets: Budgets; scope: BudgetScope }
  /** Replace the whole budget plan (undo). */
  | { type: 'restoreBudgetPlan'; budgets: Budgets; monthBudgets: Record<string, Budgets> }

export function expenseReducer(state: AppState, action: ExpenseAction): AppState {
  switch (action.type) {
    case 'add':
      return { ...state, expenses: [...state.expenses, action.expense] }
    case 'update':
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.id ? { ...e, ...action.changes } : e)),
      }
    case 'remove':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) }
    case 'restore': {
      const expenses = state.expenses.slice()
      expenses.splice(Math.min(action.index, expenses.length), 0, action.expense)
      return { ...state, expenses }
    }
    case 'clearSamples':
      return { ...state, expenses: state.expenses.filter((e) => !e.sample) }
    case 'replaceExpenses':
      return { ...state, expenses: action.expenses }
    case 'setCurrency':
      return { ...state, currency: action.currency }
    case 'setBudgets':
      return { ...state, budgets: { ...state.budgets, ...action.budgets } }
    case 'setMonthBudgets':
      return { ...state, ...applyMonthBudgets(state, action.ym, action.budgets, action.scope) }
    case 'restoreBudgetPlan':
      return { ...state, budgets: action.budgets, monthBudgets: action.monthBudgets }
  }
}
