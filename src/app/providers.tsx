import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { ExpenseStoreProvider } from '@/store/expense-store'
import { ViewProvider } from '@/store/view-store'
import { ThemeProvider } from '@/theme/theme-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ExpenseStoreProvider>
        <ViewProvider>
          {children}
          <Toaster />
        </ViewProvider>
      </ExpenseStoreProvider>
    </ThemeProvider>
  )
}
