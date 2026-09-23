import { dayOf, daysInMonth, formatMonth, parseDate, shiftYm, toIso, ymOf } from '@/lib/dates'

describe('dates', () => {
  it('round-trips ISO dates in local time', () => {
    const d = new Date(2026, 8, 3)
    expect(toIso(d)).toBe('2026-09-03')
    expect(toIso(parseDate('2026-09-03'))).toBe('2026-09-03')
    expect(ymOf(d)).toBe('2026-09')
  })

  it('knows month lengths, including leap February', () => {
    expect(daysInMonth('2026-09')).toBe(30)
    expect(daysInMonth('2028-02')).toBe(29)
    expect(daysInMonth('2026-02')).toBe(28)
  })

  it('shifts across year boundaries', () => {
    expect(shiftYm('2026-01', -1)).toBe('2025-12')
    expect(shiftYm('2026-12', 1)).toBe('2027-01')
  })

  it('reads the day of month', () => {
    expect(dayOf('2026-09-23')).toBe(23)
  })

  it('formats month labels', () => {
    expect(formatMonth('2026-09')).toBe('September 2026')
  })
})
