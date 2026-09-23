import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { App } from '@/app/App'
import { Providers } from '@/app/providers'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('forwards its ref to the <button>', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Save</Button>)
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Save' }))
  })

  // Regression: without forwardRef, Radix asChild triggers (theme menu, dialog close) lose their
  // anchor, so the theme menu opened detached from its button.
  it('lets Radix asChild triggers attach refs anywhere in the app', async () => {
    const errors: string[] = []
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args.join(' ')))
    const user = userEvent.setup()
    localStorage.clear()

    render(
      <Providers>
        <App />
      </Providers>,
    )
    await user.click(screen.getByRole('button', { name: /^Theme:/ }))
    await screen.findByRole('menu')
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: /add expense/i }))
    await screen.findByRole('dialog')

    spy.mockRestore()
    expect(errors.filter((e) => e.includes('cannot be given refs'))).toEqual([])
  })
})
