import { SearchIcon } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { useView } from '@/store/view-store'

export function LedgerSearch() {
  const { query, setQuery } = useView()
  return (
    <label className="flex h-10 flex-[1_1_220px] items-center gap-2 rounded-[11px] border border-input bg-card px-3 text-muted-foreground focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-soft)]">
      <SearchIcon />
      <Input
        id="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes, categories, methods"
        aria-label="Search expenses"
        className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 focus:shadow-none"
      />
    </label>
  )
}
