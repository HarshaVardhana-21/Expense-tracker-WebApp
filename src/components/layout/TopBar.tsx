import { ChevronLeft, ChevronRight, LogoMark, PlusIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Currency } from '@/domain/types'
import { useScrolled } from '@/hooks/use-scrolled'
import { CURRENCIES } from '@/lib/currency'
import { formatMonth } from '@/lib/dates'
import { currencySymbol } from '@/lib/money'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import { useExpenseDispatch, useExpenseState } from '@/store/expense-store'
import { useView } from '@/store/view-store'

export function TopBar() {
  const { currency } = useExpenseState()
  const dispatch = useExpenseDispatch()
  const { ym, prevMonth, nextMonth, isLatestMonth, openSheet } = useView()
  const scrolled = useScrolled()

  const changeCurrency = (value: string) => {
    dispatch({ type: 'setCurrency', currency: value as Currency })
    notify(`Showing amounts in ${value} — existing figures weren't converted`)
  }

  return (
    <header
      className={cn(
        'sticky top-[env(safe-area-inset-top,0px)] z-[5] -mx-4 border-b border-transparent px-4 py-3.5',
        'bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-[10px] backdrop-saturate-[1.2]',
        scrolled && 'border-border',
      )}
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-3">
        <div className="mr-auto flex items-center gap-2.5">
          <LogoMark />
          <b className="font-display text-[21px] leading-none font-extrabold tracking-[-0.02em]">Ledgerline</b>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="subtle" size="icon" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <h1
            aria-live="polite"
            className="m-0 min-w-[9.5em] text-center font-display text-[17px] leading-none font-[650] tracking-[-0.01em] max-[560px]:min-w-0 max-[560px]:text-[15px]"
          >
            {formatMonth(ym)}
          </h1>
          <Button variant="subtle" size="icon" onClick={nextMonth} disabled={isLatestMonth} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>

        <Select value={currency} onValueChange={changeCurrency}>
          <SelectTrigger aria-label="Currency" className="h-9 px-2.5 font-mono text-[13px] font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c} className="font-mono text-[13px] font-medium">
                {c} {currencySymbol(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => openSheet()}>
          <PlusIcon />
          <span className="max-[560px]:hidden">Add expense</span>{' '}
          <kbd className="max-[560px]:hidden">N</kbd>
        </Button>
      </div>
    </header>
  )
}
