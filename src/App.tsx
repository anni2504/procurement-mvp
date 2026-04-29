import { useState, useEffect } from 'react'
import { ProcurementProvider, useProcurement } from './context/ProcurementContext'
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
import {
  ClipboardList, CheckCircle, FileText, ShoppingCart,
  Package, Receipt, GitCompare, AlertTriangle, CreditCard, Banknote
} from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Procurement Request', icon: ClipboardList },
  { id: 2, title: 'Manager Approval', icon: CheckCircle },
  { id: 3, title: 'RFP & Vendor Selection', icon: FileText },
  { id: 4, title: 'Purchase Order', icon: ShoppingCart },
  { id: 5, title: 'Goods Receipt / GRN', icon: Package },
  { id: 6, title: 'Invoice Submission', icon: Receipt },
  { id: 7, title: '3-Way Match', icon: GitCompare },
  { id: 8, title: 'Dispute Resolution', icon: AlertTriangle },
  { id: 9, title: 'Finance Approval', icon: CreditCard },
  { id: 10, title: 'Payment', icon: Banknote },
]

const EMPTY_STATES: Record<number, string> = {
  2: 'No request submitted yet. Complete the Procurement Request first.',
  3: 'No approved request yet. Complete Manager Approval first.',
  4: 'No vendor selected yet. Complete RFP & Vendor Selection first to generate the PO.',
  5: 'No PO issued yet. Complete Purchase Order step first.',
  6: 'No GRN recorded yet. Complete Goods Receipt first, then submit vendor invoice.',
  7: '3-Way Match is not available yet. Submit an invoice first.',
  8: 'No dispute detected. 3-Way Match will route here automatically if quantities mismatch.',
  9: 'Finance Approval is not available yet. Complete 3-Way Match first.',
  10: 'Payment not processed yet. Complete Finance Approval first.',
}

function EmptyState({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-6">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">⏳</span>
      </div>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed">{EMPTY_STATES[step]}</p>
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-1">Step {stepId} of 10</p>
          <h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
        </div>
        {isComplete && (
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">✓ Completed</span>
        )}
        {isCurrent && (
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">● In Progress</span>
        )}
        {isFuture && (
          <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">🔒 Pending</span>
        )}
      </div>

      {isFuture && !(stepId === 8 && disputeActive) && <EmptyState step={stepId} />}

      {(isCurrent || isComplete || (stepId === 8 && disputeActive)) && (
        <>
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
        </>
      )}
    </div>
  )
}

function Layout() {
  const { state } = useProcurement()
  const current = state.currentStep
  const [selected, setSelected] = useState(1)

  // Auto-advance sidebar to next step when workflow progresses
  useEffect(() => {
    setSelected(current)
  }, [current])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Procurement MVP</p>
            <p className="text-xs text-gray-400">Workflow Simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(current / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">{current}/10</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <div className="p-3 space-y-0.5 pt-4">
            {STEPS.map((step) => {
              const isComplete = step.id < current
              const isCurrent = step.id === current
              const isFuture = step.id > current
              const isSelected = step.id === selected
              const Icon = step.icon

              return (
                <button
                  key={step.id}
                  onClick={() => setSelected(step.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                    isComplete ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isComplete ? '✓' : step.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${
                      isSelected ? 'text-blue-700' : isFuture ? 'text-gray-400' : 'text-gray-800'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      isComplete ? 'text-green-500' : isCurrent ? 'text-blue-400' : 'text-gray-300'
                    }`}>
                      {isComplete ? 'Completed' : isCurrent ? 'In progress' : 'Pending'}
                    </p>
                  </div>
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-400' : 'text-gray-200'}`} />
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
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
      <Layout />
    </ProcurementProvider>
  )
}
