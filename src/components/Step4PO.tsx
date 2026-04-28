import { useEffect } from 'react'
import { useProcurement } from '../context/ProcurementContext'

export default function Step4PO() {
  const { state, generatePO, approvePO } = useProcurement()
  const { purchaseOrder, request, selectedVendor } = state

  useEffect(() => {
    if (!purchaseOrder && request && selectedVendor) generatePO()
  }, [])

  if (!purchaseOrder) return <p className="text-sm text-gray-400">Generating PO...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">Purchase Order</p>
        <span className="bg-blue-100 text-blue-700 text-xs font-mono font-bold px-2 py-1 rounded">{purchaseOrder.poNumber}</span>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Item</span><span className="font-medium">{purchaseOrder.itemName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Quantity Ordered</span><span className="font-medium">{purchaseOrder.quantity}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Unit Price</span><span className="font-medium">₹{purchaseOrder.unitPrice.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium">{purchaseOrder.vendorName}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Vendor Email</span><span className="font-medium">{purchaseOrder.vendorEmail}</span></div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-medium text-gray-700">Total Amount</span>
          <span className="font-bold text-blue-700 text-base">₹{purchaseOrder.totalAmount.toLocaleString()}</span>
        </div>
      </div>
      <button onClick={approvePO} className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">
        Approve & Send PO to Vendor →
      </button>
    </div>
  )
}
