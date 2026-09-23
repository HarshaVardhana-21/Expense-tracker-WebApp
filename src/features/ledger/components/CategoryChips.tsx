import type { CSSProperties, ReactNode } from 'react'
import { CATEGORIES, CATEGORY_BY_KEY } from '@/domain/categories'
import type { CategoryKey } from '@/domain/types'
import { useView } from '@/store/view-store'

function Chip({
  pressed,
  color,
  onClick,
  children,
}: {
  pressed: boolean
  color?: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      style={color ? ({ '--c': color } as CSSProperties) : undefined}
      className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-input bg-transparent px-[11px] text-[13px] font-medium text-ink-2 hover:border-ink-2 hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
    >
      {color && <i className="size-2 rounded-full bg-[var(--c)]" />}
      {children}
    </button>
  )
}

/** "All" plus one chip per category that has spending this month (and the active filter, if empty). */
export function CategoryChips({ byCat }: { byCat: Record<CategoryKey, number> }) {
  const { filter, setFilter } = useView()
  const present = CATEGORIES.filter((c) => byCat[c.key] > 0)
  if (filter !== 'all' && !present.some((c) => c.key === filter)) present.push(CATEGORY_BY_KEY[filter])

  return (
    <div className="mb-3.5 flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
      <Chip pressed={filter === 'all'} onClick={() => setFilter('all')}>
        All
      </Chip>
      {present.map((c) => (
        <Chip key={c.key} pressed={filter === c.key} color={c.color} onClick={() => setFilter(c.key)}>
          {c.name}
        </Chip>
      ))}
    </div>
  )
}
