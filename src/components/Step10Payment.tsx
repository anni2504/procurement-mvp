import { useProcurement } from '../context/ProcurementContext'

export default function Step10Payment() {
  const { state, resetAll } = useProcurement()
  const { purchaseOrder, invoice } = state
  if (!purchaseOrder || !invoice) return null

  return (
    <div className="space-y-4 text-center">
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="text-5xl mb-3">🎉</div>
        <p className="text-xl font-bold text-green-700">Payment Processed!</p>
        <p className="text-sm text-green-600 mt-1">Procurement workflow completed successfully</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-left">
        <div className="flex justify-between"><span className="text-gray-500">PO Number</span><span className="font-mono font-bold">{purchaseOrder.poNumber}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Invoice</span><span className="font-mono">{invoice.invoiceNumber}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span>{purchaseOrder.vendorName}</span></div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-medium">Amount Paid</span>
          <span className="font-bold text-green-700 text-lg">₹{invoice.billedAmount.toLocaleString()}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400">Transaction closed • {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <button onClick={resetAll}
        className="w-full border border-gray-300 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
        ↺ Start New Procurement
      </button>
    </div>
  )
}
