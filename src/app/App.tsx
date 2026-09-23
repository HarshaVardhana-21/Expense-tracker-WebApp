import { TopBar } from '@/components/layout/TopBar'
import { BudgetsPanel } from '@/features/budgets/components/BudgetsPanel'
import { RunningTotalChart } from '@/features/chart/components/RunningTotalChart'
import { ExpenseSheet } from '@/features/entry/components/ExpenseSheet'
import { Ledger } from '@/features/ledger/components/Ledger'
import { MonthSummary } from '@/features/summary/components/MonthSummary'
import { SampleNotice } from '@/features/summary/components/SampleNotice'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useView } from '@/store/view-store'

export function App() {
  const { sheet, openSheet, prevMonth, nextMonth } = useView()

  useKeyboardShortcuts({ n: () => openSheet(), ArrowLeft: prevMonth, ArrowRight: nextMonth }, sheet.open)

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-[1180px]">
        <section
          aria-label="Month summary"
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] items-start gap-x-10 gap-y-7 pt-7 pb-8 max-[920px]:grid-cols-1"
        >
          <SampleNotice />
          <MonthSummary />
          <RunningTotalChart />
        </section>

        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start gap-8 max-[920px]:grid-cols-1">
          <Ledger />
          <BudgetsPanel />
        </div>
      </main>
      <ExpenseSheet />
    </>
  )
}
