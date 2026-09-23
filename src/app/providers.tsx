import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ExpenseStoreProvider } from '@/store/expense-store'
import { ViewProvider } from '@/store/view-store'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ExpenseStoreProvider>
      <ViewProvider>
        {children}
        <Toaster />
      </ViewProvider>
    </ExpenseStoreProvider>
  )
}
