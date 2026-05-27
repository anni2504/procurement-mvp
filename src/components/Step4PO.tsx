import { useProcurement, getPurchaseOrder, getStepStatus } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step4PO() {
  const { state, generatePO, approvePO } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 5) === 'completed'
  const po = getPurchaseOrder(state.activeWorkflow)

  const handleGenerate = async () => {
    try {
      await generatePO()
      showToast('Purchase Order generated successfully', 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const handleApprove = async () => {
    try {
      await approvePO()
      showToast('PO approved and sent to vendor', 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Shared PO Details Card ───
  const renderPOCard = () => {
    if (!po) return null
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Purchase Order</p>
            <p className="text-lg font-bold text-slate-800">{po.poNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Date Issued</p>
            <p className="font-medium text-slate-700">{new Date(po.issuedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Vendor Details</p>
              <p className="text-sm font-semibold text-slate-800">{po.vendorName}</p>
              <p className="text-xs text-slate-500">{po.vendorEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">Shipping To</p>
              <p className="text-sm font-medium text-slate-800">Main Warehouse</p>
              <p className="text-xs text-slate-500">123 Logistics Way</p>
            </div>
          </div>

          <Separator />

          {/* Line Items Table */}
          <div>
            <div className="grid grid-cols-12 text-xs font-semibold text-slate-400 pb-2 border-b">
              <div className="col-span-6">Item Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="grid grid-cols-12 text-sm text-slate-700 py-3 border-b border-slate-100">
              <div className="col-span-6 font-medium">{po.itemName}</div>
              <div className="col-span-2 text-right">{po.quantity}</div>
              <div className="col-span-2 text-right">₹{po.unitPrice.toLocaleString()}</div>
              <div className="col-span-2 text-right font-bold text-slate-800">
                ₹{po.totalAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">₹{po.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax (0%)</span>
                <span className="font-medium">₹0</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="font-bold text-indigo-700">₹{po.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Completed View ───
  if (isComplete) {
    return (
      <div className="space-y-5 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">✓</span></div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">PO Approved & Sent</p>
              <p className="text-xs text-emerald-600">Vendor has been notified via email</p>
            </div>
          </div>
          <Badge variant="success" className="rounded-full">Active PO</Badge>
        </div>
        {renderPOCard()}
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-5 stagger-children">
      {!po ? (
        <div className="text-center py-8 bg-slate-50 border border-slate-200 border-dashed rounded-xl space-y-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
            <span className="text-xl">📄</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800">Ready to Generate Purchase Order</p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Click below to automatically draft the PO using the selected vendor's quote.
            </p>
          </div>
          <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-6">
            Generate PO Draft
          </Button>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-800">Draft PO Generated</p>
              <p className="text-xs text-amber-600">Review the details below and approve to send to the vendor.</p>
            </div>
            <Badge variant="warning" className="rounded-full">Draft</Badge>
          </div>

          {renderPOCard()}

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => {}} className="h-11 border-slate-300 text-slate-600">
              Edit Draft
            </Button>
            <Button onClick={handleApprove} className="h-11 bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm shadow-emerald-200">
              ✓ Approve & Send to Vendor
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
