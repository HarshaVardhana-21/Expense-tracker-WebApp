import { defaultBudgets } from '@/domain/categories'
import {
  categoryLeft,
  categoryState,
  ledgerGroups,
  monthData,
  monthStatus,
  niceStep,
  previousPeriodTotal,
  projectedTotal,
  totalBudget,
} from '@/domain/selectors'
import type { Expense } from '@/domain/types'

const today = new Date(2026, 8, 10) // 10 Sep 2026

let n = 0
const exp = (date: string, amount: number, cat: Expense['cat'] = 'dining', extra: Partial<Expense> = {}): Expense => ({
  id: `e${++n}`,
  date,
  amount,
  cat,
  note: 'x',
  method: 'Card',
  ...extra,
})

describe('monthData', () => {
  const list = [exp('2026-09-01', 100, 'housing'), exp('2026-09-02', 10), exp('2026-09-02', 5), exp('2026-08-31', 999)]

  it('only includes the month in view', () => {
    const m = monthData(list, '2026-09', today)
    expect(m.list).toHaveLength(3)
    expect(m.total).toBe(115)
  })

  it('builds daily and cumulative series', () => {
    const m = monthData(list, '2026-09', today)
    expect(m.daily.slice(0, 3)).toEqual([100, 15, 0])
    expect(m.cumulative[1]).toBe(115)
    expect(m.cumulative).toHaveLength(30)
  })

  it('counts elapsed days: today for the current month, all for past months', () => {
    expect(monthData(list, '2026-09', today).elapsed).toBe(10)
    expect(monthData(list, '2026-08', today).elapsed).toBe(31)
    expect(monthData(list, '2026-09', today).isCurrent).toBe(true)
  })
})

describe('projectedTotal', () => {
  it('extrapolates everything except rent', () => {
    const m = monthData([exp('2026-09-01', 1000, 'housing'), exp('2026-09-05', 100)], '2026-09', today)
    // 1000 fixed + 100 over 10 days → 10/day × 30 days
    expect(projectedTotal(m)).toBe(1300)
  })

  it('returns the actual total for past months', () => {
    const m = monthData([exp('2026-08-05', 42)], '2026-08', today)
    expect(projectedTotal(m)).toBe(42)
  })
})

describe('monthStatus', () => {
  it('flags over budget', () => {
    const m = monthData([exp('2026-09-02', 200)], '2026-09', today)
    expect(monthStatus(m, 100).label).toBe('Over budget')
  })

  it('flags spending ahead of the calendar pace', () => {
    // day 10/30 = 33% of the month, 60% of budget spent
    const m = monthData([exp('2026-09-02', 60)], '2026-09', today)
    expect(monthStatus(m, 100)).toEqual({ label: 'Ahead of pace', tone: 'warn' })
  })

  it('is on track when under pace, and within budget for past months', () => {
    expect(monthStatus(monthData([exp('2026-09-02', 20)], '2026-09', today), 100).label).toBe('On track')
    expect(monthStatus(monthData([exp('2026-08-02', 20)], '2026-08', today), 100).label).toBe('Within budget')
  })
})

describe('previousPeriodTotal', () => {
  it('compares against the same days of last month when viewing the current month', () => {
    const list = [exp('2026-08-05', 50), exp('2026-08-20', 70), exp('2026-09-03', 10)]
    const m = monthData(list, '2026-09', today)
    expect(previousPeriodTotal(list, m)).toEqual({ ym: '2026-08', total: 50 })
  })
})

describe('categoryState', () => {
  const m = monthData([], '2026-09', today)
  it('marks over, running ahead, and ok', () => {
    expect(categoryState(120, 100, m)).toBe('over')
    expect(categoryState(70, 100, m)).toBe('watch')
    expect(categoryState(30, 100, m)).toBe('ok')
  })
})

describe('categoryLeft', () => {
  it('excludes the expense being edited', () => {
    const budgets = { ...defaultBudgets('USD'), dining: 100 }
    const a = exp('2026-09-02', 30)
    const b = exp('2026-09-03', 20)
    expect(categoryLeft([a, b], budgets, 'dining', '2026-09', null)).toBe(50)
    expect(categoryLeft([a, b], budgets, 'dining', '2026-09', a.id)).toBe(80)
  })
})

describe('ledgerGroups', () => {
  const list = [
    exp('2026-09-02', 1, 'dining', { note: 'Coffee', t: 1 }),
    exp('2026-09-02', 2, 'dining', { note: 'Lunch', t: 2 }),
    exp('2026-09-05', 3, 'transport', { note: 'Metro' }),
  ]
  const name = (k: string) => k

  it('groups newest first, latest entry first within a day', () => {
    const { groups } = ledgerGroups(list, 'all', '', name)
    expect(groups.map((g) => g.date)).toEqual(['2026-09-05', '2026-09-02'])
    expect(groups[1].items.map((e) => e.note)).toEqual(['Lunch', 'Coffee'])
  })

  it('filters by category and search text', () => {
    expect(ledgerGroups(list, 'transport', '', name).rows).toHaveLength(1)
    expect(ledgerGroups(list, 'all', 'coff', name).rows.map((e) => e.note)).toEqual(['Coffee'])
    expect(ledgerGroups(list, 'all', 'card', name).rows).toHaveLength(3)
  })
})

describe('niceStep and totalBudget', () => {
  it('rounds to 1/2/2.5/5/10 steps', () => {
    expect(niceStep(0.9)).toBe(1)
    expect(niceStep(180)).toBe(200)
    expect(niceStep(230)).toBe(250)
    expect(niceStep(4200)).toBe(5000)
  })

  it('sums the default USD budgets', () => {
    expect(totalBudget(defaultBudgets('USD'))).toBe(3700)
  })
})
