import { Button } from '@/components/ui/button'
import { notify } from '@/lib/notify'
import { useExpenseDispatch, useExpenseState } from '@/store/expense-store'

export function SampleNotice() {
  const { expenses } = useExpenseState()
  const dispatch = useExpenseDispatch()
  if (!expenses.some((e) => e.sample)) return null

  const clear = () => {
    const before = expenses
    const removed = expenses.filter((e) => e.sample).length
    dispatch({ type: 'clearSamples' })
    notify(`Cleared ${removed} example expenses`, {
      label: 'Undo',
      onClick: () => dispatch({ type: 'replaceExpenses', expenses: before }),
    })
  }

  return (
    <div className="col-span-full flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-xl border border-dashed border-input px-3.5 py-2.5 text-sm text-ink-2">
      <span>
        You're looking at <strong>example expenses</strong> so you can see how Ledgerline works. Anything you add is
        kept separately.
      </span>
      <Button variant="outline" size="xs" onClick={clear}>
        Clear examples
      </Button>
    </div>
  )
}
