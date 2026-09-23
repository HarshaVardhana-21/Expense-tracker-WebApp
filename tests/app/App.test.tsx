import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '@/app/App'
import { Providers } from '@/app/providers'

beforeEach(() => localStorage.clear())

const renderApp = () =>
  render(
    <Providers>
      <App />
    </Providers>,
  )

describe('App', () => {
  it('opens with example data in the ledger', () => {
    renderApp()
    expect(screen.getByText(/example expenses/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /ledger/i })).toHaveTextContent(/entries/)
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled()
  })

  it('adds an expense from the receipt sheet', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /add expense/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Amount'), '12.34')
    await user.type(within(dialog).getByPlaceholderText(/lunch near office/i), 'Test snack')
    await user.click(within(dialog).getByRole('button', { name: 'Add expense' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit test snack/i })).toBeInTheDocument()
  })

  it('validates the amount', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /add expense/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Add expense' }))
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Enter an amount greater than zero.')
  })

  it('clears the examples', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: /clear examples/i }))
    expect(screen.getByText('A clean page')).toBeInTheDocument()
  })
})
