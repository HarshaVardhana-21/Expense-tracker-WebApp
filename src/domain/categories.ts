import { SCALE } from '@/lib/currency'
import type { Budgets, Category, CategoryKey, Currency } from './types'

const DEFS: Omit<Category, 'color'>[] = [
  { key: 'groceries', name: 'Groceries', code: 'GRC', baseBudget: 450 },
  { key: 'dining', name: 'Dining', code: 'DIN', baseBudget: 320 },
  { key: 'transport', name: 'Transport', code: 'TRN', baseBudget: 180 },
  { key: 'housing', name: 'Housing', code: 'HSG', baseBudget: 1650 },
  { key: 'utilities', name: 'Utilities', code: 'UTL', baseBudget: 220 },
  { key: 'shopping', name: 'Shopping', code: 'SHP', baseBudget: 250 },
  { key: 'health', name: 'Health', code: 'HLT', baseBudget: 120 },
  { key: 'entertainment', name: 'Entertainment', code: 'ENT', baseBudget: 110 },
  { key: 'travel', name: 'Travel', code: 'TRV', baseBudget: 300 },
  { key: 'other', name: 'Other', code: 'OTH', baseBudget: 100 },
]

export const CATEGORIES: Category[] = DEFS.map((c, i) => ({ ...c, color: `var(--cat-${i})` }))

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<
  CategoryKey,
  Category
>

export const categoryOf = (key: string): Category => CATEGORY_BY_KEY[key as CategoryKey] ?? CATEGORY_BY_KEY.other

export function defaultBudgets(cur: Currency): Budgets {
  const f = SCALE[cur]
  return Object.fromEntries(
    CATEGORIES.map((c) => [
      c.key,
      cur === 'INR' ? Math.round((c.baseBudget * f) / 500) * 500 : Math.round((c.baseBudget * f) / 10) * 10,
    ]),
  ) as Budgets
}
