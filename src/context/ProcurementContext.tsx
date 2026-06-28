import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import * as api from '../api'
import type { WorkflowSummary, WorkflowDetail, WorkflowStep } from '../api'

export type StepStatus = 'pending' | 'in_progress' | 'completed'
export const TOTAL_STEPS = 10

// ─── Helpers to extract typed data from workflow steps ───

export interface ProcurementRequest {
  itemName: string
  quantity: number
  unitPrice: number
  category: string
  justification: string
}

export interface Vendor {
  name: string
  email: string
  quote: number
}

export interface PurchaseOrder {
  poNumber: string
  itemName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  vendorName: string
  vendorEmail: string
  issuedAt: string
}

export interface POAmendment {
  amendmentNumber: string
  originalPONumber: string
  originalQuantity: number
  newQuantity: number
  reason: string
  createdAt: string
}

export interface GRN {
  receivedQuantity: number
  condition: string
  notes: string
}

export interface GRNDocument {
  grnNumber: string
  poNumber: string
  receivedQuantity: number
  condition: string
  inspectedBy: string
  generatedAt: string
}

export interface Invoice {
  invoiceNumber: string
  billedQuantity: number
  billedAmount: number
}

export type MatchStatus = 'matched' | 'mismatched' | null
export type ResponsibleParty = 'vendor' | 'procurement' | 'warehouse' | null

// ─── App State ───

export interface AppState {
  workflows: WorkflowSummary[]
  activeWorkflowId: string | null
  activeWorkflow: WorkflowDetail | null
  stepCounts: Record<number, number>  // count of workflows at each step
  loading: boolean
  error: string | null
}

// ─── Helper: extract data from active workflow ───

export function getStepData(workflow: WorkflowDetail | null, stepNum: number): Record<string, any> {
  if (!workflow) return {}
  const step = workflow.steps.find(s => s.stepNumber === stepNum)
  return step?.data || {}
}

export function getStepStatus(workflow: WorkflowDetail | null, stepNum: number): StepStatus {
  if (!workflow) return 'pending'
  const step = workflow.steps.find(s => s.stepNumber === stepNum)
  return (step?.status as StepStatus) || 'pending'
}

export function getRequest(workflow: WorkflowDetail | null): ProcurementRequest | null {
  const data = getStepData(workflow, 1)
  if (!data.itemName) return null
  return data as ProcurementRequest
}

export function getPurchaseOrder(workflow: WorkflowDetail | null): PurchaseOrder | null {
  const data = getStepData(workflow, 4)
  if (!data.poNumber) return null
  return data as PurchaseOrder
}

export function getGRN(workflow: WorkflowDetail | null): GRN | null {
  const data = getStepData(workflow, 5)
  if (data.receivedQuantity === undefined) return null
  return data as GRN
}

export function getGRNDocument(workflow: WorkflowDetail | null): GRNDocument | null {
  const data = getStepData(workflow, 5)
  if (!data.grnNumber) return null
  return data as GRNDocument
}

export function getInvoice(workflow: WorkflowDetail | null): Invoice | null {
  const data = getStepData(workflow, 6)
  if (!data.invoiceNumber) return null
  return data as Invoice
}

export function getMatchStatus(workflow: WorkflowDetail | null): MatchStatus {
  const data = getStepData(workflow, 7)
  return (data.matchStatus as MatchStatus) || null
}

export function getPOAmendment(workflow: WorkflowDetail | null): POAmendment | null {
  const data = getStepData(workflow, 8)
  if (!data.amendmentNumber) return null
  return data as POAmendment
}

export function getResponsibleParty(workflow: WorkflowDetail | null): ResponsibleParty {
  const data = getStepData(workflow, 8)
  return (data.responsibleParty as ResponsibleParty) || null
}

export function getFinanceApproved(workflow: WorkflowDetail | null): boolean | null {
  const data = getStepData(workflow, 9)
  if (data.financeApproved === undefined) return null
  return data.financeApproved as boolean
}

export function getPaymentApproved(workflow: WorkflowDetail | null): boolean {
  const data = getStepData(workflow, 10)
  return data.paymentApproved === true
}

