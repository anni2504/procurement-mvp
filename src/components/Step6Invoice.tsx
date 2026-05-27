import { useState } from 'react'
import { useProcurement, getPurchaseOrder, getInvoice, getStepStatus } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step6Invoice() {
  const { state, submitInvoice } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 8) === 'completed'
  const po = getPurchaseOrder(state.activeWorkflow)
  const inv = getInvoice(state.activeWorkflow)

  const [form, setForm] = useState({
    billedQuantity: po ? String(po.quantity) : '',
    billedAmount: po ? String(po.totalAmount) : '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!form.billedQuantity || Number(form.billedQuantity) < 0) e.billedQuantity = 'Required'
    if (!form.billedAmount || Number(form.billedAmount) < 0) e.billedAmount = 'Required'
    if (Object.keys(e).length > 0) { setErrors(e); return }
    
    try {
      await submitInvoice({
        billedQuantity: Number(form.billedQuantity),
        billedAmount: Number(form.billedAmount),
      })
      showToast('Vendor invoice submitted and logged', 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Shared Invoice Card ───
  const renderInvoiceCard = (invoice: any) => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Vendor Invoice</p>
          <p className="text-lg font-bold text-slate-800">{invoice.invoiceNumber}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-slate-400 mb-1">Billed Quantity</p><p className="text-sm font-bold text-slate-800">{invoice.billedQuantity} units</p></div>
          <div className="text-right"><p className="text-xs text-slate-400 mb-1">Total Billed Amount</p><p className="text-lg font-bold text-indigo-700">₹{invoice.billedAmount.toLocaleString()}</p></div>
        </div>
      </div>
    </div>
  )

  // ─── Completed View ───
  if (isComplete && inv) {
    return (
      <div className="space-y-5 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">✓</span></div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Invoice Logged</p>
              <p className="text-xs text-emerald-600">Ready for 3-way matching</p>
            </div>
          </div>
        </div>
        {renderInvoiceCard(inv)}
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
            <p className="text-indigo-600/80 text-xs mt-0.5">PO Value: ₹{po.totalAmount.toLocaleString()} ({po.quantity} units)</p>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Awaiting Invoice</Badge>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700">Billed Quantity</Label>
          <Input type="number" value={form.billedQuantity}
            onChange={e => setForm(f => ({ ...f, billedQuantity: e.target.value }))} className="mt-1.5" />
          {errors.billedQuantity && <p className="text-red-500 text-xs mt-1">{errors.billedQuantity}</p>}
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">Billed Total Amount (₹)</Label>
          <Input type="number" value={form.billedAmount}
            onChange={e => setForm(f => ({ ...f, billedAmount: e.target.value }))} className="mt-1.5" />
          {errors.billedAmount && <p className="text-red-500 text-xs mt-1">{errors.billedAmount}</p>}
        </div>
      </div>

      {po && form.billedAmount && Number(form.billedAmount) !== po.totalAmount && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 animate-fade-in flex gap-2">
          <span className="shrink-0">⚠️</span>
          <span>Amount mismatch detected! PO amount is ₹{po.totalAmount}, but invoice is ₹{form.billedAmount}. This will flag a discrepancy.</span>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold">
        Submit Vendor Invoice →
      </Button>
    </div>
  )
}
