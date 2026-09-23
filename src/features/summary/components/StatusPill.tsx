import type { CSSProperties } from 'react'
import type { MonthStatus } from '@/domain/selectors'

const TONE: Record<MonthStatus['tone'], string> = {
  good: 'var(--good)',
  warn: 'var(--warn)',
  bad: 'var(--destructive)',
}

export function StatusPill({ status }: { status: MonthStatus }) {
  return (
    <span
      style={{ '--c': TONE[status.tone] } as CSSProperties}
      className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--c)_13%,transparent)] px-2.5 text-xs font-semibold text-[var(--c)]"
    >
      <span aria-hidden="true" className="size-[7px] rounded-full bg-[var(--c)]" />
      {status.label}
    </span>
  )
}