export function getStepStatuses(workflow: WorkflowDetail | null): Record<number, StepStatus> {
  const statuses: Record<number, StepStatus> = {}
  for (let i = 1; i <= TOTAL_STEPS; i++) statuses[i] = 'pending'
  if (!workflow) return statuses
  for (const step of workflow.steps) {
    statuses[step.stepNumber] = step.status as StepStatus
  }
  return statuses
}

export function getCurrentStep(workflow: WorkflowDetail | null): number {
  if (!workflow) return 1
  const inProgress = workflow.steps.find(s => s.status === 'in_progress')
  if (inProgress) return inProgress.stepNumber
  const firstPending = workflow.steps.find(s => s.status === 'pending')
  return firstPending?.stepNumber || TOTAL_STEPS
}

interface ProcurementContextType {
  state: AppState

  // Auth state & actions
  currentUser: api.User | null
  authLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void

  // Workflow management
  loadWorkflows: () => Promise<void>
  loadWorkflow: (id: string) => Promise<void>
  createNewWorkflow: () => Promise<string>  // returns new workflow ID
  switchWorkflow: (id: string) => Promise<void>
  cancelCurrentWorkflow: () => Promise<void>

  // Step actions (all async, hit API)
  submitRequest: (data: ProcurementRequest) => Promise<void>
  approveRequest: () => Promise<void>
  rejectRequest: () => Promise<void>
  addVendorQuote: (vendorName: string, vendorEmail: string, quoteAmount: number) => Promise<void>
  finalizeQuotes: () => Promise<void>
  selectVendor: (vendorName: string, vendorEmail: string, quote: number) => Promise<void>
  generatePO: () => Promise<void>
  approvePO: () => Promise<void>
  submitGoodsReceipt: (data: GRN) => Promise<void>
  generateGRN: (inspectedBy: string) => Promise<void>
  submitInvoice: (data: Omit<Invoice, 'invoiceNumber'>) => Promise<void>
  runMatch: () => Promise<void>
  setResponsibleParty: (party: ResponsibleParty) => Promise<void>
  resolveDispute: (updatedGRN?: GRN, updatedInvoice?: Invoice) => Promise<void>
  raisePOAmendment: (newQuantity: number, reason: string) => Promise<void>
  approveFinance: () => Promise<void>
  rejectFinance: () => Promise<void>
  processPayment: () => Promise<void>

  // Step count for sidebar
  loadStepCounts: () => Promise<void>
}

