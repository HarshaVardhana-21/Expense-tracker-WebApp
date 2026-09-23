import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '@/app/App'
import { Providers } from '@/app/providers'
import { THEME_STORAGE_KEY } from '@/theme/theme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

const renderApp = () =>
  render(
    <Providers>
      <App />
    </Providers>,
  )

describe('ThemeMenu', () => {
  it('switches the theme for the whole app and remembers it', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Theme: System' }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'Dark' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(screen.getByRole('button', { name: 'Theme: Dark' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Theme: Dark' }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'System' }))
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })

  it('restores a saved theme on load', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    renderApp()
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(screen.getByRole('button', { name: 'Theme: Light' })).toBeInTheDocument()
  })
})
