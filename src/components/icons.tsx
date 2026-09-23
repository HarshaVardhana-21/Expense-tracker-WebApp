/* The original hand-drawn icons, kept so the UI matches the first version exactly. */

export function LogoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" className="flex-none">
      <rect x="1" y="1" width="28" height="28" rx="8" style={{ fill: 'var(--primary)' }} />
      <path
        d="M8 10.5h14M8 15h14M8 19.5h8"
        style={{ stroke: 'var(--primary-foreground)', fill: 'none' }}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M11 6v18" style={{ stroke: 'var(--primary-foreground)', fill: 'none', opacity: 0.45 }} strokeWidth="1.4" />
    </svg>
  )
}

export function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3 5 8l5 5" style={{ fill: 'none', stroke: 'currentColor' }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="m6 3 5 5-5 5" style={{ fill: 'none', stroke: 'currentColor' }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3v10M3 8h10" style={{ stroke: 'currentColor' }} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" style={{ fill: 'none', stroke: 'currentColor' }} strokeWidth="1.6" />
      <path d="m10.5 10.5 3 3" style={{ stroke: 'currentColor' }} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" style={{ stroke: 'currentColor' }} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
