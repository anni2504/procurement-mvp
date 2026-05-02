import { useState, useEffect } from 'react'
import { ProcurementProvider, useProcurement, TOTAL_STEPS } from './context/ProcurementContext'
import { ToastProvider } from './context/ToastContext'
import Step1Request from './components/Step1Request'
import Step2Approval from './components/Step2Approval'
import VendorQuotes from './components/VendorQuotes'
import Step3RFP from './components/Step3RFP'
import Step4PO from './components/Step4PO'
import Step5GRN from './components/Step5GRN'
import Step6Invoice from './components/Step6Invoice'
import Step7Match from './components/Step7Match'
import Step8Dispute from './components/Step8Dispute'
import Step9Finance from './components/Step9Finance'
import Step10Payment from './components/Step10Payment'
import HistoryView from './components/HistoryView'
import { Badge } from './components/ui/badge'
import {
  ClipboardList, CheckCircle, FileText, ShoppingCart, MessageSquareQuote,
  Package, Receipt, GitCompare, AlertTriangle, CreditCard, Banknote,
  RotateCcw, History
} from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Procurement Request', subtitle: 'Raise requisition', icon: ClipboardList },
  { id: 2, title: 'Manager Approval', subtitle: 'Review & approve', icon: CheckCircle },
  { id: 3, title: 'Vendor Quotes', subtitle: 'Collect quotes', icon: MessageSquareQuote },
  { id: 4, title: 'RFP & Vendor Selection', subtitle: 'Evaluate & select', icon: FileText },
  { id: 5, title: 'Purchase Order', subtitle: 'Generate & send PO', icon: ShoppingCart },
  { id: 6, title: 'Goods Receipt / GRN', subtitle: 'Record delivery', icon: Package },
  { id: 7, title: 'Invoice Submission', subtitle: 'Vendor invoice', icon: Receipt },
  { id: 8, title: '3-Way Match', subtitle: 'Validate quantities', icon: GitCompare },
  { id: 9, title: 'Dispute Resolution', subtitle: 'Resolve mismatches', icon: AlertTriangle },
  { id: 10, title: 'Finance Approval', subtitle: 'Approve payment', icon: CreditCard },
  { id: 11, title: 'Payment', subtitle: 'Process & close', icon: Banknote },
]

const EMPTY_STATES: Record<number, { icon: string; message: string }> = {
  2: { icon: '📋', message: 'No request submitted yet. Complete the Procurement Request first.' },
  3: { icon: '✅', message: 'No approved request yet. Complete Manager Approval first.' },
  4: { icon: '📩', message: 'No vendor quotes yet. Collect vendor quotes first.' },
  5: { icon: '🏢', message: 'No vendor selected yet. Complete RFP & Vendor Selection first.' },
  6: { icon: '📦', message: 'No PO issued yet. Complete Purchase Order step first.' },
  7: { icon: '📦', message: 'No GRN recorded yet. Complete Goods Receipt first, then submit vendor invoice.' },
  8: { icon: '🔍', message: '3-Way Match is not available yet. Submit an invoice first.' },
  9: { icon: '⚖️', message: 'No dispute detected. 3-Way Match will route here if quantities mismatch.' },
  10: { icon: '🏦', message: 'Finance Approval is not available yet. Complete 3-Way Match first.' },
  11: { icon: '💳', message: 'Payment not available yet. Complete Finance Approval first.' },
}

const STEP_COMPONENTS: Record<number, React.FC> = {
  1: Step1Request,
  2: Step2Approval,
  3: VendorQuotes,
  4: Step3RFP,
  5: Step4PO,
  6: Step5GRN,
  7: Step6Invoice,
  8: Step7Match,
  9: Step8Dispute,
  10: Step9Finance,
  11: Step10Payment,
}

function EmptyState({ step }: { step: number }) {
  const config = EMPTY_STATES[step]
  if (!config) return null
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6 animate-fade-in">
      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
        <span className="text-2xl">{config.icon}</span>
      </div>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-medium">{config.message}</p>
    </div>
  )
}

