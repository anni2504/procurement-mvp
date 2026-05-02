import { useProcurement } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step9Finance() {
  const { state, approvePayment, rejectPayment } = useProcurement()
  const { showToast } = useToast()
  const { purchaseOrder, invoice, financeApproved } = state
  const isComplete = state.currentStep > 10

  if (!purchaseOrder || !invoice) return null

  const handleApprove = () => {
    approvePayment()
    showToast('Payment approved by Finance — processing payment', 'success')
  }

  const handleReject = () => {
    rejectPayment()
    showToast('Payment rejected by Finance — invoice placed on hold', 'error')
  }

  // ─── Completed View ───
  if (isComplete) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">✓</span></div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Finance Approved</p>
            <p className="text-xs text-emerald-600">Payment authorized for processing</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-slate-400">PO Number</span><span className="text-right font-mono font-bold">{purchaseOrder.poNumber}</span>
            <span className="text-slate-400">Invoice</span><span className="text-right font-mono">{invoice.invoiceNumber}</span>
            <span className="text-slate-400">Vendor</span><span className="text-right font-medium">{purchaseOrder.vendorName}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">Approved Amount</span>
            <span className="text-lg font-bold text-emerald-600">₹{invoice.billedAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-4 stagger-children">
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700 font-medium">
        ✓ 3-Way Match passed — invoice is ready for finance approval
      </div>

      {financeApproved === false && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium animate-fade-in">
          ✕ Previously rejected — review and reconsider
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Payment Request</span>
          <Badge variant="warning" className="rounded-full">Pending Approval</Badge>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-slate-400">PO Number</span><span className="text-right font-mono font-bold">{purchaseOrder.poNumber}</span>
          <span className="text-slate-400">Invoice</span><span className="text-right font-mono">{invoice.invoiceNumber}</span>
          <span className="text-slate-400">Vendor</span><span className="text-right font-medium">{purchaseOrder.vendorName}</span>
          <span className="text-slate-400">Quantity</span><span className="text-right font-medium">{invoice.billedQuantity} units</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">Payment Amount</span>
          <span className="text-xl font-bold text-indigo-600">₹{invoice.billedAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleReject}
          className="h-11 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold">
          ✕ Reject
        </Button>
        <Button onClick={handleApprove} className="h-11 bg-emerald-600 hover:bg-emerald-700 font-semibold">
          ✓ Approve Payment
        </Button>
      </div>
    </div>
  )
}
