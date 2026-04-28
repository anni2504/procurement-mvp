import { useState } from 'react'
import { useProcurement } from '../context/ProcurementContext'

export default function Step5GRN() {
  const { state, submitGRN } = useProcurement()
  const po = state.purchaseOrder
  const [form, setForm] = useState({ receivedQuantity: '', condition: 'Good', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.receivedQuantity || Number(form.receivedQuantity) < 0) e.receivedQuantity = 'Enter received quantity'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    submitGRN({ receivedQuantity: Number(form.receivedQuantity), condition: form.condition, notes: form.notes })
  }

  const qty = Number(form.receivedQuantity)
  const ordered = po?.quantity || 0
  const diff = qty - ordered

  return (
    <div className="space-y-4">
      {po && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          PO <strong>{po.poNumber}</strong> — Ordered quantity: <strong>{po.quantity} units</strong>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Received Quantity</label>
        <input type="number" placeholder={`Expected: ${ordered}`} value={form.receivedQuantity}
          onChange={e => setForm(f => ({ ...f, receivedQuantity: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.receivedQuantity && <p className="text-red-500 text-xs mt-1">{errors.receivedQuantity}</p>}
        {form.receivedQuantity && diff !== 0 && (
          <p className={`text-xs mt-1 ${diff < 0 ? 'text-red-500' : 'text-yellow-600'}`}>
            ⚠ {diff < 0 ? `${Math.abs(diff)} units short` : `${diff} units extra`} — this may cause a 3-way match issue
          </p>
        )}
        {form.receivedQuantity && diff === 0 && (
          <p className="text-xs mt-1 text-green-600">✓ Quantity matches PO</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
        <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Good</option>
          <option>Damaged</option>
          <option>Partial</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea rows={2} placeholder="Any delivery notes..." value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={handleSubmit}
        className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors">
        Record Delivery →
      </button>
    </div>
  )
}
