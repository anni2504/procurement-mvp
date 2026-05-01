import { useState, useEffect } from 'react'
import { ProcurementProvider, useProcurement } from './context/ProcurementContext'
import { ToastProvider } from './context/ToastContext'
import Step1Request from './components/Step1Request'
import Step2Approval from './components/Step2Approval'
import Step3RFP from './components/Step3RFP'
import Step4PO from './components/Step4PO'
import Step5GRN from './components/Step5GRN'
import Step6Invoice from './components/Step6Invoice'
import Step7Match from './components/Step7Match'
import Step8Dispute from './components/Step8Dispute'
import Step9Finance from './components/Step9Finance'
import Step10Payment from './components/Step10Payment'
import { Badge } from './components/ui/badge'
import {
  ClipboardList, CheckCircle, FileText, ShoppingCart,
  Package, Receipt, GitCompare, AlertTriangle, CreditCard, Banknote,
  RotateCcw
} from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Procurement Request', subtitle: 'Raise requisition', icon: ClipboardList },
  { id: 2, title: 'Manager Approval', subtitle: 'Review & approve', icon: CheckCircle },
  { id: 3, title: 'RFP & Vendor Selection', subtitle: 'Evaluate vendors', icon: FileText },
  { id: 4, title: 'Purchase Order', subtitle: 'Generate & send PO', icon: ShoppingCart },
  { id: 5, title: 'Goods Receipt / GRN', subtitle: 'Record delivery', icon: Package },
  { id: 6, title: 'Invoice Submission', subtitle: 'Vendor invoice', icon: Receipt },
  { id: 7, title: '3-Way Match', subtitle: 'Validate quantities', icon: GitCompare },
  { id: 8, title: 'Dispute Resolution', subtitle: 'Resolve mismatches', icon: AlertTriangle },
  { id: 9, title: 'Finance Approval', subtitle: 'Approve payment', icon: CreditCard },
  { id: 10, title: 'Payment', subtitle: 'Process & close', icon: Banknote },
]

const EMPTY_STATES: Record<number, { icon: string; message: string }> = {
  2: { icon: '📋', message: 'No request submitted yet. Complete the Procurement Request first.' },
  3: { icon: '✅', message: 'No approved request yet. Complete Manager Approval first.' },
  4: { icon: '🏢', message: 'No vendor selected yet. Complete RFP & Vendor Selection first to generate the PO.' },
  5: { icon: '📦', message: 'No PO issued yet. Complete Purchase Order step first.' },
  6: { icon: '📦', message: 'No GRN recorded yet. Complete Goods Receipt first, then submit vendor invoice.' },
  7: { icon: '🔍', message: '3-Way Match is not available yet. Submit an invoice first.' },
  8: { icon: '⚖️', message: 'No dispute detected. 3-Way Match will route here automatically if quantities mismatch.' },
  9: { icon: '🏦', message: 'Finance Approval is not available yet. Complete 3-Way Match first.' },
  10: { icon: '💳', message: 'Payment not available yet. Complete Finance Approval first.' },
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
      <div className="mt-4 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
      </div>
    </div>
  )
}

function StepContent({ stepId }: { stepId: number }) {
  const { state } = useProcurement()
  const current = state.currentStep
  const isCurrent = stepId === current
  const isComplete = stepId < current
  const isFuture = stepId > current
  const disputeActive = state.matchStatus === 'mismatched' && current === 8
  const step = STEPS.find(s => s.id === stepId)!

  return (
    <div className="animate-slide-in-right" key={stepId}>
      {/* Step Header */}
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
            <p className="text-xs text-slate-400 font-medium">Step {stepId} of 10</p>
            <h2 className="text-lg font-bold text-slate-900">{step.title}</h2>
          </div>
        </div>
        {isComplete && <Badge variant="success" className="rounded-full px-3">✓ Completed</Badge>}
        {isCurrent && <Badge className="rounded-full px-3 bg-indigo-100 text-indigo-700 border-indigo-200">● Active</Badge>}
        {isFuture && !(stepId === 8 && disputeActive) && <Badge variant="secondary" className="rounded-full px-3">Locked</Badge>}
      </div>

      {/* Step Body */}
      {isFuture && !(stepId === 8 && disputeActive) && <EmptyState step={stepId} />}

      {(isCurrent || isComplete || (stepId === 8 && disputeActive)) && (
        <div className="animate-fade-in">
          {stepId === 1 && <Step1Request />}
          {stepId === 2 && <Step2Approval />}
          {stepId === 3 && <Step3RFP />}
          {stepId === 4 && <Step4PO />}
          {stepId === 5 && <Step5GRN />}
          {stepId === 6 && <Step6Invoice />}
          {stepId === 7 && <Step7Match />}
          {stepId === 8 && <Step8Dispute />}
          {stepId === 9 && <Step9Finance />}
          {stepId === 10 && <Step10Payment />}
        </div>
      )}
    </div>
  )
}

function Layout() {
  const { state, resetAll } = useProcurement()
  const current = state.currentStep
  const [selected, setSelected] = useState(current)
  const isFinished = state.paymentApproved

  useEffect(() => {
    setSelected(current)
  }, [current])

  const progressPercent = isFinished ? 100 : ((current - 1) / 10) * 100

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ─── Top Bar ─── */}
      <header className="glass border-b border-slate-200/60 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <ShoppingCart className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm tracking-tight">Procurement Workflow</h1>
            <p className="text-[11px] text-slate-400 font-medium">MVP Simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-32 h-2 bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold tabular-nums">
              {isFinished ? '10' : current - 1}/10
            </span>
          </div>
          {(current > 1 || isFinished) && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
              title="Reset workflow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ─── */}
        <aside className="w-64 bg-white border-r border-slate-200/60 flex-shrink-0 overflow-y-auto">
          <div className="p-3 pt-4 space-y-0.5">
            {STEPS.map((step) => {
              const isComplete = step.id < current || isFinished
              const isCurrent = step.id === current && !isFinished
              const isFuture = step.id > current && !isFinished
              const isSelected = step.id === selected
              const Icon = step.icon

              return (
                <button
                  key={step.id}
                  id={`sidebar-step-${step.id}`}
                  onClick={() => setSelected(step.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                    isSelected
                      ? 'bg-indigo-50 shadow-sm'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Step Number Circle */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-200 ${
                    isComplete
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : isSelected
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isComplete ? '✓' : step.id}
                  </div>

                  {/* Step Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold truncate transition-colors ${
                      isSelected ? 'text-indigo-700' :
                      isComplete ? 'text-slate-700' :
                      isCurrent ? 'text-slate-800' :
                      'text-slate-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-[11px] truncate ${
                      isComplete ? 'text-emerald-500' :
                      isCurrent ? 'text-indigo-400' :
                      isSelected ? 'text-indigo-400' :
                      'text-slate-300'
                    }`}>
                      {isComplete ? 'Completed' : isCurrent ? 'In progress' : step.subtitle}
                    </p>
                  </div>

                  {/* Step Icon */}
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                    isSelected ? 'text-indigo-400' :
                    isComplete ? 'text-emerald-300' :
                    isCurrent ? 'text-indigo-300' :
                    'text-slate-200'
                  }`} />
                </button>
              )
            })}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-8 py-8">
            <StepContent stepId={selected} />
          </div>
        </main>
      </div>
    </div>
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
