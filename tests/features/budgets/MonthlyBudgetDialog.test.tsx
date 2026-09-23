import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '@/app/App'
import { Providers } from '@/app/providers'
import { defaultBudgets } from '@/domain/categories'
import { shiftYm, ymOf } from '@/lib/dates'
import { STORAGE_KEY } from '@/store/storage'

// Pin the currency (the default is guessed from the machine's locale/timezone).
// Saved without `monthBudgets`, like data from before per-month budgets.
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ currency: 'USD', budgets: defaultBudgets('USD'), expenses: [] }),
  )
})

const renderApp = () =>
  render(
    <Providers>
      <App />
    </Providers>,
  )

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY)!)
const thisYm = ymOf(new Date())
const lastYm = shiftYm(thisYm, -1)

async function openDialog(user: ReturnType<typeof userEvent.setup>, button: string) {
  await user.click(screen.getByRole('button', { name: button }))
  const dialog = await screen.findByRole('dialog', { name: /budget$/i })
  return { dialog, input: within(dialog).getByRole('textbox', { name: /budget$/i }) }
}

describe('MonthlyBudgetDialog', () => {
  it('sets this month’s budget (carried onward by default) and splits it across categories', async () => {
    const user = userEvent.setup()
    renderApp()
    expect(screen.getAllByText('$3,700').length).toBeGreaterThan(0)

    const { dialog, input } = await openDialog(user, 'Change budget')
    expect(input).toHaveValue('3700')
    expect(within(dialog).getByRole('radio', { name: /onward/ })).toBeChecked()

    await user.clear(input)
    await user.type(input, '7400')
    expect(within(dialog).getByText('$3,300')).toBeInTheDocument() // housing preview, was $1,650

    await user.click(within(dialog).getByRole('button', { name: 'Save budget' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(stored().monthBudgets[thisYm].housing).toBe(3300)
    expect(stored().budgets.housing).toBe(1650) // earlier months untouched
    expect(screen.getAllByText('$7,400').length).toBeGreaterThan(0)
  })

  it('gives a past month its own budget without changing the current month', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Previous month' }))

    const { dialog, input } = await openDialog(user, 'Set total')
    expect(within(dialog).getByRole('radio', { name: /^Only/ })).toBeChecked()
    await user.clear(input)
    await user.type(input, '5000')
    await user.click(within(dialog).getByRole('button', { name: 'Save budget' }))

    expect(screen.getAllByText('$5,000').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getAllByText('$3,700').length).toBeGreaterThan(0)

    const s = stored()
    expect(s.monthBudgets[lastYm]).toBeDefined()
    expect(s.monthBudgets[thisYm].housing).toBe(1650) // pinned to what it had
  })

  it('validates the amount', async () => {
    const user = userEvent.setup()
    renderApp()
    const { dialog, input } = await openDialog(user, 'Set total')
    await user.clear(input)
    await user.click(within(dialog).getByRole('button', { name: 'Save budget' }))
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Enter a monthly budget greater than zero.')
    expect(stored().monthBudgets ?? {}).toEqual({})
  })

  it('cancelling leaves budgets unchanged', async () => {
    const user = userEvent.setup()
    renderApp()
    const { dialog, input } = await openDialog(user, 'Change budget')
    await user.type(input, '9')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(stored().budgets).toEqual(defaultBudgets('USD'))
    expect(stored().monthBudgets ?? {}).toEqual({})
  })
})
