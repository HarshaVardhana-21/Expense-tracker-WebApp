import type { CSSProperties } from 'react'
import { RadioGroup, RadioGroupTile } from '@/components/ui/radio-group'
import { CATEGORIES } from '@/domain/categories'
import type { CategoryKey } from '@/domain/types'

interface CategoryPickerProps {
  value: CategoryKey
  onChange: (v: CategoryKey) => void
}

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <fieldset className="m-0 mt-4 border-0 p-0">
      <legend className="eyebrow mb-2 p-0">Category</legend>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as CategoryKey)}
        aria-label="Category"
        className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-1.5"
      >
        {CATEGORIES.map((c) => (
          <RadioGroupTile
            key={c.key}
            id={`cat-${c.key}`}
            value={c.key}
            style={{ '--c': c.color } as CSSProperties}
            className="flex flex-col items-start gap-[3px] rounded-[10px] border border-border bg-transparent px-[9px] py-2 text-left text-[12.5px] leading-[1.2] font-semibold data-[state=checked]:border-[var(--c)] data-[state=checked]:bg-[color-mix(in_srgb,var(--c)_12%,transparent)] data-[state=checked]:shadow-[inset_0_0_0_1px_var(--c)]"
          >
            <b className="font-mono text-[10.5px] font-semibold tracking-[0.08em] text-[var(--c)]">{c.code}</b>
            {c.name}
          </RadioGroupTile>
        ))}
      </RadioGroup>
    </fieldset>
  )
}
