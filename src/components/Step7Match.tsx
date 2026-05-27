import { useProcurement, getPurchaseOrder, getGRN, getInvoice, getPOAmendment, getStepStatus, getMatchStatus } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step7Match() {
  const { state, runMatch } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 9) === 'completed'
  const matchStatus = getMatchStatus(state.activeWorkflow)
  const po = getPurchaseOrder(state.activeWorkflow)
  const grn = getGRN(state.activeWorkflow)
  const inv = getInvoice(state.activeWorkflow)
  const amendment = getPOAmendment(state.activeWorkflow)

  const handleRun = async () => {
    try {
      await runMatch()
      showToast('3-Way Match completed', 'info')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  if (!po || !grn || !inv) return null

  const effectivePOQty = amendment ? amendment.newQuantity : po.quantity

  const renderComparison = () => (
    <div className="grid grid-cols-3 gap-4">
      {/* PO Column */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative">
        {amendment && (
          <div className="absolute -top-3 -right-3">
            <Badge variant="warning" className="shadow-sm">Amended</Badge>
          </div>
        )}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">PO Quantity</p>
        <p className="text-2xl font-black text-slate-800">{effectivePOQty}</p>
        <p className="text-xs text-slate-500 mt-1">{amendment ? `PO Amended` : po.poNumber}</p>
      </div>
      
      {/* GRN Column */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Received Qty</p>
        <p className={`text-2xl font-black ${grn.receivedQuantity === effectivePOQty ? 'text-slate-800' : 'text-amber-600'}`}>
          {grn.receivedQuantity}
        </p>
        <p className="text-xs text-slate-500 mt-1">Goods Receipt</p>
      </div>

      {/* Invoice Column */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Billed Qty</p>
        <p className={`text-2xl font-black ${inv.billedQuantity === effectivePOQty && inv.billedQuantity === grn.receivedQuantity ? 'text-slate-800' : 'text-amber-600'}`}>
          {inv.billedQuantity}
        </p>
        <p className="text-xs text-slate-500 mt-1">{inv.invoiceNumber}</p>
      </div>
    </div>
  )

  // ─── Completed View ───
  if (isComplete) {
    if (matchStatus === 'matched') {
      return (
        <div className="space-y-6 stagger-children">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-lg font-bold text-emerald-900">Match Successful</h3>
            <p className="text-sm text-emerald-700 mt-1">PO, Goods Receipt, and Invoice quantities align perfectly.</p>
          </div>
          {renderComparison()}
        </div>
      )
    }
    
    if (matchStatus === 'mismatched') {
      return (
        <div className="space-y-6 stagger-children">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✕</span>
            </div>
            <h3 className="text-lg font-bold text-red-900">Discrepancy Detected</h3>
            <p className="text-sm text-red-700 mt-1">Quantities do not match. Escalated to Discrepancy Resolution.</p>
          </div>
          {renderComparison()}
        </div>
      )
    }
  }

  // ─── Active View ───
  return (
    <div className="space-y-6 stagger-children">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
          <span className="text-xl">⚖️</span>
        </div>
        <div>
          <p className="font-semibold text-slate-800">Ready for 3-Way Match</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            System will automatically compare the Purchase Order, Goods Receipt Note, and Vendor Invoice for alignment.
          </p>
        </div>
        
        <Button onClick={handleRun} className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-8 mt-2 shadow-md shadow-indigo-200">
          Run Automated Match
        </Button>
      </div>
      
      {renderComparison()}
    </div>
  )
}
