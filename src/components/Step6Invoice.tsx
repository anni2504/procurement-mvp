import { useState } from 'react'
import { useProcurement } from '../context/ProcurementContext'

export default function Step6Invoice() {
  const { state, submitInvoice } = useProcurement()
  const po = state.purchaseOrder
  const grn = state.grn
  const [form, setForm] = useState({ invoiceNumber: '', billedQuantity: '', billedAmount: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.invoiceNumber) e.invoiceNumber = 'Required'
    if (!form.billedQuantity || Number(form.billedQuantity) <= 0) e.billedQuantity = 'Required'
    if (!form.billedAmount || Number(form.billedAmount) <= 0) e.billedAmount = 'Required'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    submitInvoice({ invoiceNumber: form.invoiceNumber, billedQuantity: Number(form.billedQuantity), billedAmount: Number(form.billedAmount) })
  }

  return (
    <div className="space-y-4">
      {po && grn && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500">PO Quantity</p>
            <p className="font-bold text-lg">{po.quantity}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500">GRN Received</p>
            <p className="font-bold text-lg">{grn.receivedQuantity}</p>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
        <input placeholder="e.g. INV-2024-001" value={form.invoiceNumber}
          onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.invoiceNumber && <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Billed Quantity</label>
          <input type="number" placeholder="Units billed" value={form.billedQuantity}
            onChange={e => setForm(f => ({ ...f, billedQuantity: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.billedQuantity && <p className="text-red-500 text-xs mt-1">{errors.billedQuantity}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Billed Amount (₹)</label>
          <input type="number" placeholder="Total amount" value={form.billedAmount}
            onChange={e => setForm(f => ({ ...f, billedAmount: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.billedAmount && <p className="text-red-500 text-xs mt-1">{errors.billedAmount}</p>}
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        ⚡ Submitting this invoice will immediately trigger the 3-way match check
      </div>
      <button onClick={handleSubmit}
        className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">
        Submit Invoice & Run Match →
      </button>
    </div>
  )
}
