export function EmptyState({ filtered, monthLabel }: { filtered: boolean; monthLabel: string }) {
  return (
    <div className="py-12 pr-6 pl-[82px] text-ink-2 max-[560px]:pl-[62px]">
      <strong className="mb-1 block font-display text-[17px] font-[650] text-foreground">
        {filtered ? 'No matching expenses' : 'A clean page'}
      </strong>
      {filtered ? (
        'Try a different search or clear the category filter.'
      ) : (
        <>
          Nothing recorded for {monthLabel} yet. Press <kbd>N</kbd> or use “Add expense” to log one.
        </>
      )}
    </div>
  )
}
