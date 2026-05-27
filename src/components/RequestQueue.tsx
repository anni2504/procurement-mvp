import { useState, useEffect } from 'react'
import { useProcurement, getRequest, getCurrentStep, TOTAL_STEPS } from '../context/ProcurementContext'
import { fetchWorkflowsByStep } from '../api'
import type { WorkflowSummary } from '../api'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

interface RequestQueueProps {
  stepId: number
  onCreateNew?: () => void
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

export default function RequestQueue({ stepId, onCreateNew }: RequestQueueProps) {
  const { state, switchWorkflow } = useProcurement()
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchWorkflowsByStep(stepId)
      .then(data => {
        if (!cancelled) {
          // Filter to only show workflows that are actually actionable at this step
          const actionable = data.filter(w => {
            const step = w.steps.find(s => s.stepNumber === stepId)
            if (!step) return false
            return step.status === 'in_progress' || step.status === 'pending'
          })
          setWorkflows(actionable)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [stepId, state.activeWorkflow]) // Refresh when active workflow changes

  const activeId = state.activeWorkflowId

  if (loading) {
    return (
      <div className="mb-5 animate-pulse-soft">
        <div className="h-10 bg-slate-100 rounded-xl"></div>
      </div>
    )
  }

  // Don't show queue if no workflows and not step 1
  if (workflows.length === 0 && stepId !== 1) {
    return (
      <div className="mb-5 bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-400 font-medium">No pending requests at this step</p>
        {!state.activeWorkflow && (
          <p className="text-xs text-slate-300 mt-1">Create a new request from Step 1 to get started</p>
        )}
      </div>
    )
  }

  // For step 1, always show create button
  if (workflows.length === 0 && stepId === 1) {
    return (
      <div className="mb-5">
        {onCreateNew && (
          <Button
            onClick={onCreateNew}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 h-11 font-semibold shadow-md shadow-indigo-200/50"
          >
            ✦ Start New Procurement Request
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="mb-5 animate-fade-in">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100/80 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-600">{workflows.length}</span>
          </div>
          <span className="text-sm font-semibold text-slate-700">
            Pending Request{workflows.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {stepId === 1 && onCreateNew && (
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); onCreateNew() }}
              className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 font-semibold"
            >
              + New
            </Button>
          )}
          <span className={`text-slate-400 text-xs transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Expandable List */}
      {expanded && (
        <div className="mt-2 space-y-1.5 animate-fade-in">
          {workflows.map((w) => {
            const requestData = w.requestData || {}
            const isActive = activeId === w._id
            const step = w.steps.find(s => s.stepNumber === stepId)
            const stepStatus = step?.status || 'pending'
            const age = timeAgo(w.createdAt)

            return (
              <button
                key={w._id}
                onClick={() => switchWorkflow(w._id)}
                className={`w-full text-left rounded-xl p-3.5 border transition-all duration-200 group ${
                  isActive
                    ? 'border-indigo-300 bg-indigo-50/70 shadow-sm shadow-indigo-100'
                    : 'border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {requestData.itemName || 'New Request'}
                      </p>
                      {isActive && (
                        <Badge className="rounded-full text-[9px] px-1.5 py-0 bg-indigo-100 text-indigo-600 border-indigo-200">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {requestData.category && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {requestData.category}
                        </span>
                      )}
                      {requestData.quantity && (
                        <>
                          <span className="text-slate-200">·</span>
                          <span className="text-[10px] text-slate-400">
                            {requestData.quantity} units
                          </span>
                        </>
                      )}
                      {requestData.unitPrice && (
                        <>
                          <span className="text-slate-200">·</span>
                          <span className="text-[10px] text-indigo-400 font-semibold">
                            ₹{(requestData.quantity * requestData.unitPrice).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-medium ${
                      stepStatus === 'completed' ? 'text-emerald-500' :
                      stepStatus === 'in_progress' ? 'text-indigo-500' : 'text-slate-400'
                    }`}>
                      {stepStatus === 'completed' ? '✓ Done' :
                       stepStatus === 'in_progress' ? '● Active' : '○ Pending'}
                    </span>
                    <span className="text-[10px] text-slate-300">{age}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
