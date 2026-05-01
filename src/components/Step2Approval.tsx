import { useProcurement } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step2Approval() {
  const { state, approveRequest, rejectRequest } = useProcurement()
  const { showToast } = useToast()
  const r = state.request
  const isComplete = state.currentStep > 2

  if (!r) return null

  const handleApprove = () => {
    approveRequest()
    showToast('Request approved — forwarded to Procurement for RFP', 'success')
  }

  const handleReject = () => {
    rejectRequest()
    showToast('Request rejected — returned to requester', 'warning')
  }

  // ─── Completed View ───
  if (isComplete) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <span className="text-lg">✓</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Request Approved</p>
            <p className="text-xs text-emerald-600">Forwarded to Procurement for vendor selection</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div><span className="text-slate-400">Item</span></div>
            <div className="text-right font-medium">{r.itemName}</div>
            <div><span className="text-slate-400">Category</span></div>
            <div className="text-right font-medium">{r.category}</div>
            <div><span className="text-slate-400">Quantity</span></div>
            <div className="text-right font-medium">{r.quantity} units</div>
            <div><span className="text-slate-400">Unit Price</span></div>
            <div className="text-right font-medium">₹{r.unitPrice.toLocaleString()}</div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">Total Value</span>
            <span className="text-lg font-bold text-indigo-600">₹{(r.quantity * r.unitPrice).toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-4 stagger-children">
      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        <strong>Review Required</strong> — A new procurement request needs your approval before it can proceed to vendor selection.
      </div>

      <div className="bg-slate-50 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Request Summary</span>
          <Badge variant="warning" className="rounded-full">Pending Review</Badge>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div><span className="text-slate-400">Item</span></div>
          <div className="text-right font-medium">{r.itemName}</div>
          <div><span className="text-slate-400">Category</span></div>
          <div className="text-right font-medium">{r.category}</div>
          <div><span className="text-slate-400">Quantity</span></div>
          <div className="text-right font-medium">{r.quantity} units</div>
          <div><span className="text-slate-400">Unit Price</span></div>
          <div className="text-right font-medium">₹{r.unitPrice.toLocaleString()}</div>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">Total Value</span>
          <span className="text-lg font-bold text-indigo-600">₹{(r.quantity * r.unitPrice).toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        <strong>Justification:</strong> {r.justification}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleReject} className="h-11 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-semibold">
          ✕ Reject
        </Button>
        <Button onClick={handleApprove} className="h-11 bg-emerald-600 hover:bg-emerald-700 font-semibold">
          ✓ Approve Request
        </Button>
      </div>
    </div>
  )
}
