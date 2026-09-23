import { useCallback } from 'react'
import { formatMoney } from '@/lib/money'
import { useExpenseState } from '@/store/expense-store'

/** `money(n, opts)` bound to the selected currency. */
export function useMoney() {
  const { currency } = useExpenseState()
  return useCallback(
    (n: number, opts?: { compact?: boolean; whole?: boolean }) => formatMoney(n, currency, opts),
    [currency],
  )
}
