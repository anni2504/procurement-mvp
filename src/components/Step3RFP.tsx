import { useState } from 'react'
import { useProcurement, Vendor } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step3RFP() {
  const { state, addVendor, selectVendor } = useProcurement()
  const { showToast } = useToast()
  const isComplete = state.currentStep > 3
  const selected = state.selectedVendor
  const vendors = state.allVendors

  const [form, setForm] = useState({ name: '', email: '', quote: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const handleAddVendor = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    if (!form.quote || Number(form.quote) <= 0) e.quote = 'Required'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    addVendor({ name: form.name.trim(), email: form.email.trim(), quote: Number(form.quote) })
    setForm({ name: '', email: '', quote: '' })
    setErrors({})
    showToast(`Vendor "${form.name.trim()}" added to RFP`, 'info')
  }

  const handleConfirm = () => {
    if (selectedIdx === null) return
    selectVendor(vendors[selectedIdx])
    showToast(`Vendor "${vendors[selectedIdx].name}" selected — generating Purchase Order`, 'success')
  }

  // ─── Completed View ───
  if (isComplete && selected) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <span className="text-lg">🏢</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Vendor Selected</p>
            <p className="text-xs text-emerald-600">{vendors.length} vendor{vendors.length !== 1 ? 's' : ''} evaluated</p>
          </div>
        </div>

        {/* All vendors with selected highlighted */}
        <div className="space-y-2">
          {vendors.map((v, i) => {
            const isSelected = v.name === selected.name && v.email === selected.email
            return (
              <div key={i} className={`rounded-xl p-4 flex justify-between items-center text-sm border ${
                isSelected ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'
              }`}>
                <div>
                  <p className="font-semibold text-slate-800">{v.name}</p>
                  <p className="text-slate-400 text-xs">{v.email}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-bold text-indigo-700">₹{v.quote.toLocaleString()}</span>
                  {isSelected && <Badge variant="success" className="rounded-full text-[10px]">Selected</Badge>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-5 stagger-children">
      {/* Add Vendor Form */}
      <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Add Vendor Quote</p>
          <Badge variant="secondary" className="rounded-full text-[10px]">RFP Response</Badge>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="text-xs text-slate-500">Vendor Name</Label>
            <Input
              placeholder="e.g. Acme Supplies"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="mt-1"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Email</Label>
              <Input
                placeholder="vendor@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="mt-1"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label className="text-xs text-slate-500">Quote per Unit (₹)</Label>
              <Input
                type="number"
                placeholder="5000"
                value={form.quote}
                onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                className="mt-1"
              />
              {errors.quote && <p className="text-red-500 text-xs mt-1">{errors.quote}</p>}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={handleAddVendor} className="w-full font-semibold">
          + Add Vendor
        </Button>
      </div>

      {/* Vendor List */}
      {vendors.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Select a Vendor ({vendors.length} response{vendors.length !== 1 ? 's' : ''})</p>
          <div className="space-y-2">
            {vendors.map((v, i) => (
              <div
                key={i}
                onClick={() => setSelectedIdx(i)}
                className={`border rounded-xl p-4 cursor-pointer flex justify-between items-center text-sm transition-all duration-200 ${
                  selectedIdx === i
                    ? 'border-indigo-300 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-800">{v.name}</p>
                  <p className="text-slate-400 text-xs">{v.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-700">₹{v.quote.toLocaleString()}</p>
                  {selectedIdx === i && <p className="text-emerald-500 text-xs font-medium mt-0.5">✓ Selected</p>}
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={handleConfirm}
            disabled={selectedIdx === null}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold"
          >
            Confirm Vendor Selection →
          </Button>
        </div>
      )}

      {vendors.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-slate-400">Add at least one vendor quote to proceed</p>
        </div>
      )}
    </div>
  )
}
