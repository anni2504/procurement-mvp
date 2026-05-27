import { useState } from 'react'
import { useProcurement, getRequest, getStepStatus } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step1Request() {
  const { state, submitRequest } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 1) === 'completed'
  const r = getRequest(state.activeWorkflow)

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
    if (!form.itemName.trim()) e.itemName = 'Item name is required'
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Enter a valid quantity'
    if (!form.unitPrice || Number(form.unitPrice) <= 0) e.unitPrice = 'Enter a valid price'
    if (!form.category) e.category = 'Select a category'
    if (!form.justification.trim()) e.justification = 'Provide a business justification'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    try {
      await submitRequest({
        itemName: form.itemName.trim(),
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        category: form.category,
        justification: form.justification.trim(),
      })
      showToast('Procurement request submitted — pending manager approval', 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Completed View ───
  if (isComplete && r) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-slate-50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Requisition Details</span>
            <Badge variant="success" className="rounded-full">Submitted</Badge>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div><span className="text-slate-400">Item</span></div>
            <div className="text-right font-medium text-slate-800">{r.itemName}</div>
            <div><span className="text-slate-400">Category</span></div>
            <div className="text-right font-medium text-slate-800">{r.category}</div>
            <div><span className="text-slate-400">Quantity</span></div>
            <div className="text-right font-medium text-slate-800">{r.quantity} units</div>
            <div><span className="text-slate-400">Unit Price</span></div>
            <div className="text-right font-medium text-slate-800">₹{r.unitPrice.toLocaleString()}</div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">Estimated Total</span>
            <span className="text-lg font-bold text-indigo-600">₹{(r.quantity * r.unitPrice).toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
          <span className="font-semibold">Justification:</span> {r.justification}
        </div>
      </div>
    )
  }

  // ─── Active Form ───
  return (
    <div className="space-y-5 stagger-children">
      <div>
        <Label htmlFor="itemName" className="text-sm font-medium text-slate-700">Item Name</Label>
        <Input
          id="itemName"
          placeholder="e.g. Office Chairs, Dell Monitors"
          value={form.itemName}
          onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
          className="mt-1.5"
        />
        {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="10"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            className="mt-1.5"
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>
        <div>
          <Label htmlFor="unitPrice" className="text-sm font-medium text-slate-700">Unit Price (₹)</Label>
          <Input
            id="unitPrice"
            type="number"
            placeholder="5000"
            value={form.unitPrice}
            onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
            className="mt-1.5"
          />
          {errors.unitPrice && <p className="text-red-500 text-xs mt-1">{errors.unitPrice}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="category" className="text-sm font-medium text-slate-700">Category</Label>
        <select
          id="category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="mt-1.5 w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

      <div>
        <Label htmlFor="justification" className="text-sm font-medium text-slate-700">Business Justification</Label>
        <Textarea
          id="justification"
          rows={3}
          placeholder="Why is this purchase needed? What problem does it solve?"
          value={form.justification}
          onChange={(e) => setForm((f) => ({ ...f, justification: e.target.value }))}
          className="mt-1.5"
        />
        {errors.justification && <p className="text-red-500 text-xs mt-1">{errors.justification}</p>}
      </div>

      {form.quantity && form.unitPrice && Number(form.quantity) > 0 && Number(form.unitPrice) > 0 && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700 animate-fade-in">
          Estimated Total: <strong className="text-indigo-800">₹{(Number(form.quantity) * Number(form.unitPrice)).toLocaleString()}</strong>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-sm font-semibold">
        Submit Request →
      </Button>
    </div>
  )
}
