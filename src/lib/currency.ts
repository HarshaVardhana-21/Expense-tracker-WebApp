import type { Currency } from '@/domain/types'

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'INR']

// Sample figures are scaled to feel plausible per currency; they are not exchange rates.
export const SCALE: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.8, INR: 30 }

export const LOCALE: Record<Currency, string> = { USD: 'en-US', EUR: 'en-IE', GBP: 'en-GB', INR: 'en-IN' }

const EURO_REGIONS = ['DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'PT', 'AT', 'BE', 'FI', 'GR', 'LU', 'SK', 'SI', 'EE', 'LV', 'LT']

export function guessCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (/Calcutta|Kolkata/.test(tz)) return 'INR'
    const loc = navigator.languages?.[0] || navigator.language || 'en-US'
    const region = (loc.split('-')[1] || '').toUpperCase()
    if (region === 'IN') return 'INR'
    if (region === 'GB') return 'GBP'
    if (EURO_REGIONS.includes(region)) return 'EUR'
  } catch {
    // fall through
  }
  return 'USD'
}

/** Rupees round to the nearest 10; other currencies to cents. */
export const roundFor = (v: number, cur: Currency) =>
  cur === 'INR' ? Math.round(v / 10) * 10 : Math.round(v * 100) / 100
