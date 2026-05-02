import { useEffect } from 'react'
import { useProcurement } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step7Match() {
  const { state, runMatch } = useProcurement()
  const { showToast } = useToast()
  const { purchaseOrder, grn, invoice, matchStatus, poAmendment } = state

  useEffect(() => {
    if (purchaseOrder && grn && invoice && !matchStatus) {
      runMatch()
    }
  }, [])

  useEffect(() => {
    if (matchStatus === 'matched') {
      showToast('3-Way Match PASSED — invoice approved for finance review', 'success')
    } else if (matchStatus === 'mismatched') {
      showToast('3-Way Match FAILED — quantities mismatch, dispute required', 'error')
    }
  }, [matchStatus])

  if (!purchaseOrder || !grn || !invoice) return null

  const effectiveQty = poAmendment ? poAmendment.newQuantity : purchaseOrder.quantity
  const rows = [
    { label: 'PO Quantity', value: effectiveQty, source: poAmendment ? `${purchaseOrder.poNumber} (amended)` : purchaseOrder.poNumber },
    { label: 'GRN Received', value: grn.receivedQuantity, source: 'Delivery Challan' },
    { label: 'Invoice Billed', value: invoice.billedQuantity, source: invoice.invoiceNumber },
  ]
  const allMatch = rows.every(r => r.value === effectiveQty)

  return (
    <div className="space-y-4 stagger-children">
      {/* Result Banner */}
      <div className={`rounded-xl p-6 text-center ${allMatch ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        <p className={`text-3xl font-extrabold ${allMatch ? 'text-emerald-700' : 'text-red-700'}`}>
          {allMatch ? '✓ MATCHED' : '✗ MISMATCH'}
        </p>
        <p className={`text-sm mt-2 font-medium ${allMatch ? 'text-emerald-600' : 'text-red-600'}`}>
          {allMatch ? 'All quantities match — invoice approved for payment' : 'Quantities do not match — dispute resolution required'}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className={`flex justify-between items-center rounded-xl p-4 text-sm ${
            r.value === effectiveQty ? 'bg-emerald-50/60 border border-emerald-100' : 'bg-red-50/60 border border-red-100'
          }`}>
            <div>
              <span className="font-medium text-slate-700">{r.label}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Source: {r.source}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${r.value === effectiveQty ? 'text-emerald-700' : 'text-red-700'}`}>
                {r.value}
              </span>
              <span className={`text-sm ${r.value === effectiveQty ? 'text-emerald-500' : 'text-red-500'}`}>
                {r.value === effectiveQty ? '✓' : '✗'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-slate-400">PO Amount</span><span className="font-medium">₹{purchaseOrder.totalAmount.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Invoice Amount</span><span className="font-medium">₹{invoice.billedAmount.toLocaleString()}</span></div>
      </div>

      {!allMatch && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 font-medium">
          ⚠ Routed to <strong>Dispute Resolution</strong> — select responsible party and correct the values
        </div>
      )}
    </div>
  )
}
