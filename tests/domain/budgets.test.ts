import {
  applyMonthBudgets,
  budgetsFor,
  defaultScope,
  governingMonth,
  laterMonthsWithBudgets,
  scaleBudgets,
} from '@/domain/budgets'
import { CATEGORIES, defaultBudgets } from '@/domain/categories'
import { totalBudget } from '@/domain/selectors'
import type { Budgets } from '@/domain/types'

const zero = () => Object.fromEntries(CATEGORIES.map((c) => [c.key, 0])) as Budgets
const base = defaultBudgets('USD') // total 3700
const total = (plan: Parameters<typeof budgetsFor>[0], ym: string) => totalBudget(budgetsFor(plan, ym))

describe('scaleBudgets', () => {
  it('hits the new total exactly', () => {
    for (const t of [50000, 111000, 3701, 999.99, 1]) {
      expect(totalBudget(scaleBudgets(defaultBudgets('INR'), t))).toBeCloseTo(t, 2)
    }
  })

  it('keeps each category’s share', () => {
    const next = scaleBudgets(base, 7400)
    expect(next.housing).toBe(3300)
    expect(next.dining).toBe(640)
  })

  it('splits evenly when every category is zero', () => {
    expect(new Set(Object.values(scaleBudgets(zero(), 1000)))).toEqual(new Set([100]))
  })

  it('does not mutate the input and never goes negative', () => {
    const snapshot = JSON.stringify(base)
    const next = scaleBudgets(base, -50)
    expect(JSON.stringify(base)).toBe(snapshot)
    expect(totalBudget(next)).toBe(0)
  })
})

describe('per-month budgets', () => {
  const empty = { budgets: base, monthBudgets: {} }

  it('uses the base budget when no month has its own', () => {
    expect(budgetsFor(empty, '2026-09')).toBe(base)
    expect(governingMonth(empty, '2026-09')).toBeNull()
  })

  it('carries a month’s budget forward, never backward', () => {
    const plan = applyMonthBudgets(empty, '2026-08', scaleBudgets(base, 5000), 'onward')
    expect(total(plan, '2026-07')).toBe(3700)
    expect(total(plan, '2026-08')).toBe(5000)
    expect(total(plan, '2026-12')).toBe(5000)
    expect(governingMonth(plan, '2026-12')).toBe('2026-08')
  })

  it('"only this month" leaves the following months as they were', () => {
    const plan = applyMonthBudgets(empty, '2026-09', scaleBudgets(base, 9000), 'month')
    expect(total(plan, '2026-08')).toBe(3700)
    expect(total(plan, '2026-09')).toBe(9000)
    expect(total(plan, '2026-10')).toBe(3700)
    expect(total(plan, '2027-03')).toBe(3700)
  })

  it('"only this month" keeps an existing later budget', () => {
    let plan = applyMonthBudgets(empty, '2026-10', scaleBudgets(base, 4000), 'onward')
    plan = applyMonthBudgets(plan, '2026-08', scaleBudgets(base, 6000), 'month')
    expect(total(plan, '2026-08')).toBe(6000)
    expect(total(plan, '2026-09')).toBe(3700)
    expect(total(plan, '2026-10')).toBe(4000)
  })

  it('"onward" replaces budgets set for later months', () => {
    let plan = applyMonthBudgets(empty, '2026-10', scaleBudgets(base, 4000), 'onward')
    expect(laterMonthsWithBudgets(plan, '2026-08')).toEqual(['2026-10'])
    plan = applyMonthBudgets(plan, '2026-08', scaleBudgets(base, 6000), 'onward')
    expect(total(plan, '2026-10')).toBe(6000)
    expect(laterMonthsWithBudgets(plan, '2026-08')).toEqual([])
  })

  it('does not mutate the plan it is given', () => {
    const plan = { budgets: base, monthBudgets: {} }
    applyMonthBudgets(plan, '2026-09', scaleBudgets(base, 1), 'month')
    expect(plan.monthBudgets).toEqual({})
  })

  it('defaults to "onward" for the current month and "only" for past months', () => {
    expect(defaultScope(true)).toBe('onward')
    expect(defaultScope(false)).toBe('month')
  })
})
