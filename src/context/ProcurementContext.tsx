import React, { createContext, useContext, useState, ReactNode } from 'react'

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

export interface ProcurementState {
  currentStep: number
  request: ProcurementRequest | null
  selectedVendor: Vendor | null
  purchaseOrder: PurchaseOrder | null
  grn: GRN | null
  invoice: Invoice | null
  matchStatus: MatchStatus
  disputeResolved: boolean
  paymentApproved: boolean
}

interface ProcurementContextType {
  state: ProcurementState
  submitRequest: (data: ProcurementRequest) => void
  approveRequest: () => void
  selectVendor: (vendor: Vendor) => void
  generatePO: () => void
  approvePO: () => void
  submitGRN: (data: GRN) => void
  submitInvoice: (data: Invoice) => void
  resolveDispute: (updatedGRN?: GRN, updatedInvoice?: Invoice) => void
  approvePayment: () => void
  rejectPayment: () => void
  resetAll: () => void
}

const initialState: ProcurementState = {
  currentStep: 1,
  request: null,
  selectedVendor: null,
  purchaseOrder: null,
  grn: null,
  invoice: null,
  matchStatus: null,
  disputeResolved: false,
  paymentApproved: false,
}

const ProcurementContext = createContext<ProcurementContextType | null>(null)

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProcurementState>(initialState)

  const goToStep = (step: number) =>
    setState((s) => ({ ...s, currentStep: step }))

  const submitRequest = (data: ProcurementRequest) => {
    setState((s) => ({ ...s, request: data, currentStep: 2 }))
  }

  const approveRequest = () => {
    goToStep(3)
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
      unitPrice: request.unitPrice,
      totalAmount: request.quantity * request.unitPrice,
      vendorName: selectedVendor.name,
      vendorEmail: selectedVendor.email,
    }
    setState((s) => ({ ...s, purchaseOrder: po }))
  }

  const approvePO = () => {
    goToStep(5)
  }

  const submitGRN = (data: GRN) => {
    setState((s) => ({ ...s, grn: data, currentStep: 6 }))
  }

  const submitInvoice = (data: Invoice) => {
    // Run 3-way match immediately
    const po = state.purchaseOrder
    const grn = state.grn
    if (!po || !grn) return

    const matched =
      po.quantity === grn.receivedQuantity &&
      grn.receivedQuantity === data.billedQuantity

    setState((s) => ({
      ...s,
      invoice: data,
      matchStatus: matched ? 'matched' : 'mismatched',
      currentStep: matched ? 9 : 8,
    }))
  }

  const resolveDispute = (updatedGRN?: GRN, updatedInvoice?: Invoice) => {
    const newGRN = updatedGRN || state.grn
    const newInvoice = updatedInvoice || state.invoice
    const po = state.purchaseOrder
    if (!po || !newGRN || !newInvoice) return

    const matched =
      po.quantity === newGRN.receivedQuantity &&
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

  const approvePayment = () => {
    setState((s) => ({ ...s, paymentApproved: true, currentStep: 10 }))
  }

  const rejectPayment = () => {
    setState((s) => ({ ...s, currentStep: 8 }))
  }

  const resetAll = () => {
    setState(initialState)
  }

  return (
    <ProcurementContext.Provider
      value={{
        state,
        submitRequest,
        approveRequest,
        selectVendor,
        generatePO,
        approvePO,
        submitGRN,
        submitInvoice,
        resolveDispute,
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
