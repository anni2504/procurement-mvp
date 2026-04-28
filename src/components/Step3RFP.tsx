import { useState } from 'react'
import { useProcurement, Vendor } from '../context/ProcurementContext'

export default function Step3RFP() {
  const { selectVendor } = useProcurement()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [form, setForm] = useState({ name: '', email: '', quote: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<number | null>(null)

  const addVendor = () => {
    const e: Record<string, string> = {}
    if (!form.name) e.name = 'Required'
    if (!form.email) e.email = 'Required'
    if (!form.quote || Number(form.quote) <= 0) e.quote = 'Required'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setVendors((v) => [...v, { name: form.name, email: form.email, quote: Number(form.quote) }])
    setForm({ name: '', email: '', quote: '' })
    setErrors({})
  }

  const confirm = () => {
    if (selected === null) return
    selectVendor(vendors[selected])
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Add Vendor Quote</p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <input placeholder="Vendor Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <input placeholder="Quote (₹)" type="number" value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.quote && <p className="text-red-500 text-xs mt-1">{errors.quote}</p>}
          </div>
        </div>
        <button onClick={addVendor} className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-900 transition-colors">
          + Add Vendor
        </button>
      </div>

      {vendors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Select a Vendor</p>
          {vendors.map((v, i) => (
            <div key={i} onClick={() => setSelected(i)}
              className={`border rounded-lg p-3 cursor-pointer flex justify-between items-center text-sm transition-colors ${selected === i ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div>
                <p className="font-medium">{v.name}</p>
                <p className="text-gray-500 text-xs">{v.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-700">₹{v.quote.toLocaleString()}</p>
                {selected === i && <p className="text-green-600 text-xs">✓ Selected</p>}
              </div>
            </div>
          ))}
          <button onClick={confirm} disabled={selected === null}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors">
            Confirm Vendor Selection →
          </button>
        </div>
      )}

      {vendors.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">Add at least one vendor quote to proceed</p>
      )}
    </div>
  )
}
