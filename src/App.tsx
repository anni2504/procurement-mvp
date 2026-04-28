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
  { id: 1, title: 'Procurement Request', desc: 'Raise a request for goods or services', icon: ClipboardList, component: Step1Request },
  { id: 2, title: 'Manager Approval', desc: 'Review and approve the request', icon: CheckCircle, component: Step2Approval },
  { id: 3, title: 'RFP & Vendor Selection', desc: 'Add vendor quotes and select vendor', icon: FileText, component: Step3RFP },
  { id: 4, title: 'Purchase Order', desc: 'Generate and approve PO', icon: ShoppingCart, component: Step4PO },
  { id: 5, title: 'Goods Receipt (GRN)', desc: 'Record what was actually delivered', icon: Package, component: Step5GRN },
  { id: 6, title: 'Invoice Submission', desc: 'Vendor submits invoice for payment', icon: Receipt, component: Step6Invoice },
  { id: 7, title: '3-Way Match', desc: 'Verify PO vs GRN vs Invoice', icon: GitCompare, component: Step7Match },
  { id: 8, title: 'Dispute Resolution', desc: 'Resolve any mismatches found', icon: AlertTriangle, component: Step8Dispute },
  { id: 9, title: 'Finance Approval', desc: 'Finance reviews and approves payment', icon: CreditCard, component: Step9Finance },
  { id: 10, title: 'Payment & Close', desc: 'Process payment and close transaction', icon: Banknote, component: Step10Payment },
]

function Workflow() {
  const { state } = useProcurement()
  const current = state.currentStep

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Procurement Workflow</h1>
            <p className="text-xs text-gray-400">MVP Simulation</p>
          </div>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            Step {current} / {STEPS.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-blue-500 transition-all duration-500"
            style={{ width: `${(current / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {STEPS.map((step) => {
          const isActive = step.id === current
          const isComplete = step.id < current
          const isLocked = step.id > current
          const Icon = step.icon
          const Component = step.component

          return (
            <div
              key={step.id}
              className={`rounded-xl border bg-white transition-all duration-200 overflow-hidden ${
                isActive ? 'border-blue-400 shadow-md' :
                isComplete ? 'border-green-200 opacity-70' :
                'border-gray-200 opacity-35'
              }`}
            >
              {/* Step header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  isActive ? 'bg-blue-600 text-white' :
                  isComplete ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Step {step.id}</span>
                    <span className="text-sm font-semibold text-gray-800">{step.title}</span>
                  </div>
                  <p className="text-xs text-gray-500">{step.desc}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                  isComplete ? 'bg-green-100 text-green-700' :
                  isActive ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isComplete ? 'Done' : isActive ? 'Active' : 'Locked'}
                </span>
              </div>

              {/* Step content - only show when active */}
              {isActive && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <Component />
                </div>
              )}

              {/* Completed summary */}
              {isComplete && step.id === 1 && state.request && (
                <div className="px-4 pb-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  {state.request.itemName} · {state.request.quantity} units · ₹{(state.request.quantity * state.request.unitPrice).toLocaleString()}
                </div>
              )}
              {isComplete && step.id === 3 && state.selectedVendor && (
                <div className="px-4 pb-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  Vendor: {state.selectedVendor.name} · Quote: ₹{state.selectedVendor.quote.toLocaleString()}
                </div>
              )}
              {isComplete && step.id === 4 && state.purchaseOrder && (
                <div className="px-4 pb-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
                  {state.purchaseOrder.poNumber} · ₹{state.purchaseOrder.totalAmount.toLocaleString()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ProcurementProvider>
      <Workflow />
    </ProcurementProvider>
  )
}
