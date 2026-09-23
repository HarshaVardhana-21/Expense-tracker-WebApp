import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Stat {
  label: string
  value: ReactNode
  note: ReactNode
  noteClassName?: string
}

const CELL = [
  'pt-3.5 pr-3.5',
  'border-l border-border pt-3.5 pr-3.5 pl-3.5',
  'border-l border-border pt-3.5 pr-3.5 pl-3.5 max-[560px]:col-span-full max-[560px]:mt-3.5 max-[560px]:border-t max-[560px]:border-l-0 max-[560px]:pl-0',
]

export function StatsRow({ stats }: { stats: [Stat, Stat, Stat] }) {
  return (
    <dl className="m-0 grid grid-cols-3 border-t border-border max-[560px]:grid-cols-2">
      {stats.map((s, i) => (
        <div key={i} className={CELL[i]}>
          <dt className="mb-1 text-[12.5px] text-muted-foreground">{s.label}</dt>
          <dd className="m-0 font-mono text-lg leading-[1.2] font-semibold tracking-[-0.02em] tabular-nums">
            {s.value}
            <small className={cn('mt-[3px] block font-sans text-xs font-medium tracking-normal text-ink-2', s.noteClassName)}>
              {s.note}
            </small>
          </dd>
        </div>
      ))}
    </dl>
  )
}
