import type { CSSProperties } from 'react'
import type { Category, CategoryKey } from '@/domain/types'

interface ShareStripProps {
  sorted: Category[]
  byCat: Record<CategoryKey, number>
  total: number
}

/** One bar split by each category's share of the month's spending. */
export function ShareStrip({ sorted, byCat, total }: ShareStripProps) {
  const top = sorted[0]
  return (
    <>
      <div aria-hidden="true" className="mb-1.5 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-secondary">
        {total > 0 &&
          sorted
            .filter((c) => byCat[c.key] > 0)
            .map((c) => (
              <span
                key={c.key}
                title={c.name}
                className="min-w-[3px] bg-[var(--c)]"
                style={{ '--c': c.color, flex: byCat[c.key] } as CSSProperties}
              />
            ))}
      </div>
      <p className="m-0 mb-3.5 text-[12.5px] text-muted-foreground">
        {total && top
          ? `${top.name} takes the largest share — ${Math.round((byCat[top.key] / total) * 100)}% of this month's spending.`
          : 'Nothing spent yet this month.'}
      </p>
    </>
  )
}
