import { defaultBudgets } from '@/domain/categories'
import type { AppState, Expense } from '@/domain/types'
import { expenseReducer } from '@/store/expense-reducer'

const e = (id: string, extra: Partial<Expense> = {}): Expense => ({
  id,
  amount: 10,
  cat: 'dining',
  date: '2026-09-01',
  note: id,
  method: 'Card',
  ...extra,
})

const base = (): AppState => ({
  currency: 'USD',
  budgets: defaultBudgets('USD'),
  monthBudgets: {},
  expenses: [e('a', { sample: true }), e('b'), e('c', { sample: true })],
})

describe('expenseReducer', () => {
  it('adds, updates and removes', () => {
    let s = expenseReducer(base(), { type: 'add', expense: e('d') })
    expect(s.expenses.map((x) => x.id)).toEqual(['a', 'b', 'c', 'd'])
    s = expenseReducer(s, { type: 'update', id: 'b', changes: { amount: 99 } })
    expect(s.expenses[1].amount).toBe(99)
    s = expenseReducer(s, { type: 'remove', id: 'a' })
    expect(s.expenses.map((x) => x.id)).toEqual(['b', 'c', 'd'])
  })

  it('restores a removed expense at its original position', () => {
    const start = base()
    const removed = start.expenses[1]
    const s1 = expenseReducer(start, { type: 'remove', id: 'b' })
    const s2 = expenseReducer(s1, { type: 'restore', expense: removed, index: 1 })
    expect(s2.expenses.map((x) => x.id)).toEqual(['a', 'b', 'c'])
  })

  it('clears only example rows', () => {
    const s = expenseReducer(base(), { type: 'clearSamples' })
    expect(s.expenses.map((x) => x.id)).toEqual(['b'])
  })

  it('merges budgets and switches currency without touching amounts', () => {
    let s = expenseReducer(base(), { type: 'setBudgets', budgets: { dining: 500 } })
    expect(s.budgets.dining).toBe(500)
    expect(s.budgets.groceries).toBe(450)
    s = expenseReducer(s, { type: 'setCurrency', currency: 'EUR' })
    expect(s.currency).toBe('EUR')
    expect(s.expenses[0].amount).toBe(10)
  })

  it('sets a month budget and undoes it by restoring the plan', () => {
    const start = base()
    const sep = { ...start.budgets, dining: 999 }
    const s1 = expenseReducer(start, { type: 'setMonthBudgets', ym: '2026-09', budgets: sep, scope: 'onward' })
    expect(s1.monthBudgets['2026-09'].dining).toBe(999)
    expect(s1.budgets).toEqual(start.budgets)

    const s2 = expenseReducer(s1, { type: 'restoreBudgetPlan', budgets: start.budgets, monthBudgets: start.monthBudgets })
    expect(s2.monthBudgets).toEqual({})
  })

  it('does not mutate the previous state', () => {
    const start = base()
    const snapshot = JSON.stringify(start)
    expenseReducer(start, { type: 'remove', id: 'a' })
    expenseReducer(start, { type: 'update', id: 'b', changes: { note: 'z' } })
    expect(JSON.stringify(start)).toBe(snapshot)
  })
})
