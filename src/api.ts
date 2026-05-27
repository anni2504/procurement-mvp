// ─── Centralized API Client (MOCKED FOR CLIENT-SIDE ONLY) ───

// ─── Types ───
export interface WorkflowStep {
  stepNumber: number
  stepName: string
  status: 'pending' | 'in_progress' | 'completed'
  data: Record<string, any>
  startedAt: string | null
  completedAt: string | null
}

export interface WorkflowSummary {
  _id: string
  status: 'active' | 'completed' | 'cancelled'
  steps: WorkflowStep[]
  createdAt: string
  updatedAt: string
  completedAt: string | null
  completedSteps: number
  currentStep: number
  requestData: Record<string, any>
}

export interface WorkflowDetail extends WorkflowSummary {
  quotes: QuoteDetail[]
}

export interface QuoteDetail {
  _id: string
  workflowId: string
  vendorId: {
    _id: string
    name: string
    email: string
    category?: string
    rating?: number
    priceTier?: string
  }
  quoteAmount: number
  isSelected: boolean
  submittedAt: string
}

export interface VendorRecord {
  _id: string
  name: string
  email: string
  phone: string
  category: string
  rating: number
  priceTier: 'budget' | 'mid-range' | 'premium'
  location: string
  isActive: boolean
}

export interface VendorListResponse {
  vendors: VendorRecord[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── In-Memory Store ───

let mockWorkflows: WorkflowDetail[] = []
let mockVendors: VendorRecord[] = [
  { _id: 'v1', name: 'TechServe Solutions', email: 'sales@techserve.com', phone: '123-456-7890', category: 'IT Equipment', rating: 4.8, priceTier: 'premium', location: 'New York', isActive: true },
  { _id: 'v2', name: 'Office Needs Ltd.', email: 'hello@officeneeds.com', phone: '123-456-7891', category: 'Office Supplies', rating: 4.2, priceTier: 'budget', location: 'London', isActive: true },
  { _id: 'v3', name: 'CloudSoft Services', email: 'cloud@cloudsoft.com', phone: '123-456-7892', category: 'Software', rating: 4.9, priceTier: 'premium', location: 'San Francisco', isActive: true },
]
let mockQuotes: QuoteDetail[] = []

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

// ─── Workflow APIs ───

export async function fetchWorkflows(status?: string): Promise<WorkflowSummary[]> {
  await delay(300)
  if (status) return mockWorkflows.filter(w => w.status === status)
  return mockWorkflows
}

export async function fetchWorkflowsByStep(stepNum: number): Promise<WorkflowSummary[]> {
  await delay(300)
  return mockWorkflows.filter(w => w.currentStep === stepNum)
}

const STEP_NAMES = [
  'Purchase Requisition', 'Requisition Approval', 'Vendor Quotations & Selection', 
  'Purchase Order Generation', 'Goods Receipt Note (GRN)', 'Invoice Submission',
  '3-Way Matching', 'Dispute Resolution', 'Finance Authorization', 'Payment Processing'
]

export async function createWorkflow(): Promise<WorkflowDetail> {
  await delay(500)
  const steps: WorkflowStep[] = Array.from({ length: 10 }, (_, i) => ({
    stepNumber: i + 1,
    stepName: STEP_NAMES[i],
    status: i === 0 ? 'in_progress' : 'pending',
    data: {},
    startedAt: i === 0 ? new Date().toISOString() : null,
    completedAt: null,
  }))

  const newWf: WorkflowDetail = {
    _id: `wf-${Date.now()}`,
    status: 'active',
    steps,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    completedSteps: 0,
    currentStep: 1,
    requestData: {},
    quotes: []
  }
  
  mockWorkflows.push(newWf)
  return newWf
}

export async function fetchWorkflow(id: string): Promise<WorkflowDetail> {
  await delay(200)
  const wf = mockWorkflows.find(w => w._id === id)
  if (!wf) throw new Error('Workflow not found')
  return wf
}

export async function updateStep(
  workflowId: string,
  stepNum: number,
  payload: { status?: string; data?: Record<string, any> }
): Promise<WorkflowDetail> {
  await delay(300)
  const wf = mockWorkflows.find(w => w._id === workflowId)
  if (!wf) throw new Error('Workflow not found')

  const step = wf.steps.find(s => s.stepNumber === stepNum)
  if (!step) throw new Error('Step not found')

  if (payload.status) step.status = payload.status as any
  if (payload.status === 'completed' && !step.completedAt) step.completedAt = new Date().toISOString()
  if (payload.data) step.data = { ...step.data, ...payload.data }

  // Auto-progress to next step if completed
  if (payload.status === 'completed' && stepNum < 10) {
    const nextStep = wf.steps.find(s => s.stepNumber === stepNum + 1)
    if (nextStep && nextStep.status === 'pending') {
      nextStep.status = 'in_progress'
      nextStep.startedAt = new Date().toISOString()
      wf.currentStep = stepNum + 1
    }
  }

  wf.updatedAt = new Date().toISOString()
  return { ...wf }
}

export async function cancelWorkflow(id: string): Promise<void> {
  await delay(200)
  const wf = mockWorkflows.find(w => w._id === id)
  if (wf) wf.status = 'cancelled'
}

// ─── Vendor APIs ───

export async function fetchVendors(filters?: {
  category?: string
  price_tier?: string
  min_rating?: number
  search?: string
  page?: number
  limit?: number
}): Promise<VendorListResponse> {
  await delay(300)
  let filtered = [...mockVendors]

  if (filters?.search) {
    const s = filters.search.toLowerCase()
    filtered = filtered.filter(v => v.name.toLowerCase().includes(s) || v.category.toLowerCase().includes(s))
  }
  if (filters?.category) filtered = filtered.filter(v => v.category === filters.category)
  if (filters?.price_tier) filtered = filtered.filter(v => v.priceTier === filters.price_tier)
  if (filters?.min_rating) filtered = filtered.filter(v => v.rating >= filters.min_rating)

  return {
    vendors: filtered,
    pagination: {
      page: 1,
      limit: 10,
      total: filtered.length,
      totalPages: 1
    }
  }
}

// ─── Quote APIs ───

export async function submitQuote(workflowId: string, vendorId: string, quoteAmount: number): Promise<any> {
  await delay(300)
  const vendor = mockVendors.find(v => v._id === vendorId)
  if (!vendor) throw new Error('Vendor not found')

  const quote: QuoteDetail = {
    _id: `q-${Date.now()}`,
    workflowId,
    vendorId: vendor,
    quoteAmount,
    isSelected: false,
    submittedAt: new Date().toISOString()
  }
  mockQuotes.push(quote)
  
  const wf = mockWorkflows.find(w => w._id === workflowId)
  if (wf) wf.quotes.push(quote)
  
  return quote
}

export async function selectQuote(workflowId: string, quoteId: string): Promise<void> {
  await delay(200)
  const wf = mockWorkflows.find(w => w._id === workflowId)
  if (wf) {
    wf.quotes.forEach(q => {
      q.isSelected = q._id === quoteId
    })
  }
}

export async function fetchQuotes(workflowId: string): Promise<QuoteDetail[]> {
  await delay(200)
  return mockQuotes.filter(q => q.workflowId === workflowId)
}

// ─── Health ───

export async function checkHealth(): Promise<{ status: string; db: string }> {
  return { status: 'mocked', db: 'in-memory' }
}
