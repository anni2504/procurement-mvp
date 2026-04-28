import { useState } from 'react'
import { useProcurement } from '../context/ProcurementContext'

export default function Step1Request() {
  const { submitRequest } = useProcurement()
  const [form, setForm] = useState({
    itemName: '',
    quantity: '',
    unitPrice: '',
    category: '',
    justification: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.itemName) e.itemName = 'Item name is required'
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Enter a valid quantity'
    if (!form.unitPrice || Number(form.unitPrice) <= 0) e.unitPrice = 'Enter a valid price'
    if (!form.category) e.category = 'Category is required'
    if (!form.justification) e.justification = 'Justification is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    submitRequest({
      itemName: form.itemName,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
      category: form.category,
      justification: form.justification,
    })
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="space-y-2">
      {field('Item Name', 'itemName', 'text', 'e.g. Office Chairs')}
      <div className="grid grid-cols-2 gap-4">
        {field('Quantity', 'quantity', 'number', '10')}
        {field('Unit Price (₹)', 'unitPrice', 'number', '5000')}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select category</option>
          <option>IT Equipment</option>
          <option>Office Supplies</option>
          <option>Furniture</option>
          <option>Software</option>
          <option>Services</option>
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Justification</label>
        <textarea
          rows={3}
          placeholder="Why is this purchase needed?"
          value={form.justification}
          onChange={(e) => setForm((f) => ({ ...f, justification: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.justification && <p className="text-red-500 text-xs mt-1">{errors.justification}</p>}
      </div>
      {form.quantity && form.unitPrice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          Estimated Total: <strong>₹{(Number(form.quantity) * Number(form.unitPrice)).toLocaleString()}</strong>
        </div>
      )}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Submit Request →
      </button>
    </div>
  )
}
