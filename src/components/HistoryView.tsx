import { useState } from 'react'
import { CompletedProcurement } from '../context/ProcurementContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ArrowLeft, X } from 'lucide-react'

interface Props {
  history: CompletedProcurement[]
  onBack: () => void
}

export default function HistoryView({ history, onBack }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = history.find(h => h.id === selectedId)

  // ─── Detail View ───
  if (selected) {
    const p = selected
    return (
      <div className="max-w-2xl mx-auto px-8 py-8 animate-fade-in">
        <button onClick={() => setSelectedId(null)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{p.request.itemName}</h2>
            <p className="text-sm text-slate-400">{p.purchaseOrder.poNumber} • {p.selectedVendor.name}</p>
          </div>
          <Badge variant="success" className="rounded-full px-3">PAID</Badge>
        </div>

        <div className="space-y-4 stagger-children">
          {/* Summary Card */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5 space-y-3">
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-emerald-500">Amount Paid</span>
              <span className="text-right font-bold text-emerald-700 text-lg">₹{p.invoice.billedAmount.toLocaleString()}</span>
              <span className="text-emerald-500">Completed</span>
              <span className="text-right font-medium text-emerald-700">
                {new Date(p.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Step-by-step Details */}
          {[
            { step: 1, title: 'Procurement Request', content: (
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-slate-400">Item</span><span className="text-right font-medium">{p.request.itemName}</span>
                <span className="text-slate-400">Category</span><span className="text-right font-medium">{p.request.category}</span>
                <span className="text-slate-400">Quantity</span><span className="text-right font-medium">{p.request.quantity} units</span>
                <span className="text-slate-400">Budget Price</span><span className="text-right font-medium">₹{p.request.unitPrice.toLocaleString()}/unit</span>
                <span className="text-slate-400">Justification</span><span className="text-right font-medium text-xs">{p.request.justification}</span>
              </div>
            )},
            { step: 2, title: 'Manager Approval', content: <p className="text-sm text-emerald-600 font-medium">✓ Approved</p> },
            { step: 3, title: 'Vendor Quotes', content: (
              <div className="space-y-2">
                {p.allVendors.map((v, i) => (
                  <div key={i} className={`flex justify-between text-sm p-2 rounded-lg ${v.name === p.selectedVendor.name ? 'bg-indigo-50' : ''}`}>
                    <span>{v.name} {v.name === p.selectedVendor.name && <Badge variant="success" className="text-[9px] rounded-full ml-1">Winner</Badge>}</span>
                    <span className="font-bold">₹{v.quote.toLocaleString()}/unit</span>
                  </div>
                ))}
              </div>
            )},
            { step: 5, title: 'Purchase Order', content: (
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-slate-400">PO Number</span><span className="text-right font-mono font-bold">{p.purchaseOrder.poNumber}</span>
                <span className="text-slate-400">Quantity</span><span className="text-right font-medium">{p.purchaseOrder.quantity} units</span>
                <span className="text-slate-400">Unit Price</span><span className="text-right font-medium">₹{p.purchaseOrder.unitPrice.toLocaleString()}</span>
                <span className="text-slate-400">Total</span><span className="text-right font-bold text-indigo-600">₹{p.purchaseOrder.totalAmount.toLocaleString()}</span>
              </div>
            )},
            { step: 6, title: 'Goods Receipt (GRN)', content: (
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-slate-400">Received</span><span className="text-right font-medium">{p.grn.receivedQuantity} units</span>
                <span className="text-slate-400">Condition</span><span className="text-right font-medium">{p.grn.condition}</span>
                {p.grn.notes && <><span className="text-slate-400">Notes</span><span className="text-right text-xs">{p.grn.notes}</span></>}
              </div>
            )},
            { step: 7, title: 'Invoice', content: (
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-slate-400">Invoice</span><span className="text-right font-mono">{p.invoice.invoiceNumber}</span>
                <span className="text-slate-400">Billed Qty</span><span className="text-right font-medium">{p.invoice.billedQuantity} units</span>
                <span className="text-slate-400">Amount</span><span className="text-right font-bold">₹{p.invoice.billedAmount.toLocaleString()}</span>
              </div>
            )},
            ...(p.poAmendment ? [{
              step: 9, title: 'PO Amendment', content: (
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-slate-400">Amendment</span><span className="text-right font-mono">{p.poAmendment.amendmentNumber}</span>
                  <span className="text-slate-400">Qty Change</span><span className="text-right font-medium">{p.poAmendment.originalQuantity} → {p.poAmendment.newQuantity}</span>
                  <span className="text-slate-400">Reason</span><span className="text-right text-xs">{p.poAmendment.reason}</span>
                </div>
              ),
            }] : []),
            { step: 10, title: 'Payment', content: (
              <p className="text-sm text-emerald-600 font-medium">✓ Payment of ₹{p.invoice.billedAmount.toLocaleString()} processed</p>
            )},
          ].map(({ step, title, content }) => (
            <div key={step} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-slate-50/50 border-b border-slate-100">
                <div className="w-6 h-6 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">✓</div>
                <span className="text-sm font-semibold text-slate-700">{title}</span>
              </div>
              <div className="px-5 py-4">{content}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── History List ───
  return (
    <div className="max-w-3xl mx-auto px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Procurement History</h2>
          <p className="text-sm text-slate-400 mt-1">{history.length} completed transaction{history.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="outline" onClick={onBack} size="sm" className="font-semibold">
          <X className="w-4 h-4 mr-1.5" /> Close
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-slate-400 text-sm">No completed procurements yet.</p>
          <p className="text-slate-300 text-xs mt-1">Complete your first workflow to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((p) => (
            <div key={p.id} onClick={() => setSelectedId(p.id)}
              className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-200 group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{p.request.itemName}</h3>
                    <Badge variant="success" className="rounded-full text-[10px] flex-shrink-0">PAID</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    {p.purchaseOrder.poNumber} • {p.invoice.invoiceNumber} • {p.selectedVendor.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-lg font-bold text-emerald-600">₹{p.invoice.billedAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(p.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>{p.request.quantity} units</span>
                <span>•</span>
                <span>{p.request.category}</span>
                <span>•</span>
                <span>{p.allVendors.length} vendors evaluated</span>
                {p.poAmendment && <><span>•</span><span className="text-amber-500">PO Amended</span></>}
              </div>
              <p className="text-xs text-indigo-500 font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view full details →
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
