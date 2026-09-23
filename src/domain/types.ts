export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR'

export type CategoryKey =
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'shopping'
  | 'health'
  | 'entertainment'
  | 'travel'
  | 'other'

export const PAYMENT_METHODS = ['Card', 'Cash', 'Bank transfer', 'Wallet'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export interface Expense {
  id: string
  amount: number
  cat: CategoryKey
  /** Local calendar date, `YYYY-MM-DD`. */
  date: string
  note: string
  method: PaymentMethod
  /** Seeded example row; removed by "Clear examples". */
  sample?: boolean
  /** Creation timestamp, used to order entries within a day. */
  t?: number
}

export type Budgets = Record<CategoryKey, number>

export interface AppState {
  currency: Currency
  budgets: Budgets
  expenses: Expense[]
}

export interface Category {
  key: CategoryKey
  name: string
  /** Three-letter ledger account code. */
  code: string
  /** Default monthly budget in USD; scaled per currency. */
  baseBudget: number
  /** CSS colour reference, e.g. `var(--cat-0)`. */
  color: string
}
