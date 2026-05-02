import { useState } from 'react'
import { useProcurement } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step6Invoice() {
  const { state, submitInvoice } = useProcurement()
  const { showToast } = useToast()
  const po = state.purchaseOrder
  const grn = state.grn
  const inv = state.invoice
  const isComplete = state.currentStep > 7

  const nextInvNum = `INV-${state.nextInvoiceNumber.toString().padStart(4, '0')}`
  const [form, setForm] = useState({ billedQuantity: '', billedAmount: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const e: Record<string, string> = {}
    if (!form.billedQuantity || Number(form.billedQuantity) <= 0) e.billedQuantity = 'Required'
    if (!form.billedAmount || Number(form.billedAmount) <= 0) e.billedAmount = 'Required'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    submitInvoice({
      billedQuantity: Number(form.billedQuantity),
      billedAmount: Number(form.billedAmount),
    })
    showToast(`Invoice ${nextInvNum} submitted — 3-Way Match will run next`, 'info')
  }

  // ─── Completed View ───
  if (isComplete && inv && po && grn) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">🧾</span></div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Invoice Submitted</p>
            <p className="text-xs text-emerald-600">{inv.invoiceNumber} • ₹{inv.billedAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'PO Qty', value: po.quantity },
            { label: 'GRN Qty', value: grn.receivedQuantity },
            { label: 'Invoice Qty', value: inv.billedQuantity },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">{item.label}</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-4 stagger-children">
      {po && grn && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">PO Quantity</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{po.quantity}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">GRN Received</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{grn.receivedQuantity}</p>
          </div>
        </div>
      )}
      <div>
        <Label className="text-sm font-medium text-slate-700">Invoice Number</Label>
        <Input value={nextInvNum} readOnly disabled className="mt-1.5 bg-slate-50 font-mono font-bold" />
        <p className="text-[10px] text-slate-400 mt-1">Auto-generated — incremental</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-slate-700">Billed Quantity</Label>
          <Input type="number" placeholder="Units billed" value={form.billedQuantity}
            onChange={e => setForm(f => ({ ...f, billedQuantity: e.target.value }))} className="mt-1.5" />
          {errors.billedQuantity && <p className="text-red-500 text-xs mt-1">{errors.billedQuantity}</p>}
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">Billed Amount (₹)</Label>
          <Input type="number" placeholder="Total amount" value={form.billedAmount}
            onChange={e => setForm(f => ({ ...f, billedAmount: e.target.value }))} className="mt-1.5" />
          {errors.billedAmount && <p className="text-red-500 text-xs mt-1">{errors.billedAmount}</p>}
        </div>
      </div>
      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium">
        ⚡ Submitting triggers the automated 3-way match check
      </div>
      <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold">
        Submit Invoice & Run Match →
      </Button>
    </div>
  )
}
