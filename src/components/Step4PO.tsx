import { useEffect } from 'react'
import { useProcurement } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step4PO() {
  const { state, generatePO, approvePO } = useProcurement()
  const { showToast } = useToast()
  const { purchaseOrder } = state
  const isComplete = state.currentStep > 5

  useEffect(() => {
    if (!purchaseOrder && state.request && state.selectedVendor) generatePO()
  }, [])

  const handleApprove = () => {
    approvePO()
    showToast(`PO ${purchaseOrder?.poNumber} sent to vendor`, 'success')
  }

  if (!purchaseOrder) {
    return <div className="flex items-center justify-center py-12 animate-pulse-soft"><p className="text-sm text-slate-400">Generating PO...</p></div>
  }

  return (
    <div className="space-y-4 stagger-children">
      {isComplete ? (
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">📄</span></div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">PO Issued & Locked</p>
            <p className="text-xs text-emerald-600">Sent to {purchaseOrder.vendorName}</p>
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
          <strong>Review PO</strong> — Once approved, this document is locked.
        </div>
      )}
      <div className="bg-slate-50 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Purchase Order</span>
          <Badge className="rounded-full font-mono text-xs bg-indigo-100 text-indigo-700 border-indigo-200">{purchaseOrder.poNumber}</Badge>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-slate-400">Item</span><span className="text-right font-medium">{purchaseOrder.itemName}</span>
          <span className="text-slate-400">Quantity</span><span className="text-right font-medium">{purchaseOrder.quantity} units</span>
          <span className="text-slate-400">Unit Price</span><span className="text-right font-medium">₹{purchaseOrder.unitPrice.toLocaleString()}</span>
          <span className="text-slate-400">Vendor</span><span className="text-right font-medium">{purchaseOrder.vendorName}</span>
          <span className="text-slate-400">Email</span><span className="text-right font-medium text-slate-500">{purchaseOrder.vendorEmail}</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">Total Amount</span>
          <span className="text-lg font-bold text-indigo-600">₹{purchaseOrder.totalAmount.toLocaleString()}</span>
        </div>
      </div>
      {state.poAmendment && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase">PO Amendment</span>
            <Badge variant="warning" className="rounded-full font-mono text-[10px]">{state.poAmendment.amendmentNumber}</Badge>
          </div>
          <p className="text-sm text-amber-800">Qty: <strong>{state.poAmendment.originalQuantity}</strong> → <strong>{state.poAmendment.newQuantity}</strong></p>
          <p className="text-xs text-amber-600">Reason: {state.poAmendment.reason}</p>
        </div>
      )}
      {isComplete && <p className="text-xs text-slate-400 text-center">🔒 Locked — corrections via PO Amendment only</p>}
      {!isComplete && (
        <Button onClick={handleApprove} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold">
          Approve & Send PO to Vendor →
        </Button>
      )}
    </div>
  )
}
