import { useProcurement, getPurchaseOrder, getInvoice, getPaymentApproved, getStepStatus } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function Step10Payment() {
  const { state, processPayment } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 12) === 'completed'
  const po = getPurchaseOrder(state.activeWorkflow)
  const inv = getInvoice(state.activeWorkflow)

  if (!po || !inv) return null

  const handleProcess = async () => {
    try {
      await processPayment()
      showToast('Payment processed. Procurement workflow complete!', 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Completed View ───
  if (isComplete) {
    return (
      <div className="space-y-6 stagger-children">
        <div className="bg-indigo-600 text-white rounded-xl p-8 text-center shadow-lg relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-lg"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Workflow Completed!</h2>
            <p className="text-indigo-100 max-w-md mx-auto text-sm">
              Payment of <strong className="text-white">₹{inv.billedAmount.toLocaleString()}</strong> has been processed for <strong className="text-white">{po.vendorName}</strong>. This procurement lifecycle is now officially closed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Reference Numbers</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">PO Number:</span><span className="font-semibold text-slate-800">{po.poNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Invoice No:</span><span className="font-semibold text-slate-800">{inv.invoiceNumber}</span></div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Status</p>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="px-3 py-1">Closed & Paid</Badge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-6 stagger-children">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Final Step</p>
          <h3 className="text-2xl font-black text-slate-800">Process Payment</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
            Finance has authorized the payment. Click below to process the transfer and close this procurement request.
          </p>
        </div>

        <div className="inline-block bg-white border border-slate-200 rounded-xl p-4 mt-2 shadow-sm text-left min-w-[280px]">
          <p className="text-xs text-slate-400 mb-1">Payment Amount</p>
          <p className="text-3xl font-black text-indigo-700 mb-3">₹{inv.billedAmount.toLocaleString()}</p>
          <hr className="mb-3 border-slate-200" />
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">To Vendor:</span>
            <span className="font-semibold text-slate-800">{po.vendorName}</span>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleProcess} className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 h-12 shadow-lg shadow-indigo-200/50 text-base">
            Process Payment & Close →
          </Button>
        </div>
      </div>
    </div>
  )
}
