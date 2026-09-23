# Ledgerline

A ledger-style personal expense tracker: month pacing against a budget, a running-total chart, category budgets, and a receipt-style entry form. Data is kept in the browser (`localStorage`).

Built with React 18, TypeScript, Vite, Tailwind CSS v4 and shadcn/ui (Radix primitives).

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the dev server                          |
| `npm run build`     | Typecheck and build to `dist/`                |
| `npm run preview`   | Serve the production build                    |
| `npm run typecheck` | TypeScript only                               |
| `npm run lint`      | ESLint                                        |
| `npm test`          | Run the Vitest suite once                     |
| `npm run test:watch`| Vitest in watch mode                          |

## Keyboard

- `N` — add an expense
- `←` / `→` — previous / next month

## Notes

- The app opens with three months of clearly-labelled example expenses; **Clear examples** removes them (with Undo).
- Changing currency only changes how amounts are shown — figures aren't converted.
- `legacy/index.html` is the original single-file version, kept for side-by-side comparison. With the dev server running it's at `/legacy/index.html` and shares the same stored data.
