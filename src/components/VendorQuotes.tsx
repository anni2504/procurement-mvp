import { useState } from 'react'
import { useProcurement, getRequest, getStepStatus, getStepData } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function VendorQuotes() {
  const { state, addVendorQuote, finalizeQuotes, selectVendor } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 3) === 'completed'
  const step3Data = getStepData(state.activeWorkflow, 3)
  
  const r = getRequest(state.activeWorkflow)
  const vendors = step3Data.vendors || []
  const quotesFinalized = step3Data.quotesFinalized
  const selected = step3Data.selectedVendor

  const [form, setForm] = useState({ name: '', email: '', quote: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const handleAdd = async () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    if (!form.quote || Number(form.quote) <= 0) e.quote = 'Required'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    
    try {
      await addVendorQuote(form.name.trim(), form.email.trim(), Number(form.quote))
      setForm({ name: '', email: '', quote: '' })
      setErrors({})
      showToast(`Quote from "${form.name.trim()}" received`, 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const handleFinalize = async () => {
    try {
      await finalizeQuotes()
      showToast(`${vendors.length} vendor quote${vendors.length !== 1 ? 's' : ''} finalized — select a vendor below`, 'info')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const handleConfirmVendor = async () => {
    if (selectedIdx === null) return
    try {
      await selectVendor(vendors[selectedIdx].name, vendors[selectedIdx].email, vendors[selectedIdx].quote)
      showToast(`"${vendors[selectedIdx].name}" selected — generating Purchase Order`, 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Completed View ───
  if (isComplete && selected) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">✓</span></div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Vendor Selected</p>
            <p className="text-xs text-emerald-600">{selected.name} — ₹{selected.quote.toLocaleString()}/unit</p>
          </div>
        </div>
        <div className="space-y-2">
          {vendors.map((v: any, i: number) => {
            const isSel = v.name === selected.name && v.email === selected.email
            return (
              <div key={i} className={`rounded-xl p-4 flex justify-between items-center text-sm border ${isSel ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'}`}>
                <div><p className="font-semibold text-slate-800">{v.name}</p><p className="text-slate-400 text-xs">{v.email}</p></div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-700">₹{v.quote.toLocaleString()}/unit</span>
                  {isSel && <Badge variant="success" className="rounded-full text-[10px]">Selected</Badge>}
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
      {/* Request Details (read-only) */}
      {r && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Request Details</span>
            <Badge className="rounded-full bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">Open for Quotes</Badge>
          </div>
          <Separator className="bg-indigo-100" />
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <span className="text-indigo-400">Item</span><span className="text-right font-medium text-indigo-800">{r.itemName}</span>
            <span className="text-indigo-400">Category</span><span className="text-right font-medium text-indigo-800">{r.category}</span>
            <span className="text-indigo-400">Quantity</span><span className="text-right font-bold text-indigo-800">{r.quantity} units</span>
            <span className="text-indigo-400">Budget Price</span><span className="text-right font-medium text-indigo-800">₹{r.unitPrice.toLocaleString()}/unit</span>
          </div>
        </div>
      )}

      {/* Add Quote Form — only show if quotes not finalized */}
      {!quotesFinalized && (
        <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
          <p className="text-sm font-semibold text-slate-700">Submit Vendor Quote</p>
          <Separator />
          <div>
            <Label className="text-xs text-slate-500">Vendor Name</Label>
            <Input placeholder="e.g. Acme Supplies" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Email</Label>
              <Input placeholder="vendor@company.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label className="text-xs text-slate-500">Quote per Unit (₹)</Label>
              <Input type="number" placeholder="4500" value={form.quote}
                onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} className="mt-1" />
              {errors.quote && <p className="text-red-500 text-xs mt-1">{errors.quote}</p>}
            </div>
          </div>
          <Button variant="outline" onClick={handleAdd} className="w-full font-semibold">+ Add Quote</Button>
        </div>
      )}

      {/* Submitted Quotes */}
      {vendors.length > 0 && !quotesFinalized && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Submitted Quotes ({vendors.length})</p>
          {vendors.map((v: any, i: number) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 flex justify-between items-center text-sm border border-slate-100">
              <div><p className="font-semibold text-slate-800">{v.name}</p><p className="text-slate-400 text-xs">{v.email}</p></div>
              <span className="font-bold text-indigo-700">₹{v.quote.toLocaleString()}/unit</span>
            </div>
          ))}
          <Button onClick={handleFinalize} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold">
            Finalize Quotes & Proceed to Selection →
          </Button>
        </div>
      )}

      {vendors.length === 0 && !quotesFinalized && (
        <p className="text-sm text-slate-400 text-center py-4">No quotes submitted yet. Add vendor quotes above.</p>
      )}

      {/* ─── Vendor Selection (shown after quotes are finalized) ─── */}
      {quotesFinalized && vendors.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">📩</span></div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">{vendors.length} Quotes Finalized</p>
              <p className="text-xs text-emerald-600">Select the best vendor below</p>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-700">Evaluate & Select Vendor</p>
          <Separator />

          {vendors.map((v: any, i: number) => (
            <div key={i} onClick={() => setSelectedIdx(i)}
              className={`border rounded-xl p-4 cursor-pointer flex justify-between items-center text-sm transition-all duration-200 ${
                selectedIdx === i ? 'border-indigo-300 bg-indigo-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}>
              <div>
                <p className="font-semibold text-slate-800">{v.name}</p>
                <p className="text-slate-400 text-xs">{v.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-700">₹{v.quote.toLocaleString()}/unit</p>
                {r && <p className="text-[10px] text-slate-400 mt-0.5">Total: ₹{(v.quote * r.quantity).toLocaleString()}</p>}
                {selectedIdx === i && <p className="text-emerald-500 text-xs font-medium mt-0.5">✓ Selected</p>}
              </div>
            </div>
          ))}

          <Button onClick={handleConfirmVendor} disabled={selectedIdx === null}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold">
            Confirm Vendor Selection →
          </Button>
        </div>
      )}
    </div>
  )
}
