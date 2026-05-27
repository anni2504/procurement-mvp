import { useState } from 'react'
import { useProcurement, getRequest, getStepStatus, getStepData } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function Step3RFP() {
  const { state, selectVendor } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 4) === 'completed'
  const step3Data = getStepData(state.activeWorkflow, 3)
  const selected = step3Data.selectedVendor
  const vendors = step3Data.vendors || []
  const r = getRequest(state.activeWorkflow)
  
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const handleConfirm = async () => {
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
    <div className="space-y-4 stagger-children">
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
        <strong>Evaluate & Select</strong> — Review the vendor quotes below and select the best option.
      </div>

      {vendors.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">{vendors.length} Quote{vendors.length !== 1 ? 's' : ''} Received</p>
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
          <Button onClick={handleConfirm} disabled={selectedIdx === null}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-semibold">
            Confirm Vendor Selection →
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-6">No vendor quotes available. Go back to Step 3 to add quotes.</p>
      )}
    </div>
  )
}
