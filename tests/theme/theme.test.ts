import { applyTheme, readStoredTheme, storeTheme, THEME_STORAGE_KEY } from '@/theme/theme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to system', () => {
    expect(readStoredTheme()).toBe('system')
  })

  it('persists light and dark, and forgets on system', () => {
    storeTheme('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(readStoredTheme()).toBe('dark')
    storeTheme('system')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    expect(readStoredTheme()).toBe('system')
  })

  it('ignores unknown stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neon')
    expect(readStoredTheme()).toBe('system')
  })

  it('sets data-theme on <html>, and removes it for system', () => {
    applyTheme('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    applyTheme('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    applyTheme('system')
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })
})
