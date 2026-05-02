import { useState } from 'react'
import { useProcurement } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step5GRN() {
  const { state, submitGRN } = useProcurement()
  const { showToast } = useToast()
  const po = state.purchaseOrder
  const isComplete = state.currentStep > 6
  const grn = state.grn

  const [form, setForm] = useState({ receivedQuantity: '', condition: 'Good', notes: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.receivedQuantity || Number(form.receivedQuantity) < 0) e.receivedQuantity = 'Enter received quantity'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    submitGRN({ receivedQuantity: Number(form.receivedQuantity), condition: form.condition, notes: form.notes })
    showToast(`GRN recorded — ${form.receivedQuantity} units received`, 'success')
  }

  const qty = Number(form.receivedQuantity)
  const ordered = po?.quantity || 0
  const diff = qty - ordered

  // ─── Completed View ───
  if (isComplete && grn && po) {
    const grnDiff = grn.receivedQuantity - po.quantity
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">📦</span></div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Delivery Recorded</p>
            <p className="text-xs text-emerald-600">{grn.receivedQuantity} units received • Condition: {grn.condition}</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-slate-400">PO Quantity</span><span className="text-right font-medium">{po.quantity} units</span>
            <span className="text-slate-400">Received</span>
            <span className={`text-right font-bold ${grnDiff === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {grn.receivedQuantity} units {grnDiff === 0 ? '✓' : grnDiff < 0 ? `(${Math.abs(grnDiff)} short)` : `(${grnDiff} extra)`}
            </span>
            <span className="text-slate-400">Condition</span><span className="text-right font-medium">{grn.condition}</span>
          </div>
          {grn.notes && <><Separator /><p className="text-xs text-slate-500"><strong>Notes:</strong> {grn.notes}</p></>}
        </div>
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-4 stagger-children">
      {po && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
          PO <strong>{po.poNumber}</strong> — Expected: <strong>{po.quantity} units</strong> of {po.itemName}
        </div>
      )}
      <div>
        <Label className="text-sm font-medium text-slate-700">Received Quantity</Label>
        <Input type="number" placeholder={`Expected: ${ordered}`} value={form.receivedQuantity}
          onChange={e => setForm(f => ({ ...f, receivedQuantity: e.target.value }))} className="mt-1.5" />
        {errors.receivedQuantity && <p className="text-red-500 text-xs mt-1">{errors.receivedQuantity}</p>}
        {form.receivedQuantity && diff !== 0 && (
          <p className={`text-xs mt-1.5 font-medium ${diff < 0 ? 'text-red-500' : 'text-amber-600'}`}>
            ⚠ {diff < 0 ? `${Math.abs(diff)} units short` : `${diff} units extra`} — may cause a mismatch
          </p>
        )}
        {form.receivedQuantity && diff === 0 && <p className="text-xs mt-1.5 text-emerald-600 font-medium">✓ Matches PO quantity</p>}
      </div>
      <div>
        <Label className="text-sm font-medium text-slate-700">Condition</Label>
        <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
          className="mt-1.5 w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <option>Good</option><option>Damaged</option><option>Partial</option>
        </select>
      </div>
      <div>
        <Label className="text-sm font-medium text-slate-700">Notes (optional)</Label>
        <Input placeholder="Any delivery notes..." value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1.5" />
      </div>
      <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold">
        Record Delivery →
      </Button>
    </div>
  )
}
