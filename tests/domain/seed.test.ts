import { seedExpenses } from '@/domain/seed'

const now = new Date(2026, 8, 23)
const ids = () => {
  let i = 0
  return () => `id${i++}`
}

describe('seedExpenses', () => {
  it('is deterministic', () => {
    expect(seedExpenses('USD', now, ids())).toEqual(seedExpenses('USD', now, ids()))
  })

  it('covers the two previous months and this month up to today', () => {
    const list = seedExpenses('USD', now, ids())
    const months = new Set(list.map((e) => e.date.slice(0, 7)))
    expect([...months].sort()).toEqual(['2026-07', '2026-08', '2026-09'])
    expect(list.every((e) => e.date <= '2026-09-23')).toBe(true)
  })

  it('marks every row as an example and includes rent on the 1st', () => {
    const list = seedExpenses('USD', now, ids())
    expect(list.every((e) => e.sample)).toBe(true)
    expect(list.find((e) => e.date === '2026-09-01' && e.note === 'Rent')?.amount).toBe(1650)
  })

  it('rounds rupee amounts to tens', () => {
    const list = seedExpenses('INR', now, ids())
    expect(list.every((e) => e.amount % 10 === 0)).toBe(true)
  })
})
