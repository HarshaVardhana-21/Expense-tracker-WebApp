import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import type { AppState } from '@/domain/types'
import { expenseReducer, type ExpenseAction } from './expense-reducer'
import { initialState, saveState } from './storage'

const StateContext = createContext<AppState | null>(null)
const DispatchContext = createContext<Dispatch<ExpenseAction> | null>(null)

export function ExpenseStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, undefined, initialState)

  useEffect(() => saveState(state), [state])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useExpenseState() {
  const ctx = useContext(StateContext)
  if (!ctx) throw new Error('useExpenseState must be used inside <ExpenseStoreProvider>')
  return ctx
}

export function useExpenseDispatch() {
  const ctx = useContext(DispatchContext)
  if (!ctx) throw new Error('useExpenseDispatch must be used inside <ExpenseStoreProvider>')
  return ctx
}
