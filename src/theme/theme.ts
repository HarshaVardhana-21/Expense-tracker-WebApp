export type Theme = 'light' | 'dark' | 'system'

export const THEMES: Theme[] = ['light', 'dark', 'system']

/** Kept separate from the expense data key so clearing one never touches the other. */
export const THEME_STORAGE_KEY = 'ledgerline:theme'

export const isTheme = (v: unknown): v is Theme => v === 'light' || v === 'dark' || v === 'system'

export function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(v) ? v : 'system'
  } catch {
    return 'system'
  }
}

export function storeTheme(theme: Theme) {
  try {
    if (theme === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable: the choice still applies for this visit.
  }
}

/**
 * The palette in globals.css reads `data-theme` on <html>; with no attribute it follows the OS.
 * Keep in sync with the inline script in index.html, which runs this before first paint.
 */
export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}
