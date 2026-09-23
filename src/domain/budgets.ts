import { shiftYm } from '@/lib/dates'
import { CATEGORIES } from './categories'
import type { AppState, Budgets } from './types'

const round2 = (n: number) => Math.round(n * 100) / 100

type BudgetPlan = Pick<AppState, 'budgets' | 'monthBudgets'>

/** Where a budget change applies. */
export type BudgetScope = 'month' | 'onward'

/** Current month → change it from now on; a past month → just correct that month. */
export const defaultScope = (isCurrentMonth: boolean): BudgetScope => (isCurrentMonth ? 'onward' : 'month')

/** The month (`YYYY-MM`) whose explicit entry governs `ym`, or null if the base budget applies. */
export function governingMonth(plan: BudgetPlan, ym: string): string | null {
  let best: string | null = null
  for (const k of Object.keys(plan.monthBudgets)) if (k <= ym && (best === null || k > best)) best = k
  return best
}

/** Category budgets in effect for a month: its own, else carried forward, else the base. */
export function budgetsFor(plan: BudgetPlan, ym: string): Budgets {
  const k = governingMonth(plan, ym)
  return k ? plan.monthBudgets[k] : plan.budgets
}

/** Later months that have their own budget (these are replaced by an "onward" change). */
export const laterMonthsWithBudgets = (plan: BudgetPlan, ym: string) =>
  Object.keys(plan.monthBudgets)
    .filter((k) => k > ym)
    .sort()

/**
 * Set a month's budgets.
 * - `month`: only this month changes; the following month is pinned to what it had before.
 * - `onward`: this month and every later month use the new budgets (later entries are dropped).
 * Earlier months never change.
 */
export function applyMonthBudgets(plan: BudgetPlan, ym: string, next: Budgets, scope: BudgetScope): BudgetPlan {
  const monthBudgets = { ...plan.monthBudgets }
  if (scope === 'month') {
    const following = shiftYm(ym, 1)
    if (!(following in monthBudgets)) monthBudgets[following] = budgetsFor(plan, following)
  } else {
    for (const k of Object.keys(monthBudgets)) if (k > ym) delete monthBudgets[k]
  }
  monthBudgets[ym] = next
  return { budgets: plan.budgets, monthBudgets }
}

/**
 * Re-scale category budgets so they add up to `total`, keeping each category's share.
 * Categories get whole amounts; any rounding difference goes to the largest category so the
 * sum is exact. If every category is at zero, the total is split evenly.
 */
export function scaleBudgets(budgets: Budgets, total: number): Budgets {
  const target = round2(Math.max(0, total))
  const current = CATEGORIES.reduce((a, c) => a + (budgets[c.key] || 0), 0)
  const weights = CATEGORIES.map((c) => (current > 0 ? budgets[c.key] || 0 : 1))
  const weightSum = weights.reduce((a, w) => a + w, 0)

  const next = Object.fromEntries(
    CATEGORIES.map((c, i) => [c.key, Math.round((target * weights[i]) / weightSum)]),
  ) as Budgets

  const diff = round2(target - CATEGORIES.reduce((a, c) => a + next[c.key], 0))
  if (diff !== 0) {
    const largest = CATEGORIES.reduce((best, c) => (next[c.key] > next[best.key] ? c : best), CATEGORIES[0])
    next[largest.key] = round2(next[largest.key] + diff)
  }
  return next
}