const ProcurementContext = createContext<ProcurementContextType | null>(null)

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<api.User | null>(null)
  const [authLoading, setAuthLoading] = useState<boolean>(true)
  const [state, setState] = useState<AppState>({
    workflows: [],
    activeWorkflowId: null,
    activeWorkflow: null,
    stepCounts: {},
    loading: false,
    error: null,
  })

  // ─── Auth Actions ───

  const logout = useCallback(() => {
    api.logout()
    setCurrentUser(null)
    setState(s => ({
      ...s,
      workflows: [],
      activeWorkflowId: null,
      activeWorkflow: null,
      stepCounts: {},
    }))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true }))
    try {
      const data = await api.login(email, password)
      setCurrentUser(data.user)
      setState(s => ({ ...s, error: null }))
      
      // Load initial workflows
      const workflows = await api.fetchWorkflows('active')
      setState(s => ({ ...s, workflows }))
    } catch (err) {
      setState(s => ({ ...s, error: (err as Error).message }))
      throw err
    } finally {
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  // Auto load auth
  useEffect(() => {
    async function checkAuth() {
      const token = api.getToken()
      if (token) {
        try {
          const user = await api.fetchCurrentUser()
          setCurrentUser(user)
          
          // Load workflows
          const workflows = await api.fetchWorkflows('active')
          setState(s => ({ ...s, workflows }))
        } catch (err) {
          api.logout()
        }
      }
      setAuthLoading(false)
    }
    checkAuth()
  }, [])

  // ─── Workflow Management ───

  const loadWorkflows = useCallback(async () => {
    try {
      const workflows = await api.fetchWorkflows('active')
      setState(s => ({ ...s, workflows, error: null }))
    } catch (err) {
      setState(s => ({ ...s, error: (err as Error).message }))
    }
  }, [])

  const loadStepCounts = useCallback(async () => {
    try {
      const workflows = await api.fetchWorkflows('active')
      const counts: Record<number, number> = {}
      for (let i = 1; i <= TOTAL_STEPS; i++) counts[i] = 0

      for (const w of workflows) {
        const step = w.currentStep || 1
        if (step >= 1 && step <= TOTAL_STEPS) {
          counts[step] = (counts[step] || 0) + 1
        }
      }
      setState(s => ({ ...s, stepCounts: counts, workflows }))
    } catch (err) {
      // silently fail
    }
  }, [])

  const loadWorkflow = useCallback(async (id: string) => {
    setState(s => ({ ...s, loading: true }))
    try {
      const workflow = await api.fetchWorkflow(id)
      setState(s => ({
        ...s,
        activeWorkflowId: id,
        activeWorkflow: workflow,
        loading: false,
        error: null,
      }))
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }))
    }
  }, [])

  const createNewWorkflow = useCallback(async (): Promise<string> => {
    setState(s => ({ ...s, loading: true }))
    try {
      const workflow = await api.createWorkflow()
      setState(s => ({
        ...s,
        activeWorkflowId: workflow._id,
        activeWorkflow: workflow,
        loading: false,
        error: null,
      }))
      loadStepCounts()
      return workflow._id
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }))
      throw err
    }
  }, [loadStepCounts])

  const switchWorkflow = useCallback(async (id: string) => {
    await loadWorkflow(id)
  }, [loadWorkflow])

  const cancelCurrentWorkflow = useCallback(async () => {
    if (!state.activeWorkflowId) return
    try {
      await api.cancelWorkflow(state.activeWorkflowId)
      setState(s => ({
        ...s,
        activeWorkflowId: null,
        activeWorkflow: null,
      }))
      loadStepCounts()
    } catch (err) {
      setState(s => ({ ...s, error: (err as Error).message }))
    }
  }, [state.activeWorkflowId, loadStepCounts])

  // ─── Helper: update step and refresh state ───

  const updateStepAndRefresh = useCallback(async (
    stepNum: number,
    payload: { status?: string; data?: Record<string, any> }
  ) => {
    if (!state.activeWorkflowId) throw new Error('No active workflow')
    const updated = await api.updateStep(state.activeWorkflowId, stepNum, payload)
    setState(s => ({
      ...s,
      activeWorkflow: updated,
    }))
    loadStepCounts()
    return updated
  }, [state.activeWorkflowId, loadStepCounts])

  // ─── Step 1: Purchase Requisition ───

  const submitRequest = useCallback(async (data: ProcurementRequest) => {
    await updateStepAndRefresh(1, {
      status: 'completed',
      data,
    })
  }, [updateStepAndRefresh])

  // ─── Step 2: Requisition Approval ───

  const approveRequest = useCallback(async () => {
    await updateStepAndRefresh(2, {
      status: 'completed',
      data: { approved: true, approvedAt: new Date().toISOString() },
    })
  }, [updateStepAndRefresh])

  const rejectRequest = useCallback(async () => {
    if (!state.activeWorkflowId) return
    await api.updateStep(state.activeWorkflowId, 2, {
      status: 'pending',
      data: { approved: false, rejectedAt: new Date().toISOString() },
    })
    await api.updateStep(state.activeWorkflowId, 1, {
      status: 'in_progress',
      data: {},
    })
    await loadWorkflow(state.activeWorkflowId)
    loadStepCounts()
  }, [state.activeWorkflowId, loadWorkflow, loadStepCounts])

  // ─── Step 3: Vendor Quotations & Selection ───

  const addVendorQuote = useCallback(async (vendorName: string, vendorEmail: string, quoteAmount: number) => {
    if (!state.activeWorkflowId || !state.activeWorkflow) return

    const currentData = getStepData(state.activeWorkflow, 3)
    const vendors = currentData.vendors || []
    vendors.push({ name: vendorName, email: vendorEmail, quote: quoteAmount })

    await updateStepAndRefresh(3, {
      status: 'in_progress',
      data: { ...currentData, vendors },
    })
  }, [state.activeWorkflowId, state.activeWorkflow, updateStepAndRefresh])

  const finalizeQuotes = useCallback(async () => {
    if (!state.activeWorkflow) return
    const currentData = getStepData(state.activeWorkflow, 3)
    await updateStepAndRefresh(3, {
      data: { ...currentData, quotesFinalized: true },
    })
  }, [state.activeWorkflow, updateStepAndRefresh])

  const selectVendor = useCallback(async (vendorName: string, vendorEmail: string, quote: number) => {
    if (!state.activeWorkflowId || !state.activeWorkflow) return

    const currentData = getStepData(state.activeWorkflow, 3)
    await api.updateStep(state.activeWorkflowId, 3, {
      status: 'completed',
      data: { ...currentData, selectedVendor: { name: vendorName, email: vendorEmail, quote }, vendorSelected: true },
    })

    await loadWorkflow(state.activeWorkflowId)
    loadStepCounts()
  }, [state.activeWorkflowId, state.activeWorkflow, loadWorkflow, loadStepCounts])

  // ─── Step 4: Purchase Order ───

  const generatePO = useCallback(async () => {
    if (!state.activeWorkflow) return
    const request = getRequest(state.activeWorkflow)
    const step3Data = getStepData(state.activeWorkflow, 3)
    const vendor = step3Data.selectedVendor
    if (!request || !vendor) return

    const po: PurchaseOrder = {
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      itemName: request.itemName,
      quantity: request.quantity,
      unitPrice: vendor.quote,
      totalAmount: request.quantity * vendor.quote,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      issuedAt: new Date().toISOString(),
    }

    await updateStepAndRefresh(4, { data: po })
  }, [state.activeWorkflow, updateStepAndRefresh])

  const approvePO = useCallback(async () => {
    await updateStepAndRefresh(4, { status: 'completed' })
  }, [updateStepAndRefresh])

  // ─── Step 5: Goods Receipt (GRN) ───

  const submitGoodsReceipt = useCallback(async (data: GRN) => {
    await updateStepAndRefresh(5, { status: 'in_progress', data })
  }, [updateStepAndRefresh])

  const generateGRN = useCallback(async (inspectedBy: string) => {
    if (!state.activeWorkflow) return
    const grn = getGRN(state.activeWorkflow)
    const po = getPurchaseOrder(state.activeWorkflow)
    if (!grn || !po) return

    const grnDoc: GRNDocument = {
      grnNumber: `GRN-${Date.now().toString().slice(-6)}`,
      poNumber: po.poNumber,
      receivedQuantity: grn.receivedQuantity,
      condition: grn.condition,
      inspectedBy,
      generatedAt: new Date().toISOString(),
    }

    await updateStepAndRefresh(5, { status: 'completed', data: { ...grn, ...grnDoc } })
  }, [state.activeWorkflow, updateStepAndRefresh])

  // ─── Step 6: Invoice Submission ───

  const submitInvoice = useCallback(async (data: Omit<Invoice, 'invoiceNumber'>) => {
    const invNum = `INV-${Date.now().toString().slice(-6)}`
    await updateStepAndRefresh(6, {
      status: 'completed',
      data: { ...data, invoiceNumber: invNum },
    })
  }, [updateStepAndRefresh])

  // ─── Step 7: 3-Way Match ───

  const runMatch = useCallback(async () => {
    if (!state.activeWorkflow) return
    const po = getPurchaseOrder(state.activeWorkflow)
    const grn = getGRN(state.activeWorkflow)
    const inv = getInvoice(state.activeWorkflow)
    const amendment = getPOAmendment(state.activeWorkflow)

    if (!po || !grn || !inv) return

    const effQty = amendment ? amendment.newQuantity : po.quantity
    const matched = effQty === grn.receivedQuantity && grn.receivedQuantity === inv.billedQuantity
    const matchStatus = matched ? 'matched' : 'mismatched'

    if (!state.activeWorkflowId) return

    await api.updateStep(state.activeWorkflowId, 7, {
      status: 'completed',
      data: { matchStatus },
    })

    if (matched) {
      await api.updateStep(state.activeWorkflowId, 8, {
        status: 'completed',
        data: { skipped: true, disputeResolved: true },
      })
    }

    await loadWorkflow(state.activeWorkflowId)
    loadStepCounts()
  }, [state.activeWorkflow, state.activeWorkflowId, loadWorkflow, loadStepCounts])

  // ─── Step 8: Dispute Resolution ───

  const setResponsibleParty = useCallback(async (party: ResponsibleParty) => {
    if (!state.activeWorkflow) return
    const currentData = getStepData(state.activeWorkflow, 8)
    await updateStepAndRefresh(8, {
      data: { ...currentData, responsibleParty: party },
    })
  }, [state.activeWorkflow, updateStepAndRefresh])

  const resolveDispute = useCallback(async (updatedGRN?: GRN, updatedInvoice?: Invoice) => {
    if (!state.activeWorkflow || !state.activeWorkflowId) return
    const po = getPurchaseOrder(state.activeWorkflow)
    const grn = updatedGRN || getGRN(state.activeWorkflow)
    const inv = updatedInvoice || getInvoice(state.activeWorkflow)
    const amendment = getPOAmendment(state.activeWorkflow)

    if (!po || !grn || !inv) return

    if (updatedGRN) {
      await api.updateStep(state.activeWorkflowId, 5, { data: { ...getStepData(state.activeWorkflow, 5), ...updatedGRN } })
    }
    if (updatedInvoice) {
      await api.updateStep(state.activeWorkflowId, 6, { data: updatedInvoice })
    }

    const effQty = amendment ? amendment.newQuantity : po.quantity
    const matched = effQty === grn.receivedQuantity && grn.receivedQuantity === inv.billedQuantity

    await api.updateStep(state.activeWorkflowId, 7, {
      data: { matchStatus: matched ? 'matched' : 'mismatched' },
    })

    if (matched) {
      await api.updateStep(state.activeWorkflowId, 8, {
        status: 'completed',
        data: { disputeResolved: true },
      })
    }

    await loadWorkflow(state.activeWorkflowId)
    loadStepCounts()
  }, [state.activeWorkflow, state.activeWorkflowId, loadWorkflow, loadStepCounts])

  const raisePOAmendment = useCallback(async (newQuantity: number, reason: string) => {
    if (!state.activeWorkflow) return
    const po = getPurchaseOrder(state.activeWorkflow)
    if (!po) return

    const currentData = getStepData(state.activeWorkflow, 8)
    const amendment: POAmendment = {
      amendmentNumber: `AMD-${Date.now().toString().slice(-6)}`,
      originalPONumber: po.poNumber,
      originalQuantity: po.quantity,
      newQuantity,
      reason,
      createdAt: new Date().toISOString(),
    }

    await updateStepAndRefresh(8, {
      data: { ...currentData, ...amendment },
    })
  }, [state.activeWorkflow, updateStepAndRefresh])

  // ─── Step 9: Finance Authorization ───

  const approveFinance = useCallback(async () => {
    await updateStepAndRefresh(9, {
      status: 'completed',
      data: { financeApproved: true, approvedAt: new Date().toISOString() },
    })
  }, [updateStepAndRefresh])

  const rejectFinance = useCallback(async () => {
    await updateStepAndRefresh(9, {
      data: { financeApproved: false },
    })
  }, [updateStepAndRefresh])

  // ─── Step 10: Payment Processing ───

  const processPayment = useCallback(async () => {
    await updateStepAndRefresh(10, {
      status: 'completed',
      data: { paymentApproved: true, completedAt: new Date().toISOString() },
    })
  }, [updateStepAndRefresh])

  // ─── Initial Load ───

  useEffect(() => {
    if (currentUser) {
      loadStepCounts()
    }
  }, [loadStepCounts, currentUser])

  return (
    <ProcurementContext.Provider value={{
      state,
      currentUser,
      authLoading,
      login,
      logout,
      loadWorkflows,
      loadWorkflow,
      createNewWorkflow,
      switchWorkflow,
      cancelCurrentWorkflow,
      loadStepCounts,
      submitRequest,
      approveRequest,
      rejectRequest,
      addVendorQuote,
      finalizeQuotes,
      selectVendor,
      generatePO,
      approvePO,
      submitGoodsReceipt,
      generateGRN,
      submitInvoice,
      runMatch,
      setResponsibleParty,
      resolveDispute,
      raisePOAmendment,
      approveFinance,
      rejectFinance,
      processPayment,
    }}>
      {children}
    </ProcurementContext.Provider>
  )
}

export function useProcurement() {
  const ctx = useContext(ProcurementContext)
  if (!ctx) throw new Error('useProcurement must be used within ProcurementProvider')
  return ctx
}
