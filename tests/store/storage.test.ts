import { initialState, loadState, saveState, STORAGE_KEY } from '@/store/storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('seeds example data on first run', () => {
    const s = initialState()
    expect(s.expenses.length).toBeGreaterThan(0)
    expect(s.expenses.every((e) => e.sample)).toBe(true)
  })

  it('round-trips under the original key', () => {
    const s = initialState()
    saveState(s)
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(loadState()).toEqual(s)
  })

  it('ignores corrupt data and fills in missing budgets', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadState()).toBeNull()

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency: 'USD', budgets: { dining: 1 }, expenses: [] }))
    const s = initialState()
    expect(s.expenses).toEqual([])
    expect(s.budgets.dining).toBe(1)
    expect(s.budgets.groceries).toBe(450)
  })
})
