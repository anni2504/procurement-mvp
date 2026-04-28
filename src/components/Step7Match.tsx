import { useProcurement } from '../context/ProcurementContext'

export default function Step7Match() {
  const { state } = useProcurement()
  const { purchaseOrder, grn, invoice, matchStatus } = state

  if (!purchaseOrder || !grn || !invoice) return null

  const rows = [
    { label: 'PO Quantity', value: purchaseOrder.quantity },
    { label: 'GRN Received', value: grn.receivedQuantity },
    { label: 'Invoice Billed', value: invoice.billedQuantity },
  ]

  const allMatch = rows.every(r => r.value === purchaseOrder.quantity)

  return (
    <div className="space-y-4">
      <div className={`rounded-lg p-4 text-center ${allMatch ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <p className={`text-2xl font-bold ${allMatch ? 'text-green-700' : 'text-red-700'}`}>
          {allMatch ? '✓ 3-WAY MATCH' : '✗ MISMATCH'}
        </p>
        <p className={`text-sm mt-1 ${allMatch ? 'text-green-600' : 'text-red-600'}`}>
          {allMatch ? 'All quantities match — invoice approved for payment' : 'Quantities do not match — dispute resolution required'}
        </p>
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className={`flex justify-between items-center rounded-lg p-3 text-sm ${r.value === purchaseOrder.quantity ? 'bg-green-50' : 'bg-red-50'}`}>
            <span className="text-gray-600">{r.label}</span>
            <span className={`font-bold ${r.value === purchaseOrder.quantity ? 'text-green-700' : 'text-red-700'}`}>
              {r.value} {r.value === purchaseOrder.quantity ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
        <div className="flex justify-between"><span className="text-gray-500">PO Amount</span><span>₹{purchaseOrder.totalAmount.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Invoice Amount</span><span>₹{invoice.billedAmount.toLocaleString()}</span></div>
      </div>
      {!allMatch && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
          ⚠ Workflow has been routed to <strong>Dispute Resolution</strong> (Step 8)
        </div>
      )}
    </div>
  )
}