function StepContent({ stepId }: { stepId: number }) {
  const { state } = useProcurement()
  const current = state.currentStep
  const isCurrent = stepId === current
  const isComplete = stepId < current
  const isFuture = stepId > current
  const disputeActive = state.matchStatus === 'mismatched' && current === 9
  const step = STEPS.find(s => s.id === stepId)!
  const Component = STEP_COMPONENTS[stepId]

  return (
    <div className="animate-slide-in-right" key={stepId}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isComplete ? 'bg-emerald-100' : isCurrent ? 'bg-indigo-100' : 'bg-slate-100'
          }`}>
            <step.icon className={`w-5 h-5 ${
              isComplete ? 'text-emerald-600' : isCurrent ? 'text-indigo-600' : 'text-slate-400'
            }`} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Step {stepId} of {TOTAL_STEPS}</p>
            <h2 className="text-lg font-bold text-slate-900">{step.title}</h2>
          </div>
        </div>
        {isComplete && <Badge variant="success" className="rounded-full px-3">✓ Completed</Badge>}
        {isCurrent && <Badge className="rounded-full px-3 bg-indigo-100 text-indigo-700 border-indigo-200">● Active</Badge>}
        {isFuture && !(stepId === 9 && disputeActive) && <Badge variant="secondary" className="rounded-full px-3">Locked</Badge>}
      </div>

      {isFuture && !(stepId === 9 && disputeActive) && <EmptyState step={stepId} />}
      {(isCurrent || isComplete || (stepId === 9 && disputeActive)) && (
        <div className="animate-fade-in">{Component && <Component />}</div>
      )}
    </div>
  )
}

function Layout() {
  const { state, resetAll } = useProcurement()
  const current = state.currentStep
  const [selected, setSelected] = useState(current)
  const [showHistory, setShowHistory] = useState(false)
  const isFinished = state.paymentApproved

  useEffect(() => { setSelected(current) }, [current])

  const progressPercent = isFinished ? 100 : ((current - 1) / TOTAL_STEPS) * 100

  if (showHistory) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header
          progressPercent={progressPercent}
          current={current}
          isFinished={isFinished}
          onReset={resetAll}
          historyCount={state.history.length}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(false)}
        />
        <HistoryView history={state.history} onBack={() => setShowHistory(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        progressPercent={progressPercent}
        current={current}
        isFinished={isFinished}
        onReset={resetAll}
        historyCount={state.history.length}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r border-slate-200/60 flex-shrink-0 overflow-y-auto">
          <div className="p-3 pt-4 space-y-0.5">
            {STEPS.map((step) => {
              const isComplete = step.id < current || isFinished
              const isCurrent = step.id === current && !isFinished
              const isSelected = step.id === selected
              const Icon = step.icon
              return (
                <button key={step.id} onClick={() => setSelected(step.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                    isSelected ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'
                  }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                    isComplete ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' :
                    isCurrent ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' :
                    isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isComplete ? '✓' : step.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold truncate ${
                      isSelected ? 'text-indigo-700' : isComplete ? 'text-slate-700' : isCurrent ? 'text-slate-800' : 'text-slate-400'
                    }`}>{step.title}</p>
                    <p className={`text-[11px] truncate ${
                      isComplete ? 'text-emerald-500' : isCurrent ? 'text-indigo-400' : isSelected ? 'text-indigo-400' : 'text-slate-300'
                    }`}>{isComplete ? 'Completed' : isCurrent ? 'In progress' : step.subtitle}</p>
                  </div>
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isSelected ? 'text-indigo-400' : isComplete ? 'text-emerald-300' : isCurrent ? 'text-indigo-300' : 'text-slate-200'
                  }`} />
                </button>
              )
            })}
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8">
            <StepContent stepId={selected} />
          </div>
        </main>
      </div>
    </div>
  )
}

function Header({ progressPercent, current, isFinished, onReset, historyCount, showHistory, onToggleHistory }: {
  progressPercent: number; current: number; isFinished: boolean; onReset: () => void;
  historyCount: number; showHistory: boolean; onToggleHistory: () => void;
}) {
  return (
    <header className="glass border-b border-slate-200/60 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
          <ShoppingCart className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-sm tracking-tight">Procurement Workflow</h1>
          <p className="text-[11px] text-slate-400 font-medium">MVP Simulation</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!showHistory && (
          <div className="flex items-center gap-2.5">
            <div className="w-32 h-2 bg-slate-200/80 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-xs text-slate-500 font-semibold tabular-nums">
              {isFinished ? TOTAL_STEPS : current - 1}/{TOTAL_STEPS}
            </span>
          </div>
        )}
        <button onClick={onToggleHistory}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors font-medium relative">
          <History className="w-3.5 h-3.5" />
          {showHistory ? 'Workflow' : 'History'}
          {historyCount > 0 && !showHistory && (
            <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>
        {!showHistory && (current > 1 || isFinished) && (
          <button onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>
    </header>
  )
}

export default function App() {
  return (
    <ProcurementProvider>
      <ToastProvider>
        <Layout />
      </ToastProvider>
    </ProcurementProvider>
  )
}
