import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type StepStatus = 'locked' | 'active' | 'complete'

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

export interface Invoice {
  invoiceNumber: string
  billedQuantity: number
  billedAmount: number
}

export type MatchStatus = 'matched' | 'mismatched' | null
export type ResponsibleParty = 'vendor' | 'procurement' | 'warehouse' | null

export interface ProcurementState {
  currentStep: number
  request: ProcurementRequest | null
  requestApproved: boolean
  selectedVendor: Vendor | null
  allVendors: Vendor[]
  purchaseOrder: PurchaseOrder | null
  poAmendment: POAmendment | null
  grn: GRN | null
  invoice: Invoice | null
  matchStatus: MatchStatus
  responsibleParty: ResponsibleParty
  disputeResolved: boolean
  financeApproved: boolean | null
  paymentApproved: boolean
  completedAt: string | null
}

interface ProcurementContextType {
  state: ProcurementState
  submitRequest: (data: ProcurementRequest) => void
  approveRequest: () => void
  rejectRequest: () => void
  addVendor: (vendor: Vendor) => void
  selectVendor: (vendor: Vendor) => void
  generatePO: () => void
  approvePO: () => void
  submitGRN: (data: GRN) => void
  submitInvoice: (data: Invoice) => void
  runMatch: () => void
  setResponsibleParty: (party: ResponsibleParty) => void
  resolveDispute: (updatedGRN?: GRN, updatedInvoice?: Invoice) => void
  raisePOAmendment: (newQuantity: number, reason: string) => void
  approvePayment: () => void
  rejectPayment: () => void
  resetAll: () => void
}

const STORAGE_KEY = 'procurement-mvp-state'

const initialState: ProcurementState = {
  currentStep: 1,
  request: null,
  requestApproved: false,
  selectedVendor: null,
  allVendors: [],
  purchaseOrder: null,
  poAmendment: null,
  grn: null,
  invoice: null,
  matchStatus: null,
  responsibleParty: null,
  disputeResolved: false,
  financeApproved: null,
  paymentApproved: false,
  completedAt: null,
}

function loadState(): ProcurementState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...initialState, ...parsed }
    }
  } catch {
    // Ignore parse errors
  }
  return initialState
}

function saveState(state: ProcurementState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors
  }
}

const ProcurementContext = createContext<ProcurementContextType | null>(null)

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProcurementState>(loadState)

  // Persist state to localStorage on every change
  useEffect(() => {
    saveState(state)
  }, [state])

  const getEffectivePOQuantity = useCallback(() => {
    if (state.poAmendment) return state.poAmendment.newQuantity
    return state.purchaseOrder?.quantity || 0
  }, [state.poAmendment, state.purchaseOrder])

  const submitRequest = (data: ProcurementRequest) => {
    setState((s) => ({ ...s, request: data, currentStep: 2 }))
  }

  const approveRequest = () => {
    setState((s) => ({ ...s, requestApproved: true, currentStep: 3 }))
  }

  const rejectRequest = () => {
    setState((s) => ({ ...s, request: null, requestApproved: false, currentStep: 1 }))
  }

  const addVendor = (vendor: Vendor) => {
    setState((s) => ({ ...s, allVendors: [...s.allVendors, vendor] }))
  }

  const selectVendor = (vendor: Vendor) => {
    setState((s) => ({ ...s, selectedVendor: vendor, currentStep: 4 }))
  }

  const generatePO = () => {
    const { request, selectedVendor } = state
    if (!request || !selectedVendor) return
    const po: PurchaseOrder = {
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      itemName: request.itemName,
      quantity: request.quantity,
      unitPrice: selectedVendor.quote,
      totalAmount: request.quantity * selectedVendor.quote,
      vendorName: selectedVendor.name,
      vendorEmail: selectedVendor.email,
      issuedAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, purchaseOrder: po }))
  }

  const approvePO = () => {
    setState((s) => ({ ...s, currentStep: 5 }))
  }

  const submitGRN = (data: GRN) => {
    setState((s) => ({ ...s, grn: data, currentStep: 6 }))
  }

  const submitInvoice = (data: Invoice) => {
    setState((s) => ({ ...s, invoice: data, currentStep: 7 }))
  }

  const runMatch = () => {
    const po = state.purchaseOrder
    const grn = state.grn
    const inv = state.invoice
    if (!po || !grn || !inv) return

    const effectiveQty = state.poAmendment ? state.poAmendment.newQuantity : po.quantity
    const matched =
      effectiveQty === grn.receivedQuantity &&
      grn.receivedQuantity === inv.billedQuantity

    setState((s) => ({
      ...s,
      matchStatus: matched ? 'matched' : 'mismatched',
      currentStep: matched ? 9 : 8,
      disputeResolved: matched ? true : s.disputeResolved,
    }))
  }

  const setResponsibleParty = (party: ResponsibleParty) => {
    setState((s) => ({ ...s, responsibleParty: party }))
  }

  const resolveDispute = (updatedGRN?: GRN, updatedInvoice?: Invoice) => {
    const newGRN = updatedGRN || state.grn
    const newInvoice = updatedInvoice || state.invoice
    const po = state.purchaseOrder
    if (!po || !newGRN || !newInvoice) return

    const effectiveQty = state.poAmendment ? state.poAmendment.newQuantity : po.quantity
    const matched =
      effectiveQty === newGRN.receivedQuantity &&
      newGRN.receivedQuantity === newInvoice.billedQuantity

    setState((s) => ({
      ...s,
      grn: newGRN,
      invoice: newInvoice,
      matchStatus: matched ? 'matched' : 'mismatched',
      disputeResolved: matched,
      currentStep: matched ? 9 : 8,
    }))
  }

  const raisePOAmendment = (newQuantity: number, reason: string) => {
    const po = state.purchaseOrder
    if (!po) return
    const amendment: POAmendment = {
      amendmentNumber: `AMD-${Date.now().toString().slice(-6)}`,
      originalPONumber: po.poNumber,
      originalQuantity: po.quantity,
      newQuantity,
      reason,
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, poAmendment: amendment }))
  }

  const approvePayment = () => {
    setState((s) => ({
      ...s,
      financeApproved: true,
      paymentApproved: true,
      currentStep: 10,
      completedAt: new Date().toISOString(),
    }))
  }

  const rejectPayment = () => {
    setState((s) => ({ ...s, financeApproved: false }))
  }

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState(initialState)
  }

  return (
    <ProcurementContext.Provider
      value={{
        state,
        submitRequest,
        approveRequest,
        rejectRequest,
        addVendor,
        selectVendor,
        generatePO,
        approvePO,
        submitGRN,
        submitInvoice,
        runMatch,
        setResponsibleParty,
        resolveDispute,
        raisePOAmendment,
        approvePayment,
        rejectPayment,
        resetAll,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  )
}

export function useProcurement() {
  const ctx = useContext(ProcurementContext)
  if (!ctx) throw new Error('useProcurement must be used within ProcurementProvider')
  return ctx
}
