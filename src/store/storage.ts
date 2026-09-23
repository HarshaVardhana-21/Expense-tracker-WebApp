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
    expenses: seedExpenses(currency),
  }
  const defaults = defaultBudgets(state.currency)
  const budgets = { ...(state.budgets ?? {}) } as AppState['budgets']
  for (const c of CATEGORIES) if (typeof budgets[c.key] !== 'number') budgets[c.key] = defaults[c.key]
  return { ...state, budgets }
}
