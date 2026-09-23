import type { Currency } from '@/domain/types'
import { LOCALE } from './currency'

interface MoneyOptions {
  compact?: boolean
  whole?: boolean
}

const decimals = (cur: Currency) => (cur === 'INR' ? 0 : 2)
const cache = new Map<string, Intl.NumberFormat>()

function formatter(cur: Currency, opts: MoneyOptions) {
  const key = `${cur}|${opts.compact ? 'c' : ''}|${opts.whole ? 'w' : ''}`
  let nf = cache.get(key)
  if (!nf) {
    const dec = opts.whole ? 0 : decimals(cur)
    nf = new Intl.NumberFormat(
      LOCALE[cur],
      opts.compact
        ? { style: 'currency', currency: cur, notation: 'compact', maximumFractionDigits: 1 }
        : { style: 'currency', currency: cur, minimumFractionDigits: dec, maximumFractionDigits: dec },
    )
    cache.set(key, nf)
  }
  return nf
}

export const formatMoney = (n: number, cur: Currency, opts: MoneyOptions = {}) => formatter(cur, opts).format(n)

export type MoneyPart = { kind: 'cur' | 'frac' | 'plain'; value: string }

/** Splits a formatted amount so the symbol and fraction can be styled separately. */
export function moneyParts(n: number, cur: Currency): MoneyPart[] {
  return formatter(cur, {})
    .formatToParts(n)
    .map((p) => ({
      kind: p.type === 'currency' ? 'cur' : p.type === 'decimal' || p.type === 'fraction' ? 'frac' : 'plain',
      value: p.value,
    }))
}

export const currencySymbol = (cur: Currency) =>
  formatter(cur, {})
    .formatToParts(0)
    .find((p) => p.type === 'currency')?.value ?? ''

/** Lenient parse of a typed amount ("1,250.50", "₹ 400"). Returns NaN when nothing numeric is present. */
export function parseAmount(v: string | number): number {
  const n = parseFloat(
    String(v)
      .replace(/,/g, '')
      .replace(/[^0-9.]/g, ''),
  )
  return Number.isFinite(n) ? n : NaN
}
