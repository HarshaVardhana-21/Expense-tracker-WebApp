import { roundFor, SCALE } from '@/lib/currency'
import { daysInMonth, toIso, ymOf } from '@/lib/dates'
import { uid } from '@/lib/id'
import type { CategoryKey, Currency, Expense, PaymentMethod } from './types'

type Fixed = [day: number, cat: CategoryKey, note: string, lo: number, hi: number, method: PaymentMethod]
type Variable = [cat: CategoryKey, notes: string[], lo: number, hi: number, dailyChance: number]

const FIXED: Fixed[] = [
  [1, 'housing', 'Rent', 1650, 1650, 'Bank transfer'],
  [3, 'health', 'Gym membership', 45, 45, 'Card'],
  [5, 'utilities', 'Electricity bill', 68, 112, 'Bank transfer'],
  [9, 'entertainment', 'Streaming subscription', 15.99, 15.99, 'Card'],
  [12, 'utilities', 'Home internet', 60, 60, 'Card'],
  [18, 'utilities', 'Phone plan', 35, 35, 'Card'],
]

const VARIABLE: Variable[] = [
  ['groceries', ['Grocery run', 'Farmers market', 'Corner store', 'Weekly shop'], 22, 110, 0.22],
  ['dining', ['Coffee', 'Lunch near office', 'Dinner out', 'Takeout', 'Bakery'], 4, 40, 0.42],
  ['transport', ['Metro top-up', 'Ride home', 'Fuel', 'Bike repair'], 3, 30, 0.35],
  ['shopping', ['Household supplies', 'Books', 'New headphones', 'Clothes'], 12, 140, 0.12],
  ['health', ['Pharmacy', 'Dentist co-pay'], 8, 40, 0.05],
  ['entertainment', ['Cinema', 'Concert tickets', 'Board game café'], 12, 70, 0.07],
  ['travel', ['Train tickets', 'Weekend hotel'], 40, 220, 0.03],
  ['other', ['Gift for a friend', 'Haircut', 'Donation'], 10, 60, 0.06],
]

const METHODS: PaymentMethod[] = ['Card', 'Card', 'Card', 'Cash', 'Wallet']

/** mulberry32 — small deterministic PRNG so the examples look the same on every load. */
function mulberry32(seed: number) {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Three months of example expenses ending today, flagged `sample: true`. */
export function seedExpenses(cur: Currency, now: Date = new Date(), makeId: () => string = uid): Expense[] {
  const rnd = mulberry32(20260923)
  const pick = <T>(a: T[]) => a[Math.floor(rnd() * a.length)]
  const f = SCALE[cur]
  const out: Expense[] = []

  for (let off = -2; off <= 0; off++) {
    const first = new Date(now.getFullYear(), now.getMonth() + off, 1)
    const days = off === 0 ? now.getDate() : daysInMonth(ymOf(first))
    const add = (day: number, cat: CategoryKey, note: string, lo: number, hi: number, method: PaymentMethod) =>
      out.push({
        id: makeId(),
        sample: true,
        cat,
        note,
        method,
        amount: Math.max(cur === 'INR' ? 10 : 1, roundFor((lo + rnd() * (hi - lo)) * f, cur)),
        date: toIso(new Date(first.getFullYear(), first.getMonth(), day)),
      })

    FIXED.forEach(([d, cat, note, lo, hi, m]) => {
      if (d <= days) add(d, cat, note, lo, hi, m)
    })
    for (let d = 1; d <= days; d++) {
      VARIABLE.forEach(([cat, notes, lo, hi, p]) => {
        if (rnd() < p) add(d, cat, pick(notes), lo, hi, pick(METHODS))
      })
    }
  }
  return out
}
