import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CategoryKey, Expense } from '@/domain/types'
import { shiftYm, ymOf } from '@/lib/dates'

type Filter = CategoryKey | 'all'

/** What the viewer is looking at: month, filters and the entry sheet. Not persisted. */
interface ViewState {
  today: Date
  ym: string
  isLatestMonth: boolean
  setYm: (ym: string) => void
  prevMonth: () => void
  nextMonth: () => void
  filter: Filter
  setFilter: (f: Filter) => void
  /** Select a category, or clear the filter if it is already selected. */
  toggleFilter: (f: CategoryKey) => void
  query: string
  setQuery: (q: string) => void
  sheet: { open: boolean; editing: Expense | null }
  openSheet: (expense?: Expense) => void
  closeSheet: () => void
}

const ViewContext = createContext<ViewState | null>(null)

export function ViewProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => new Date())
  const latest = ymOf(today)
  const [ym, setYmRaw] = useState(latest)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sheet, setSheet] = useState<{ open: boolean; editing: Expense | null }>({ open: false, editing: null })

  const setYm = useCallback((next: string) => setYmRaw(next > latest ? latest : next), [latest])
  const prevMonth = useCallback(() => setYmRaw((v) => shiftYm(v, -1)), [])
  const nextMonth = useCallback(() => setYmRaw((v) => (v < latest ? shiftYm(v, 1) : v)), [latest])
  const toggleFilter = useCallback((f: CategoryKey) => setFilter((cur) => (cur === f ? 'all' : f)), [])
  const openSheet = useCallback((expense?: Expense) => setSheet({ open: true, editing: expense ?? null }), [])
  const closeSheet = useCallback(() => setSheet((s) => ({ ...s, open: false })), [])

  const value = useMemo<ViewState>(
    () => ({
      today,
      ym,
      isLatestMonth: ym >= latest,
      setYm,
      prevMonth,
      nextMonth,
      filter,
      setFilter,
      toggleFilter,
      query,
      setQuery,
      sheet,
      openSheet,
      closeSheet,
    }),
    [today, ym, latest, setYm, prevMonth, nextMonth, filter, toggleFilter, query, sheet, openSheet, closeSheet],
  )

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

export function useView() {
  const ctx = useContext(ViewContext)
  if (!ctx) throw new Error('useView must be used inside <ViewProvider>')
  return ctx
}
