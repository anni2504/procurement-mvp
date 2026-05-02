import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

export interface CompletedProcurement {
  id: string
  request: ProcurementRequest
  selectedVendor: Vendor
  allVendors: Vendor[]
  purchaseOrder: PurchaseOrder
  poAmendment: POAmendment | null
  grn: GRN
  invoice: Invoice
  completedAt: string
}

export interface ProcurementState {
  currentStep: number
  request: ProcurementRequest | null
  requestApproved: boolean
  selectedVendor: Vendor | null
  allVendors: Vendor[]
  quotesFinalized: boolean
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
  history: CompletedProcurement[]
  nextInvoiceNumber: number
}

interface ProcurementContextType {
  state: ProcurementState
  submitRequest: (data: ProcurementRequest) => void
  approveRequest: () => void
  rejectRequest: () => void
  addVendor: (vendor: Vendor) => void
  finalizeQuotes: () => void
  selectVendor: (vendor: Vendor) => void
  generatePO: () => void
  approvePO: () => void
  submitGRN: (data: GRN) => void
  submitInvoice: (data: Omit<Invoice, 'invoiceNumber'>) => void
  runMatch: () => void
  setResponsibleParty: (party: ResponsibleParty) => void
  resolveDispute: (updatedGRN?: GRN, updatedInvoice?: Invoice) => void
  raisePOAmendment: (newQuantity: number, reason: string) => void
  approvePayment: () => void
  rejectPayment: () => void
  resetAll: () => void
}

const STORAGE_KEY = 'procurement-mvp-state'
const TOTAL_STEPS = 11

const getDefaultState = (): ProcurementState => ({
  currentStep: 1,
  request: null,
  requestApproved: false,
  selectedVendor: null,
  allVendors: [],
  quotesFinalized: false,
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
  history: [],
  nextInvoiceNumber: 1,
})

function loadState(): ProcurementState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...getDefaultState(), ...JSON.parse(saved) }
  } catch { /* ignore */ }
  return getDefaultState()
}

function saveState(state: ProcurementState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
}

const ProcurementContext = createContext<ProcurementContextType | null>(null)

export { TOTAL_STEPS }

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProcurementState>(loadState)

  useEffect(() => { saveState(state) }, [state])

  const submitRequest = (data: ProcurementRequest) =>
    setState(s => ({ ...s, request: data, currentStep: 2 }))

  const approveRequest = () =>
    setState(s => ({ ...s, requestApproved: true, currentStep: 3 }))

  const rejectRequest = () =>
    setState(s => ({ ...s, request: null, requestApproved: false, currentStep: 1 }))

  const addVendor = (vendor: Vendor) =>
    setState(s => ({ ...s, allVendors: [...s.allVendors, vendor] }))

  const finalizeQuotes = () =>
    setState(s => ({ ...s, quotesFinalized: true, currentStep: 4 }))

  const selectVendor = (vendor: Vendor) =>
    setState(s => ({ ...s, selectedVendor: vendor, currentStep: 5 }))

  const generatePO = () => {
    setState(s => {
      if (s.purchaseOrder || !s.request || !s.selectedVendor) return s
      const po: PurchaseOrder = {
        poNumber: `PO-${Date.now().toString().slice(-6)}`,
        itemName: s.request.itemName,
        quantity: s.request.quantity,
        unitPrice: s.selectedVendor.quote,
        totalAmount: s.request.quantity * s.selectedVendor.quote,
        vendorName: s.selectedVendor.name,
        vendorEmail: s.selectedVendor.email,
        issuedAt: new Date().toISOString(),
      }
      return { ...s, purchaseOrder: po }
    })
  }

  const approvePO = () =>
    setState(s => ({ ...s, currentStep: 6 }))

  const submitGRN = (data: GRN) =>
    setState(s => ({ ...s, grn: data, currentStep: 7 }))

  const submitInvoice = (data: Omit<Invoice, 'invoiceNumber'>) =>
    setState(s => {
      const invNum = `INV-${s.nextInvoiceNumber.toString().padStart(4, '0')}`
      return {
        ...s,
        invoice: { ...data, invoiceNumber: invNum },
        nextInvoiceNumber: s.nextInvoiceNumber + 1,
        currentStep: 8,
      }
    })

  const runMatch = () =>
    setState(s => {
      const po = s.purchaseOrder; const grn = s.grn; const inv = s.invoice
      if (!po || !grn || !inv) return s
      const effQty = s.poAmendment ? s.poAmendment.newQuantity : po.quantity
      const matched = effQty === grn.receivedQuantity && grn.receivedQuantity === inv.billedQuantity
      return { ...s, matchStatus: matched ? 'matched' : 'mismatched', currentStep: matched ? 10 : 9, disputeResolved: matched || s.disputeResolved }
    })

  const setResponsibleParty = (party: ResponsibleParty) =>
    setState(s => ({ ...s, responsibleParty: party }))

  const resolveDispute = (updatedGRN?: GRN, updatedInvoice?: Invoice) =>
    setState(s => {
      const newGRN = updatedGRN || s.grn
      const newInvoice = updatedInvoice || s.invoice
      const po = s.purchaseOrder
      if (!po || !newGRN || !newInvoice) return s
      const effQty = s.poAmendment ? s.poAmendment.newQuantity : po.quantity
      const matched = effQty === newGRN.receivedQuantity && newGRN.receivedQuantity === newInvoice.billedQuantity
      return { ...s, grn: newGRN, invoice: newInvoice, matchStatus: matched ? 'matched' : 'mismatched', disputeResolved: matched, currentStep: matched ? 10 : 9 }
    })

  const raisePOAmendment = (newQuantity: number, reason: string) =>
    setState(s => {
      const po = s.purchaseOrder
      if (!po) return s
      return {
        ...s,
        poAmendment: {
          amendmentNumber: `AMD-${Date.now().toString().slice(-6)}`,
          originalPONumber: po.poNumber,
          originalQuantity: po.quantity,
          newQuantity,
          reason,
          createdAt: new Date().toISOString(),
        },
      }
    })

  const approvePayment = () =>
    setState(s => {
      const now = new Date().toISOString()
      const entry: CompletedProcurement | null =
        s.request && s.selectedVendor && s.purchaseOrder && s.grn && s.invoice
          ? {
              id: `PROC-${Date.now()}`,
              request: s.request,
              selectedVendor: s.selectedVendor,
              allVendors: s.allVendors,
              purchaseOrder: s.purchaseOrder,
              poAmendment: s.poAmendment,
              grn: s.grn,
              invoice: s.invoice,
              completedAt: now,
            }
          : null
      return {
        ...s,
        financeApproved: true,
        paymentApproved: true,
        currentStep: 11,
        completedAt: now,
        history: entry ? [...s.history, entry] : s.history,
      }
    })

  const rejectPayment = () =>
    setState(s => ({ ...s, financeApproved: false }))

  const resetAll = () =>
    setState(s => ({
      ...getDefaultState(),
      history: s.history,
      nextInvoiceNumber: s.nextInvoiceNumber,
    }))

  return (
    <ProcurementContext.Provider value={{
      state, submitRequest, approveRequest, rejectRequest, addVendor,
      finalizeQuotes, selectVendor, generatePO, approvePO, submitGRN,
      submitInvoice, runMatch, setResponsibleParty, resolveDispute,
      raisePOAmendment, approvePayment, rejectPayment, resetAll,
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
