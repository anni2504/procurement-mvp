import { useState } from 'react'
import { useProcurement, ResponsibleParty } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Textarea } from './ui/textarea'

const PARTIES = [
  { value: 'vendor' as const, label: 'Vendor', desc: 'Wrong invoice issued — vendor corrects and resubmits', icon: '🏢' },
  { value: 'procurement' as const, label: 'Procurement', desc: 'PO had incorrect qty — raise PO Amendment', icon: '📋' },
  { value: 'warehouse' as const, label: 'Warehouse', desc: 'GRN count error — update received quantity', icon: '📦' },
]

export default function Step8Dispute() {
  const { state, setResponsibleParty, resolveDispute, raisePOAmendment } = useProcurement()
  const { showToast } = useToast()
  const { purchaseOrder, grn, invoice, responsibleParty, poAmendment } = state

  const [newGRNQty, setNewGRNQty] = useState(String(grn?.receivedQuantity || ''))
  const [newInvQty, setNewInvQty] = useState(String(invoice?.billedQuantity || ''))
  const [newInvAmt, setNewInvAmt] = useState(String(invoice?.billedAmount || ''))
  const [amdQty, setAmdQty] = useState(String(grn?.receivedQuantity || ''))
  const [amdReason, setAmdReason] = useState('')

  if (!purchaseOrder || !grn || !invoice) return null

  const effectiveQty = poAmendment ? poAmendment.newQuantity : purchaseOrder.quantity

  const handleVendorFix = () => {
    resolveDispute(undefined, { ...invoice, billedQuantity: Number(newInvQty), billedAmount: Number(newInvAmt) })
    showToast('Corrected invoice resubmitted — re-running match', 'info')
  }

  const handleWarehouseFix = () => {
    resolveDispute({ ...grn, receivedQuantity: Number(newGRNQty) }, undefined)
    showToast('GRN quantity corrected — re-running match', 'info')
  }

  const handleProcurementFix = () => {
    if (!amdReason.trim()) { showToast('Please provide a reason for the amendment', 'warning'); return }
    raisePOAmendment(Number(amdQty), amdReason.trim())
    showToast(`PO Amendment raised — new qty: ${amdQty}`, 'info')
  }

  const handleRerunAfterAmendment = () => {
    resolveDispute(grn, invoice)
  }

  return (
    <div className="space-y-4 stagger-children">
      {/* Mismatch Summary */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⚠️</span>
          <strong className="text-red-800 text-sm">Mismatch Detected</strong>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'PO Qty', value: effectiveQty, amended: !!poAmendment },
            { label: 'GRN Qty', value: grn.receivedQuantity },
            { label: 'Invoice Qty', value: invoice.billedQuantity },
          ].map((item, i) => (
            <div key={i} className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-red-400 font-semibold uppercase">{item.label}</p>
              <p className="text-xl font-bold text-red-800 mt-1">{item.value}</p>
              {'amended' in item && item.amended && <p className="text-[9px] text-amber-600 font-medium">amended</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Responsible Party Selection */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-3">Who is responsible for the error?</p>
        <div className="space-y-2">
          {PARTIES.map((p) => (
            <button
              key={p.value}
              onClick={() => setResponsibleParty(p.value)}
              className={`w-full text-left rounded-xl p-4 border transition-all duration-200 ${
                responsibleParty === p.value
                  ? 'border-indigo-300 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.label}</p>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>
                {responsibleParty === p.value && (
                  <Badge className="ml-auto rounded-full bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">Selected</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Correction Form based on Responsible Party */}
      {responsibleParty === 'vendor' && (
        <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white animate-fade-in">
          <div className="flex items-center gap-2">
            <span>🏢</span>
            <p className="text-sm font-semibold text-slate-700">Vendor Correction — Update Invoice</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Corrected Invoice Qty</Label>
              <Input type="number" value={newInvQty} onChange={e => setNewInvQty(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Corrected Amount (₹)</Label>
              <Input type="number" value={newInvAmt} onChange={e => setNewInvAmt(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleVendorFix} className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-semibold">
            Resubmit Corrected Invoice & Re-run Match →
          </Button>
        </div>
      )}

      {responsibleParty === 'warehouse' && (
        <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white animate-fade-in">
          <div className="flex items-center gap-2">
            <span>📦</span>
            <p className="text-sm font-semibold text-slate-700">Warehouse Correction — Update GRN</p>
          </div>
          <Separator />
          <div>
            <Label className="text-xs text-slate-500">Corrected Received Quantity</Label>
            <Input type="number" value={newGRNQty} onChange={e => setNewGRNQty(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={handleWarehouseFix} className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-semibold">
            Update GRN & Re-run Match →
          </Button>
        </div>
      )}

      {responsibleParty === 'procurement' && (
        <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white animate-fade-in">
          <div className="flex items-center gap-2">
            <span>📋</span>
            <p className="text-sm font-semibold text-slate-700">PO Amendment — Original PO remains locked</p>
          </div>
          <Separator />
          <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
            🔒 The original PO ({purchaseOrder.poNumber}, qty: {purchaseOrder.quantity}) cannot be edited. A separate amendment document will be created.
          </div>
          <div>
            <Label className="text-xs text-slate-500">New PO Quantity</Label>
            <Input type="number" value={amdQty} onChange={e => setAmdQty(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Reason for Amendment</Label>
            <Textarea rows={2} placeholder="Why is the PO quantity being changed?"
              value={amdReason} onChange={e => setAmdReason(e.target.value)} className="mt-1" />
          </div>
          {!poAmendment ? (
            <Button onClick={handleProcurementFix} className="w-full bg-amber-600 hover:bg-amber-700 h-10 font-semibold">
              Raise PO Amendment
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-700">
                ✓ Amendment <strong>{poAmendment.amendmentNumber}</strong> raised — qty changed from {poAmendment.originalQuantity} to {poAmendment.newQuantity}
              </div>
              <Button onClick={handleRerunAfterAmendment} className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-semibold">
                Re-run 3-Way Match with Amended PO →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
