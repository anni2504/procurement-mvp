import { useProcurement, getPurchaseOrder, getInvoice, getPOAmendment, getFinanceApproved, getStepStatus } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step9Finance() {
  const { state, approveFinance, rejectFinance } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 11) === 'completed'
  const approved = getFinanceApproved(state.activeWorkflow)
  const po = getPurchaseOrder(state.activeWorkflow)
  const inv = getInvoice(state.activeWorkflow)
  const amendment = getPOAmendment(state.activeWorkflow)

  if (!po || !inv) return null

  const handleApprove = async () => {
    try {
      await approveFinance()
      showToast('Payment authorized successfully', 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const handleReject = async () => {
    try {
      await rejectFinance()
      showToast('Payment authorization rejected', 'warning')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Shared Summary Card ───
  const renderSummaryCard = () => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Transaction Summary</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-400">Vendor:</span> <span className="font-semibold text-slate-800 ml-1">{po.vendorName}</span></div>
          <div className="text-right"><span className="text-slate-400">Item:</span> <span className="font-medium text-slate-800 ml-1">{po.itemName}</span></div>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Original PO Amount:</span>
            <span className="font-medium text-slate-800">₹{po.totalAmount.toLocaleString()}</span>
          </div>
          {amendment && (
            <div className="flex justify-between text-indigo-700">
              <span>Amended PO Amount:</span>
              <span className="font-medium">₹{(amendment.newQuantity * po.unitPrice).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice Amount:</span>
            <span className="font-medium text-slate-800">₹{inv.billedAmount.toLocaleString()}</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-800">Final Authorized Amount:</span>
          <span className="text-xl font-black text-indigo-700">₹{inv.billedAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  // ─── Completed View ───
  if (isComplete || approved === false) {
    if (approved === false) {
      return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><span className="text-lg">✕</span></div>
          <div>
            <p className="text-sm font-semibold text-red-800">Payment Authorization Rejected</p>
            <p className="text-xs text-red-600">Please review the discrepancy.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-5 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">✓</span></div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Payment Authorized</p>
              <p className="text-xs text-emerald-600">Ready for final processing</p>
            </div>
          </div>
          <Badge variant="success" className="rounded-full">Authorized</Badge>
        </div>
        {renderSummaryCard()}
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-5 stagger-children">
      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-sm flex gap-3">
        <span className="text-amber-600 text-lg">⚠️</span>
        <div>
          <p className="font-semibold text-amber-800">Finance Authorization Required</p>
          <p className="text-amber-700/80 mt-0.5">Please review the transaction summary below and authorize the payment. This action cannot be undone.</p>
        </div>
      </div>

      {renderSummaryCard()}

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button variant="outline" onClick={handleReject} className="h-11 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold">
          ✕ Reject Authorization
        </Button>
        <Button onClick={handleApprove} className="h-11 bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm shadow-emerald-200">
          ✓ Authorize Payment
        </Button>
      </div>
    </div>
  )
}
