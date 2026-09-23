import { CATEGORIES, defaultBudgets } from '@/domain/categories'
import { seedExpenses } from '@/domain/seed'
import type { AppState } from '@/domain/types'
import { guessCurrency } from '@/lib/currency'

/** Same key as the original single-page version. */
export const STORAGE_KEY = 'ledgerline:v1'

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (!parsed || !Array.isArray(parsed.expenses)) return null
    return parsed as AppState
  } catch {
    return null
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the app keeps working in memory.
  }
}

/** Stored state if present, otherwise a fresh state with example data. Fills in any missing budgets. */
export function initialState(): AppState {
  const stored = loadState()
  const currency = stored?.currency ?? guessCurrency()
  const state: AppState = stored ?? {
    currency,
    budgets: defaultBudgets(currency),
    monthBudgets: {},
    expenses: seedExpenses(currency),
  }
  const defaults = defaultBudgets(state.currency)
  const fill = (b: Partial<AppState['budgets']> | undefined) => {
    const out = { ...(b ?? {}) } as AppState['budgets']
    for (const c of CATEGORIES) if (typeof out[c.key] !== 'number') out[c.key] = defaults[c.key]
    return out
  }
  // Data saved before per-month budgets has no `monthBudgets`: its single budget becomes the base.
  const monthBudgets = Object.fromEntries(
    Object.entries(state.monthBudgets ?? {}).map(([ym, b]) => [ym, fill(b)]),
  )
  return { ...state, budgets: fill(state.budgets), monthBudgets }
}
