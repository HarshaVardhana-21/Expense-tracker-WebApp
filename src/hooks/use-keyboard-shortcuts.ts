import { useEffect, useRef } from 'react'

type Handlers = Partial<Record<'n' | 'ArrowLeft' | 'ArrowRight', () => void>>

/**
 * Global single-key shortcuts. Ignored while typing in a field, with modifier keys,
 * or when `disabled` (e.g. a dialog is open).
 */
export function useKeyboardShortcuts(handlers: Handlers, disabled = false) {
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (disabled || ev.metaKey || ev.ctrlKey || ev.altKey) return
      const tag = (document.activeElement as HTMLElement | null)?.tagName ?? ''
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const key = ev.key === 'N' ? 'n' : ev.key
      const fn = ref.current[key as keyof Handlers]
      if (fn) {
        if (key === 'n') ev.preventDefault()
        fn()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [disabled])
}
