import { useState } from 'react'
import { useProcurement, getPurchaseOrder, getGRN, getStepStatus } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step5GRN() {
  const { state, submitGoodsReceipt } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 6) === 'completed'
  const po = getPurchaseOrder(state.activeWorkflow)
  const grn = getGRN(state.activeWorkflow)

  const [form, setForm] = useState({
    receivedQuantity: po ? String(po.quantity) : '',
    condition: 'good',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!form.receivedQuantity || Number(form.receivedQuantity) < 0) e.receivedQuantity = 'Invalid quantity'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    
    try {
      await submitGoodsReceipt({
        receivedQuantity: Number(form.receivedQuantity),
        condition: form.condition,
        notes: form.notes.trim(),
      })
      showToast('Goods Receipt logged successfully', 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Completed View ───
  if (isComplete && grn) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">✓</span></div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Goods Receipt Logged</p>
              <p className="text-xs text-emerald-600">Pending formal GRN document generation</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Ordered Quantity:</span>
            <span className="font-semibold text-slate-800">{po?.quantity} units</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Received Quantity:</span>
            <span className={`font-bold ${grn.receivedQuantity === po?.quantity ? 'text-emerald-600' : 'text-amber-600'}`}>
              {grn.receivedQuantity} units
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Condition:</span>
            <span className="font-medium capitalize text-slate-800">{grn.condition}</span>
          </div>
          {grn.notes && (
            <div className="pt-2 text-sm text-slate-600 italic">
              " {grn.notes} "
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-5 stagger-children">
      {po && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-sm flex justify-between items-center">
          <div>
            <p className="font-medium text-indigo-900">PO: <span className="font-bold">{po.poNumber}</span></p>
            <p className="text-indigo-600/80 text-xs mt-0.5">Expected Delivery: {po.quantity} units of {po.itemName}</p>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Awaiting Delivery</Badge>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700">Quantity Received</Label>
          <Input type="number" value={form.receivedQuantity}
            onChange={e => setForm(f => ({ ...f, receivedQuantity: e.target.value }))} className="mt-1.5" />
          {errors.receivedQuantity && <p className="text-red-500 text-xs mt-1">{errors.receivedQuantity}</p>}
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">Condition</Label>
          <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
            className="mt-1.5 w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="good">Good / Undamaged</option>
            <option value="damaged">Damaged Box</option>
            <option value="defective">Defective Units</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-slate-700">Inspection Notes (Optional)</Label>
        <Textarea rows={2} placeholder="Add any notes about the delivery..." value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1.5" />
      </div>

      {po && form.receivedQuantity && Number(form.receivedQuantity) !== po.quantity && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 animate-fade-in flex gap-2">
          <span className="shrink-0">⚠️</span>
          <span>Quantity mismatch detected! Expected {po.quantity}, got {form.receivedQuantity}. This will flag a discrepancy during 3-way matching.</span>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold shadow-md shadow-indigo-200">
        Log Delivery & Inspect →
      </Button>
    </div>
  )
}
