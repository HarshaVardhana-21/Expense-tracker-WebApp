# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server. Port 5173 is often taken on this machine by another project; use `npx vite --port 5180 --strictPort`.
- `npm run build` — `tsc -b` then `vite build`
- `npm run typecheck`, `npm run lint`
- `npm test` — Vitest, run once. For a single file: `npx vitest run tests/domain/selectors.test.ts`. By test name: `npx vitest run -t "restores a removed expense"`.

Environment: Windows, PowerShell 5.1. There is no `gh` CLI and no browser tool, so check UI changes with `npm run build` and by inspecting the compiled CSS in `dist/assets/`.

## Architecture

Single-page React app: no router and no backend. State persists to `localStorage` under the key `ledgerline:v1`.

- `src/domain/`: pure logic, with no React. It holds the types, the category table (`categories.ts`, including the three-letter codes and the `--cat-N` colour tokens), the deterministic example-data generator (`seed.ts`, which uses a fixed-seed mulberry32 so the examples are identical on every load), and every derived figure in `selectors.ts`: `monthData`, the projection that leaves rent out of the extrapolation, month status, the category flags, `ledgerGroups` and `niceStep`. Put new calculations here and test them in `tests/domain/`.
- **Budgets are per month** (`domain/budgets.ts`). `AppState.budgets` is the base, and `AppState.monthBudgets[YYYY-MM]` holds the months that have their own budget.
  - **Lookup:** a month uses its own entry if it has one, else the most recent earlier entry, else the base. So a budget carries forward and never backward. Always read budgets with `budgetsFor(state, ym)`; `useMonthData()` already returns them for the month in view. Never read `state.budgets` directly.
  - **Changing a month:** `applyMonthBudgets` takes a scope. `month` changes only that month and pins the following month to its old value. `onward` also applies to later months and drops their entries. Earlier months never change. `defaultScope` picks `onward` for the current month and `month` for past months.
  - **Totals:** a month's total is the sum of its categories (`totalBudget`). "Change budget" and "Set total" (`MonthlyBudgetDialog`) use `scaleBudgets`, which splits the new total by each category's current share. "Edit budgets" (`BudgetEditor`) edits each category directly. Both use the same `BudgetScopePicker`.
  - **Undo:** undo restores the whole plan with `restoreBudgetPlan`.
  - **Old saved data:** data saved before per-month budgets has no `monthBudgets`; `initialState` fills in `{}`.
- `src/store/`: two React contexts.
  - `expense-store.tsx` holds the persisted data: `useReducer(expenseReducer)`, saved on every change. Its actions are in `expense-reducer.ts`.
  - `view-store.tsx` holds what the viewer is looking at: the month in view, the category filter, the search text, and whether the entry sheet is open. It is not persisted, and `today` is fixed when the app mounts.
  - Undo works by dispatching `restore` or `replaceExpenses` from a toast action.
- `src/hooks/use-month-data.ts` joins the two stores into the current month's `MonthData`. Feature components read from it rather than recomputing figures.
- `src/features/<area>/components/`: summary, chart, ledger, budgets and entry. The chart is hand-built SVG on purpose; don't swap it for Recharts or shadcn Chart, because that changes how it looks.
- `src/components/ui/`: shadcn primitives, **restyled** to match the original design. Don't overwrite them with `shadcn add --overwrite`. The CLI also imported `cn` from a bogus npm package called `cn` the first time; the correct import is `@/lib/utils`.
- `src/lib/notify.tsx`: every toast goes through `notify(message, action?)`, which renders a custom sonner toast.

## Styling rules

- The design tokens live in `src/styles/globals.css`: the light palette on `:root`, overridden under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. The shadcn variable names (`--primary`, `--card`, `--border`, `--input`, `--muted-foreground`, …) *are* the design tokens. `@custom-variant dark` follows the same three theme states.
- Theme switching (`src/theme/`) never touches colours. `ThemeProvider` only sets or removes `data-theme` on `<html>`, and saves the choice to `localStorage` under `ledgerline:theme`. The inline script in `index.html` does the same before first paint so the page doesn't flash the wrong theme. If you change one, change the other.
- Category colour is passed to components as an inline `--c` custom property, e.g. `bg-[var(--c)]` or the `.code-chip` class.
- The components use Tailwind utilities with exact pixel values, ported from `legacy/index.html`. Only a few multi-property or pseudo-element rules live in `@layer components`: `.receipt-edge`, `.ledger-page::before`, `.big-amount`, `.bar-over`, `.code-chip`, `.eyebrow` and `.chart-axis`.
- React is 18, so function components don't receive `ref` as a prop. The current shadcn CLI generates React-19-style components that drop refs. Any primitive used as a Radix `asChild` child must use `React.forwardRef`, as `Button` does; without it, popovers lose their anchor and focus isn't restored. `tests/components/ui/button.test.tsx` fails on any "cannot be given refs" warning. Other primitives don't forward refs, so focus their fields by `id` instead.

## Tests

`tests/` mirrors `src/`. `tests/setup.ts` stubs the jsdom gaps that Radix needs: `ResizeObserver`, the pointer-capture methods, `scrollIntoView` and `matchMedia`.

`legacy/index.html` is the original single-file version. Use it as the visual reference; it is excluded from lint.
