import type { CSSProperties } from 'react'
import { categoryState, type MonthData } from '@/domain/selectors'
import type { Category } from '@/domain/types'
import { useMoney } from '@/hooks/use-money'
import { cn } from '@/lib/utils'

interface CategoryBudgetRowProps {
  category: Category
  spent: number
  budget: number
  month: MonthData
  pressed: boolean
  onToggle: () => void
}

export function CategoryBudgetRow({ category: c, spent, budget, month, pressed, onToggle }: CategoryBudgetRowProps) {
  const money = useMoney()
  const ratio = budget ? spent / budget : spent ? 2 : 0
  const state = categoryState(spent, budget, month)

  return (
    <li className="border-t border-border last:border-b">
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onToggle}
        style={{ '--c': c.color } as CSSProperties}
        className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 border-0 bg-transparent px-1 py-3 text-left"
      >
        <span className="code-chip">{c.code}</span>
        <span className="font-semibold group-hover:underline group-hover:underline-offset-[3px] group-aria-pressed:text-primary">
          {c.name}
        </span>
        <span className="text-right font-mono text-[13px] font-medium whitespace-nowrap text-ink-2 tabular-nums">
          <b className="font-semibold text-foreground">{money(spent, { whole: true })}</b> / {money(budget, { whole: true })}
        </span>
        <span className="relative col-[2/4] h-1.5 overflow-hidden rounded-full bg-secondary">
          <span
            className={cn('absolute inset-y-0 left-0 rounded-full bg-[var(--c)]', state === 'over' && 'bar-over')}
            style={{ width: `${Math.min(100, ratio * 100)}%` }}
          />
        </span>
        <span className="col-[2/4] flex justify-between gap-2 text-xs text-muted-foreground">
          {state === 'over' ? (
            <span className="font-semibold text-destructive">{money(spent - budget)} over</span>
          ) : state === 'watch' ? (
            <span className="font-semibold text-warn">Running ahead</span>
          ) : (
            <span>{money(budget - spent)} left</span>
          )}
          <span>{budget ? Math.round(ratio * 100) : 0}%</span>
        </span>
      </button>
    </li>
  )
}
