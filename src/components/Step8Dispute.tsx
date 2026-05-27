import { useState } from 'react'
import { useProcurement, getPurchaseOrder, getGRN, getInvoice, getPOAmendment, getResponsibleParty, getStepStatus, getStepData } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Input } from './ui/input'

export default function Step8Dispute() {
  const { state, setResponsibleParty, resolveDispute, raisePOAmendment } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 10) === 'completed'
  const step10Data = getStepData(state.activeWorkflow, 10)
  const isSkipped = step10Data.skipped === true
  
  const party = getResponsibleParty(state.activeWorkflow)
  const po = getPurchaseOrder(state.activeWorkflow)
  const grn = getGRN(state.activeWorkflow)
  const inv = getInvoice(state.activeWorkflow)
  const amendment = getPOAmendment(state.activeWorkflow)

  const [correctGRN, setCorrectGRN] = useState(false)
  const [newGRNQty, setNewGRNQty] = useState(grn ? String(grn.receivedQuantity) : '')
  const [correctInv, setCorrectInv] = useState(false)
  const [newInvQty, setNewInvQty] = useState(inv ? String(inv.billedQuantity) : '')
  const [newPOQty, setNewPOQty] = useState(po ? String(po.quantity) : '')
  const [amendReason, setAmendReason] = useState('')

  if (!po || !grn || !inv) return null

  const effPOQty = amendment ? amendment.newQuantity : po.quantity

  const handleSetParty = async (p: any) => {
    try {
      await setResponsibleParty(p)
      showToast(`Assigned responsibility to ${p}`, 'info')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const handleResolve = async () => {
    try {
      let updatedGRN = undefined
      let updatedInv = undefined
      
      if (correctGRN) {
        updatedGRN = { ...grn, receivedQuantity: Number(newGRNQty) }
      }
      if (correctInv) {
        updatedInv = { ...inv, billedQuantity: Number(newInvQty) }
      }
      
      await resolveDispute(updatedGRN, updatedInv)
      showToast('Updates saved. System re-running 3-way match...', 'info')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const handleAmendPO = async () => {
    if (!amendReason.trim() || !newPOQty) return
    try {
      await raisePOAmendment(Number(newPOQty), amendReason.trim())
      showToast('PO Amendment raised. Awaiting re-match.', 'success')
      setAmendReason('')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Skipped View (Match Successful initially) ───
  if (isSkipped) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
        <span className="text-2xl mb-2 block">⏭️</span>
        <p className="font-semibold text-slate-700">Step Skipped</p>
        <p className="text-sm mt-1">3-way match was successful. No disputes to resolve.</p>
      </div>
    )
  }

  // ─── Completed View (Dispute Resolved) ───
  if (isComplete) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">✓</span></div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Dispute Resolved</p>
              <p className="text-xs text-emerald-600">3-way match is now successful.</p>
            </div>
          </div>
        </div>
        
        {amendment && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-3">PO Amendment Applied</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-slate-500">Original Qty:</span><span className="font-medium text-slate-800 text-right">{amendment.originalQuantity}</span>
              <span className="text-slate-500">New Qty:</span><span className="font-bold text-indigo-700 text-right">{amendment.newQuantity}</span>
              <span className="text-slate-500">Reason:</span><span className="text-slate-800 text-right">{amendment.reason}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-6 stagger-children">
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold text-red-800 uppercase tracking-widest">Discrepancy Details</p>
          <Badge variant="destructive">Action Required</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-center">
          <div className="bg-white rounded-lg p-2 border border-red-100 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">PO {amendment ? '(Amended)' : ''}</p>
            <p className="font-bold">{effPOQty}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-red-100 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">GRN</p>
            <p className="font-bold">{grn.receivedQuantity}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-red-100 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">Invoice</p>
            <p className="font-bold">{inv.billedQuantity}</p>
          </div>
        </div>
      </div>

      {!party ? (
        <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm animate-fade-in">
          <p className="font-semibold text-slate-800 text-sm">Assign Responsibility</p>
          <p className="text-xs text-slate-500">Who needs to resolve this mismatch?</p>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => handleSetParty('vendor')} className="text-xs h-auto py-3 flex-col gap-1 hover:border-indigo-300 hover:bg-indigo-50">
              <span className="text-lg mb-1">🏢</span> Vendor
            </Button>
            <Button variant="outline" onClick={() => handleSetParty('warehouse')} className="text-xs h-auto py-3 flex-col gap-1 hover:border-indigo-300 hover:bg-indigo-50">
              <span className="text-lg mb-1">📦</span> Warehouse
            </Button>
            <Button variant="outline" onClick={() => handleSetParty('procurement')} className="text-xs h-auto py-3 flex-col gap-1 hover:border-indigo-300 hover:bg-indigo-50">
              <span className="text-lg mb-1">👔</span> Procurement
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl p-5 space-y-5 bg-white shadow-sm animate-fade-in">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-slate-800 text-sm">Resolution Actions</p>
            <Badge className="bg-indigo-100 text-indigo-700">Assigned to: <span className="capitalize ml-1">{party}</span></Badge>
          </div>
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" id="correctGRN" checked={correctGRN} onChange={(e) => setCorrectGRN(e.target.checked)} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="correctGRN" className="text-sm font-medium">Correct GRN Quantity</Label>
                <p className="text-xs text-slate-500 mb-2">Warehouse recounted and found a different quantity.</p>
                {correctGRN && <Input type="number" value={newGRNQty} onChange={e => setNewGRNQty(e.target.value)} placeholder="New Qty" className="h-8 text-sm max-w-[120px]" />}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <input type="checkbox" id="correctInv" checked={correctInv} onChange={(e) => setCorrectInv(e.target.checked)} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="correctInv" className="text-sm font-medium">Correct Invoice Quantity</Label>
                <p className="text-xs text-slate-500 mb-2">Vendor sent a revised invoice.</p>
                {correctInv && <Input type="number" value={newInvQty} onChange={e => setNewInvQty(e.target.value)} placeholder="New Qty" className="h-8 text-sm max-w-[120px]" />}
              </div>
            </div>
          </div>
          
          <Button onClick={handleResolve} disabled={!correctGRN && !correctInv} className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-md">
            Save Corrections & Re-Match
          </Button>

          <Separator />

          <div className="pt-2">
            <Label className="text-sm font-medium text-amber-800 mb-1 block">Or: Amend Purchase Order</Label>
            <p className="text-xs text-slate-500 mb-3">If the mismatch is accepted (e.g. partial delivery accepted), raise a PO Amendment.</p>
            <div className="flex gap-2">
              <Input type="number" placeholder="New PO Qty" value={newPOQty} onChange={e => setNewPOQty(e.target.value)} className="w-1/3" />
              <Input placeholder="Reason for amendment..." value={amendReason} onChange={e => setAmendReason(e.target.value)} className="flex-1" />
            </div>
            <Button onClick={handleAmendPO} variant="outline" className="w-full mt-3 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold">
              Raise PO Amendment
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
