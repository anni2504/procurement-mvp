import { useProcurement } from '../context/ProcurementContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step10Payment() {
  const { state, resetAll } = useProcurement()
  const { purchaseOrder, invoice, completedAt } = state
  if (!purchaseOrder || !invoice) return null

  const dateStr = completedAt
    ? new Date(completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-5 stagger-children">
      {/* Success Banner */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-extrabold text-emerald-700">Payment Processed!</h3>
        <p className="text-sm text-emerald-600 mt-2 font-medium">
          Procurement workflow completed successfully
        </p>
      </div>

      {/* Transaction Summary */}
      <div className="bg-slate-50 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Transaction Summary</span>
          <Badge variant="success" className="rounded-full">PAID</Badge>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-slate-400">PO Number</span>
          <span className="text-right font-mono font-bold">{purchaseOrder.poNumber}</span>
          <span className="text-slate-400">Invoice</span>
          <span className="text-right font-mono">{invoice.invoiceNumber}</span>
          <span className="text-slate-400">Vendor</span>
          <span className="text-right font-medium">{purchaseOrder.vendorName}</span>
          <span className="text-slate-400">Item</span>
          <span className="text-right font-medium">{purchaseOrder.itemName}</span>
          <span className="text-slate-400">Quantity</span>
          <span className="text-right font-medium">{invoice.billedQuantity} units</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-700">Amount Paid</span>
          <span className="text-xl font-extrabold text-emerald-600">₹{invoice.billedAmount.toLocaleString()}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center font-medium">
        Transaction closed • {dateStr}
      </p>

      <Button variant="outline" onClick={resetAll} className="w-full h-11 font-semibold">
        ↺ Start New Procurement
      </Button>
    </div>
  )
}
