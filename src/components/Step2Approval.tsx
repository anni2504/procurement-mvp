import { useProcurement } from '../context/ProcurementContext'

export default function Step2Approval() {
  const { state, approveRequest } = useProcurement()
  const r = state.request
  if (!r) return null

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-medium">{r.itemName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium">{r.category}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-medium">{r.quantity}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Unit Price</span><span className="font-medium">₹{r.unitPrice.toLocaleString()}</span></div>
        <div className="border-t pt-2 flex justify-between"><span className="text-gray-700 font-medium">Total Value</span><span className="font-bold text-blue-700">₹{(r.quantity * r.unitPrice).toLocaleString()}</span></div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
        <strong>Justification:</strong> {r.justification}
      </div>
      <button
        onClick={approveRequest}
        className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition-colors"
      >
        ✓ Approve Request
      </button>
    </div>
  )
}
