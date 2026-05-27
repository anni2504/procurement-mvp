import { useState } from 'react'
import { useProcurement, getGRN, getGRNDocument, getStepStatus } from '../context/ProcurementContext'
import { useToast } from '../context/ToastContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

export default function GRNNote() {
  const { state, generateGRN } = useProcurement()
  const { showToast } = useToast()
  
  const isComplete = getStepStatus(state.activeWorkflow, 7) === 'completed'
  const grnData = getGRN(state.activeWorkflow)
  const grnDoc = getGRNDocument(state.activeWorkflow)

  const [inspectedBy, setInspectedBy] = useState('Warehouse Manager')

  const handleGenerate = async () => {
    if (!inspectedBy.trim()) {
      showToast('Inspector name is required', 'error')
      return
    }
    try {
      await generateGRN(inspectedBy.trim())
      showToast('Official GRN Document generated successfully', 'success')
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  // ─── Shared GRN Doc Card ───
  const renderGRNCard = (doc: any) => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Goods Receipt Note</p>
          <p className="text-lg font-bold text-slate-800">{doc.grnNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Date Generated</p>
          <p className="font-medium text-slate-700">{new Date(doc.generatedAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-slate-400 mb-1">Related PO</p><p className="text-sm font-semibold text-slate-800">{doc.poNumber}</p></div>
          <div className="text-right"><p className="text-xs text-slate-400 mb-1">Inspected By</p><p className="text-sm font-medium text-slate-800">{doc.inspectedBy}</p></div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-slate-400 mb-1">Quantity Received</p><p className="text-sm font-bold text-slate-800">{doc.receivedQuantity} units</p></div>
          <div className="text-right"><p className="text-xs text-slate-400 mb-1">Condition Status</p>
            <Badge variant={doc.condition === 'good' ? 'success' : 'warning'} className="capitalize">{doc.condition}</Badge>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Completed View ───
  if (isComplete && grnDoc) {
    return (
      <div className="space-y-5 stagger-children">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-lg">✓</span></div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Official GRN Generated</p>
              <p className="text-xs text-emerald-600">Ready for 3-way matching</p>
            </div>
          </div>
        </div>
        {renderGRNCard(grnDoc)}
      </div>
    )
  }

  // ─── Active View ───
  return (
    <div className="space-y-5 stagger-children">
      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
          <span className="text-xl">📋</span>
        </div>
        <div>
          <p className="font-semibold text-slate-800">Generate Official GRN</p>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
            Generate the official Goods Receipt Note based on the logged delivery data.
          </p>
        </div>
        
        {grnData && (
          <div className="bg-white border border-slate-100 rounded-lg p-3 text-sm text-left max-w-sm mx-auto shadow-sm">
            <p className="text-xs text-slate-400 mb-2 font-semibold">Delivery Summary to be Documented:</p>
            <div className="flex justify-between"><span className="text-slate-500">Quantity:</span><span className="font-semibold">{grnData.receivedQuantity}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Condition:</span><span className="font-semibold capitalize">{grnData.condition}</span></div>
          </div>
        )}

        <div className="max-w-sm mx-auto text-left pt-2">
          <Label className="text-xs text-slate-500">Inspector Name</Label>
          <Input value={inspectedBy} onChange={e => setInspectedBy(e.target.value)} className="mt-1" />
        </div>

        <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-8 mt-2">
          Generate Document
        </Button>
      </div>
    </div>
  )
}
