import { useProcurement } from '../context/ProcurementContext'

export default function Step9Finance() {
  const { state, approvePayment, rejectPayment } = useProcurement()
  const { purchaseOrder, invoice } = state
  if (!purchaseOrder || !invoice) return null

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
        ✓ 3-Way Match passed — ready for finance approval
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">PO Number</span><span className="font-mono font-bold">{purchaseOrder.poNumber}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Invoice Number</span><span className="font-mono">{invoice.invoiceNumber}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span>{purchaseOrder.vendorName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span>{invoice.billedQuantity} units</span></div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-medium">Payment Amount</span>
          <span className="font-bold text-blue-700 text-lg">₹{invoice.billedAmount.toLocaleString()}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={rejectPayment}
          className="w-full border border-red-300 text-red-600 rounded-lg py-2.5 text-sm font-medium hover:bg-red-50 transition-colors">
          ✗ Reject
        </button>
        <button onClick={approvePayment}
          className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition-colors">
          ✓ Approve Payment
        </button>
      </div>
    </div>
  )
}
