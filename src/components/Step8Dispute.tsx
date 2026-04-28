import { useState } from 'react'
import { useProcurement } from '../context/ProcurementContext'

export default function Step8Dispute() {
  const { state, resolveDispute } = useProcurement()
  const { purchaseOrder, grn, invoice } = state
  const [newGRNQty, setNewGRNQty] = useState(String(grn?.receivedQuantity || ''))
  const [newInvQty, setNewInvQty] = useState(String(invoice?.billedQuantity || ''))
  const [newInvAmt, setNewInvAmt] = useState(String(invoice?.billedAmount || ''))

  if (!purchaseOrder || !grn || !invoice) return null

  const handleResolve = () => {
    resolveDispute(
      { ...grn, receivedQuantity: Number(newGRNQty) },
      { ...invoice, billedQuantity: Number(newInvQty), billedAmount: Number(newInvAmt) }
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
        <strong>Mismatch Detected</strong> — Correct the values below to resolve the dispute
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
        <p className="font-medium text-gray-700 mb-2">Original Values</p>
        <div className="flex justify-between"><span className="text-gray-500">PO Quantity (fixed)</span><span className="font-bold">{purchaseOrder.quantity}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">GRN Received</span><span>{grn.receivedQuantity}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Invoice Billed</span><span>{invoice.billedQuantity}</span></div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Update GRN Quantity</label>
          <input type="number" value={newGRNQty} onChange={e => setNewGRNQty(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Invoice Quantity</label>
            <input type="number" value={newInvQty} onChange={e => setNewInvQty(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Invoice Amount (₹)</label>
            <input type="number" value={newInvAmt} onChange={e => setNewInvAmt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
      <button onClick={handleResolve}
        className="w-full bg-orange-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-orange-700 transition-colors">
        Re-run 3-Way Match →
      </button>
    </div>
  )
}
