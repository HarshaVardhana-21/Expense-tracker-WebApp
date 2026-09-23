import { dayOf, daysInMonth, shiftYm, ymOf } from '@/lib/dates'
import { CATEGORIES } from './categories'
import type { Budgets, CategoryKey, Expense } from './types'

export interface MonthData {
  ym: string
  list: Expense[]
  days: number
  /** Spend per day, index 0 = day 1. */
  daily: number[]
  /** Running total at the end of each day. */
  cumulative: number[]
  byCat: Record<CategoryKey, number>
  total: number
  /** Days of the month that have happened: today's date for the current month, all for past months. */
  elapsed: number
  isCurrent: boolean
}

export function monthData(expenses: Expense[], ym: string, today: Date): MonthData {
  const list = expenses.filter((e) => e.date.startsWith(ym))
  const days = daysInMonth(ym)
  const daily = new Array<number>(days).fill(0)
  const byCat = Object.fromEntries(CATEGORIES.map((c) => [c.key, 0])) as Record<CategoryKey, number>
  for (const e of list) {
    daily[dayOf(e.date) - 1] += e.amount
    byCat[e.cat] = (byCat[e.cat] || 0) + e.amount
  }
  const cumulative: number[] = []
  let run = 0
  for (const v of daily) cumulative.push((run += v))
  const total = list.reduce((a, e) => a + e.amount, 0)
  const curYm = ymOf(today)
  const elapsed = ym === curYm ? today.getDate() : ym < curYm ? days : 0
  return { ym, list, days, daily, cumulative, byCat, total, elapsed, isCurrent: ym === curYm }
}

export const totalBudget = (budgets: Budgets) => CATEGORIES.reduce((a, c) => a + (budgets[c.key] || 0), 0)

/** Share of the month that has elapsed (0–1). */
export const paceOf = (m: MonthData) => (m.days ? m.elapsed / m.days : 0)

/**
 * Projected month-end total. Rent lands once at the start of the month, so it isn't extrapolated.
 * Past months simply return what was spent.
 */
export function projectedTotal(m: MonthData): number {
  if (!m.isCurrent || !m.elapsed) return m.total
  const fixedPart = m.byCat.housing || 0
  return fixedPart + ((m.total - fixedPart) / m.elapsed) * m.days
}

export type MonthStatus = { label: 'Over budget' | 'Ahead of pace' | 'On track' | 'Within budget'; tone: 'bad' | 'warn' | 'good' }

export function monthStatus(m: MonthData, budget: number): MonthStatus {
  const ratio = budget ? m.total / budget : 0
  if (m.total > budget) return { label: 'Over budget', tone: 'bad' }
  if (m.isCurrent && ratio > paceOf(m) + 0.08) return { label: 'Ahead of pace', tone: 'warn' }
  if (m.isCurrent) return { label: 'On track', tone: 'good' }
  return { label: 'Within budget', tone: 'good' }
}

/** Spend in the previous month — limited to the same days when viewing the current month. */
export function previousPeriodTotal(expenses: Expense[], m: MonthData): { ym: string; total: number } {
  const ym = shiftYm(m.ym, -1)
  const total = expenses
    .filter((e) => e.date.startsWith(ym) && (!m.isCurrent || dayOf(e.date) <= m.elapsed))
    .reduce((a, e) => a + e.amount, 0)
  return { ym, total }
}

export type CategoryState = 'over' | 'watch' | 'ok'

export function categoryState(spent: number, budget: number, m: MonthData): CategoryState {
  const ratio = budget ? spent / budget : spent ? 2 : 0
  if (spent > budget) return 'over'
  if (m.isCurrent && ratio > 0.5 && ratio > paceOf(m) + 0.15) return 'watch'
  return 'ok'
}

/** Budget left in a category for a month, excluding one expense (the one being edited). */
export function categoryLeft(
  expenses: Expense[],
  budgets: Budgets,
  cat: CategoryKey,
  ym: string,
  excludeId: string | null,
) {
  const spent = expenses
    .filter((e) => e.cat === cat && e.date.startsWith(ym) && e.id !== excludeId)
    .reduce((a, e) => a + e.amount, 0)
  return (budgets[cat] || 0) - spent
}

/** Ledger rows for the view: filtered, searched, newest first, grouped by date. */
export function ledgerGroups(list: Expense[], filter: CategoryKey | 'all', query: string, catName: (k: CategoryKey) => string) {
  const q = query.trim().toLowerCase()
  const rows = list
    .filter((e) => filter === 'all' || e.cat === filter)
    .filter((e) => !q || `${e.note} ${catName(e.cat)} ${e.method}`.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date) || (b.t || 0) - (a.t || 0))
  const groups = new Map<string, Expense[]>()
  for (const e of rows) {
    const g = groups.get(e.date)
    if (g) g.push(e)
    else groups.set(e.date, [e])
  }
  return { rows, groups: [...groups.entries()].map(([date, items]) => ({ date, items })) }
}

/** Nice axis step (1, 2, 2.5, 5, 10 × 10ⁿ). */
export function niceStep(raw: number) {
  const e = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / e
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e
}
