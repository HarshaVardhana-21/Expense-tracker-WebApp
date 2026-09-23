import { currencySymbol, formatMoney, moneyParts, parseAmount } from '@/lib/money'

describe('formatMoney', () => {
  it('uses two decimals for USD and none for INR', () => {
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50')
    expect(formatMoney(1234.5, 'INR')).toBe('₹1,235')
  })

  it('groups rupees in lakhs', () => {
    expect(formatMoney(123456, 'INR')).toBe('₹1,23,456')
  })

  it('drops decimals with whole', () => {
    expect(formatMoney(99.99, 'GBP', { whole: true })).toBe('£100')
  })

  it('abbreviates with compact', () => {
    expect(formatMoney(3700, 'USD', { compact: true })).toBe('$3.7K')
  })
})

describe('moneyParts', () => {
  it('separates symbol and fraction', () => {
    const parts = moneyParts(12.5, 'EUR')
    expect(parts.find((p) => p.kind === 'cur')?.value).toBe('€')
    expect(
      parts
        .filter((p) => p.kind === 'frac')
        .map((p) => p.value)
        .join(''),
    ).toBe('.50')
    expect(parts.map((p) => p.value).join('')).toBe(formatMoney(12.5, 'EUR'))
  })
})

describe('currencySymbol', () => {
  it.each([
    ['USD', '$'],
    ['EUR', '€'],
    ['GBP', '£'],
    ['INR', '₹'],
  ] as const)('%s → %s', (cur, sym) => {
    expect(currencySymbol(cur)).toBe(sym)
  })
})

describe('parseAmount', () => {
  it('accepts grouping separators and symbols', () => {
    expect(parseAmount('1,250.50')).toBe(1250.5)
    expect(parseAmount('₹ 400')).toBe(400)
  })

  it('returns NaN for empty or non-numeric input', () => {
    expect(parseAmount('')).toBeNaN()
    expect(parseAmount('abc')).toBeNaN()
  })
})
