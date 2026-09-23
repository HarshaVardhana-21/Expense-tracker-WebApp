import { useState, type FormEvent } from 'react'
import { CloseIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORY_BY_KEY } from '@/domain/categories'
import { categoryLeft } from '@/domain/selectors'
import { PAYMENT_METHODS, type CategoryKey, type Expense, type PaymentMethod } from '@/domain/types'
import { daysInMonth, pad, toIso, ymOf } from '@/lib/dates'
import { uid } from '@/lib/id'
import { currencySymbol, formatMoney, parseAmount } from '@/lib/money'
import { notify } from '@/lib/notify'
import { useExpenseDispatch, useExpenseState } from '@/store/expense-store'
import { useView } from '@/store/view-store'
import { AmountField } from './AmountField'
import { CategoryPicker } from './CategoryPicker'

/** The add / edit dialog, styled as a torn-off receipt. */
export function ExpenseSheet() {
  const { sheet, closeSheet } = useView()
  return (
    <Dialog open={sheet.open} onOpenChange={(open) => !open && closeSheet()}>
      <DialogContent
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          document.getElementById('f-amount')?.focus()
        }}
        className="max-h-[calc(100dvh-32px)] w-[min(520px,calc(100vw-32px))]"
      >
        {/* Mounted fresh on every open, so the form state starts from the expense being edited. */}
        <EntryForm editing={sheet.editing} />
      </DialogContent>
    </Dialog>
  )
}

function EntryForm({ editing }: { editing: Expense | null }) {
  const { expenses, budgets, currency } = useExpenseState()
  const dispatch = useExpenseDispatch()
  const { today, ym, filter, setYm, closeSheet } = useView()
  const todayIso = toIso(today)

  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [cat, setCat] = useState<CategoryKey>(editing?.cat ?? (filter !== 'all' ? filter : 'dining'))
  const [note, setNote] = useState(editing?.note ?? '')
  const [date, setDate] = useState(
    editing?.date ?? (ym === ymOf(today) ? todayIso : `${ym}-${pad(daysInMonth(ym))}`),
  )
  const [method, setMethod] = useState<PaymentMethod>(editing?.method ?? 'Card')
  const [error, setError] = useState<string | null>(null)

  const money = (n: number) => formatMoney(n, currency)
  const entryNo = editing ? expenses.findIndex((e) => e.id === editing.id) + 1 : expenses.length + 1

  const left =
    categoryLeft(expenses, budgets, cat, (date || todayIso).slice(0, 7), editing?.id ?? null) -
    (parseAmount(amount) || 0)

  const fail = (msg: string, focusId?: string) => {
    setError(msg)
    if (focusId) document.getElementById(focusId)?.focus()
  }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const value = parseAmount(amount)
    if (!(value > 0)) return fail('Enter an amount greater than zero.', 'f-amount')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail('Choose the date you paid.', 'f-date')
    if (date > todayIso) return fail('That date is in the future — pick today or earlier.', 'f-date')

    const finalNote = note.trim() || CATEGORY_BY_KEY[cat].name
    const amt = Math.round(value * 100) / 100
    if (editing) {
      dispatch({ type: 'update', id: editing.id, changes: { amount: amt, cat, date, note: finalNote, method } })
      notify('Changes saved')
    } else {
      dispatch({
        type: 'add',
        expense: { id: uid(), amount: amt, cat, date, note: finalNote, method, t: Date.now() },
      })
      notify(`Added ${finalNote} · ${money(amt)}`)
    }
    setYm(date.slice(0, 7))
    closeSheet()
  }

  const remove = () => {
    if (!editing) return
    const index = expenses.findIndex((e) => e.id === editing.id)
    if (index < 0) return
    dispatch({ type: 'remove', id: editing.id })
    closeSheet()
    notify(`Deleted ${editing.note}`, {
      label: 'Undo',
      onClick: () => {
        dispatch({ type: 'restore', expense: editing, index })
        notify('Restored')
      },
    })
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      className="receipt-edge max-h-[calc(100dvh-32px)] overflow-auto rounded-t-2xl bg-card px-6 pt-[22px] pb-10 max-[560px]:px-[18px]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-dashed border-input pb-3.5">
        <div>
          <div className="eyebrow">
            Entry № {String(entryNo).padStart(4, '0')} · {currency}
          </div>
          <DialogTitle className="mt-1.5 mb-0 font-display text-[26px] leading-[1.05] font-[750] tracking-[-0.025em]">
            {editing ? 'Edit expense' : 'New expense'}
          </DialogTitle>
        </div>
        <DialogClose asChild>
          <Button type="button" variant="subtle" size="icon" aria-label="Close">
            <CloseIcon />
          </Button>
        </DialogClose>
      </div>

      <AmountField
        symbol={currencySymbol(currency)}
        value={amount}
        placeholder={currency === 'INR' ? '0' : '0.00'}
        onChange={setAmount}
      />

      <CategoryPicker value={cat} onChange={setCat} />

      <label className="mt-4 flex flex-col gap-1.5">
        <span className="eyebrow">What was it for</span>
        <Input
          id="f-note"
          name="note"
          maxLength={60}
          placeholder="e.g. Lunch near office"
          autoComplete="off"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="eyebrow">Date</span>
          <Input id="f-date" name="date" type="date" max={todayIso} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="f-method" className="eyebrow">
            Paid with
          </label>
          <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
            <SelectTrigger id="f-method" className="h-[42px] w-full px-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 mb-0 text-[13.5px] font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="mt-3.5 flex justify-between font-mono text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">
        <span>{CATEGORY_BY_KEY[cat].name} budget left after this</span>
        <span className="tabular-nums" style={left < 0 ? { color: 'var(--destructive)' } : undefined}>
          {left >= 0 ? money(left) : `${money(-left)} over`}
        </span>
      </div>

      <div className="mt-[22px] flex items-center gap-2.5 border-t border-dashed border-input pt-4">
        {editing && (
          <Button type="button" variant="destructive" size="link" onClick={remove}>
            Delete
          </Button>
        )}
        <span className="flex-1" />
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">{editing ? 'Save changes' : 'Add expense'}</Button>
      </div>
    </form>
  )
}
