// ─── Backend In-Memory Database Fallback for Serverless / Disconnected DB ───

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

// ─── Mock Generators ───

const STEP_NAMES = [
  'Purchase Requisition', 'Requisition Approval', 'Vendor Quotations & Selection', 
  'Purchase Order Generation', 'Goods Receipt Note (GRN)', 'Invoice Submission',
  '3-Way Matching', 'Dispute Resolution', 'Finance Authorization', 'Payment Processing'
]

const COMPANY_PREFIXES = ['Global', 'Tech', 'Prime', 'Cloud', 'Apex', 'Nexus', 'Vertex', 'Quantum', 'Stellar', 'Nova', 'Pinnacle', 'Summit', 'Crest', 'Zenith', 'Acme', 'Omega', 'Alpha', 'Beta', 'Gamma', 'Delta']
const COMPANY_SUFFIXES = ['Solutions', 'Systems', 'Technologies', 'Corp', 'Inc', 'LLC', 'Group', 'Enterprises', 'Partners', 'Associates', 'Networks', 'Services', 'Logistics', 'Industries', 'Manufacturing']
const CATEGORIES = ['IT Equipment', 'Office Supplies', 'Software', 'Services', 'Furniture', 'Hardware', 'Networking', 'Consulting']
const LOCATIONS = ['New York', 'London', 'San Francisco', 'Mumbai', 'Singapore', 'Tokyo', 'Berlin', 'Toronto', 'Sydney', 'Dubai']
const ITEMS = ['Laptops', 'Monitors', 'Servers', 'Office Chairs', 'Desks', 'Software Licenses', 'Cloud Storage', 'Printers', 'Network Switches', 'Security Cameras']

export let mockVendors: VendorRecord[] = []
export let mockWorkflows: WorkflowDetail[] = []
export let mockQuotes: QuoteDetail[] = []

// Initialize Vendors
for (let i = 1; i <= 35; i++) {
  const name = `${COMPANY_PREFIXES[i % COMPANY_PREFIXES.length]} ${COMPANY_SUFFIXES[i % COMPANY_SUFFIXES.length]}`
  mockVendors.push({
    _id: `v${i}`,
    name,
    email: `contact@${name.toLowerCase().replace(/ /g, '')}.com`,
    phone: `+1 800-555-${String(i).padStart(4, '0')}`,
    category: CATEGORIES[i % CATEGORIES.length],
    rating: Number((3.5 + (i % 15) * 0.1).toFixed(1)),
    priceTier: ['budget', 'mid-range', 'premium'][i % 3] as any,
    location: LOCATIONS[i % LOCATIONS.length],
    isActive: true,
  })
}

// Initialize Workflows (3 per step)
let wfCounter = 1
for (let currentStep = 1; currentStep <= 10; currentStep++) {
  for (let j = 0; j < 3; j++) {
    const itemName = ITEMS[(currentStep + j) % ITEMS.length]
    const qty = ((currentStep + j) * 3) + 1
    const price = 500 + (currentStep * 150)
    const vendor = mockVendors[(currentStep + j) % mockVendors.length]

    const steps: WorkflowStep[] = Array.from({ length: 10 }, (_, i) => {
      const stepNum = i + 1
      let status: 'pending' | 'in_progress' | 'completed' = 'pending'
      if (stepNum < currentStep) status = 'completed'
      else if (stepNum === currentStep) status = 'in_progress'

      let data: any = {}
      if (stepNum >= 1) {
        data = { itemName, quantity: qty, unitPrice: price, category: vendor.category, justification: 'Restock for department' }
      }
      if (stepNum >= 2) data = { ...data, approved: true, approvedAt: new Date().toISOString() }
      if (stepNum >= 3) {
        data = {
          ...data,
          vendors: [
            { name: vendor.name, email: vendor.email, quote: price - 50 },
            { name: 'Alt Vendor LLC', email: 'sales@altvendor.com', quote: price + 100 },
          ],
          quotesFinalized: true,
          selectedVendor: { name: vendor.name, email: vendor.email, quote: price - 50 },
          vendorSelected: true,
        }
      }
      if (stepNum >= 4) {
        data = {
          ...data,
          poNumber: `PO-MOCK-${1000 + wfCounter}`,
          totalAmount: qty * (price - 50),
          vendorName: vendor.name,
          vendorEmail: vendor.email,
          issuedAt: new Date().toISOString(),
        }
      }
      if (stepNum >= 5) {
        data = {
          ...data,
          receivedQuantity: qty,
          condition: 'good',
          notes: 'Inspected on dock. Count matches.',
          grnNumber: `GRN-MOCK-${1000 + wfCounter}`,
          inspectedBy: 'Dave Warehouse',
          generatedAt: new Date().toISOString(),
        }
      }
      if (stepNum >= 6) {
        data = {
          ...data,
          invoiceNumber: `INV-MOCK-${1000 + wfCounter}`,
          billedQuantity: qty,
          billedAmount: qty * (price - 50),
        }
      }
      if (stepNum >= 7) data = { ...data, matchStatus: 'matched' }
      if (stepNum >= 8) data = { ...data, disputeResolved: true, skipped: true }
      if (stepNum >= 9) data = { ...data, financeApproved: true, approvedAt: new Date().toISOString() }
      if (stepNum >= 10) data = { ...data, paymentApproved: true, completedAt: new Date().toISOString() }

      return {
        stepNumber: stepNum,
        stepName: STEP_NAMES[i],
        status,
        data,
        startedAt: status !== 'pending' ? new Date().toISOString() : null,
        completedAt: status === 'completed' ? new Date().toISOString() : null,
      }
    })

    const completedSteps = steps.filter(s => s.status === 'completed').length
    const reqData = steps[0].data

    mockWorkflows.push({
      _id: `wf-mock-${1000 + wfCounter++}`,
      status: currentStep === 10 ? 'completed' : 'active',
      steps,
      createdAt: new Date(Date.now() - (11 - currentStep) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: currentStep === 10 ? new Date().toISOString() : null,
      completedSteps,
      currentStep: currentStep === 10 ? 10 : currentStep,
      requestData: reqData,
      quotes: [],
    })
  }
}

// ─── Workflows Mock Methods ───

export function getMockWorkflows(status?: string) {
  if (status) return mockWorkflows.filter(w => w.status === status)
  return mockWorkflows
}

export function getMockWorkflowsByStep(stepNum: number) {
  return mockWorkflows.filter(w => {
    if (w.status === 'completed') return false
    const step = w.steps.find(s => s.stepNumber === stepNum)
    if (!step) return false
    if (step.status === 'in_progress') return true
    if (step.status === 'pending' && stepNum === 1) return true
    if (step.status === 'pending' && stepNum > 1) {
      const prevStep = w.steps.find(s => s.stepNumber === stepNum - 1)
      return prevStep?.status === 'completed'
    }
    if (step.status === 'completed') return true
    return false
  })
}

export function createMockWorkflow() {
  const steps: WorkflowStep[] = Array.from({ length: 10 }, (_, i) => ({
    stepNumber: i + 1,
    stepName: STEP_NAMES[i],
    status: i === 0 ? 'in_progress' : 'pending',
    data: {},
    startedAt: i === 0 ? new Date().toISOString() : null,
    completedAt: null,
  }))

  const newWf: WorkflowDetail = {
    _id: `wf-mock-${Date.now()}`,
    status: 'active',
    steps,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    completedSteps: 0,
    currentStep: 1,
    requestData: {},
    quotes: [],
  }

  mockWorkflows.push(newWf)
  return newWf
}

export function getMockWorkflow(id: string) {
  const wf = mockWorkflows.find(w => w._id === id)
  if (!wf) return null
  const quotes = mockQuotes.filter(q => q.workflowId === id)
  return { ...wf, quotes }
}

export function updateMockWorkflowStep(id: string, stepNum: number, status?: string, data?: any) {
  const wf = mockWorkflows.find(w => w._id === id)
  if (!wf) return null

  const step = wf.steps.find(s => s.stepNumber === stepNum)
  if (!step) return null

  if (status) {
    step.status = status as any
    if (status === 'in_progress' && !step.startedAt) step.startedAt = new Date().toISOString()
    if (status === 'completed') step.completedAt = new Date().toISOString()
  }

  if (data !== undefined) {
    step.data = { ...step.data, ...data }
  }

  // Auto-progress to next step
  if (status === 'completed' && stepNum < 10) {
    const nextStep = wf.steps.find(s => s.stepNumber === stepNum + 1)
    if (nextStep && nextStep.status === 'pending') {
      nextStep.status = 'in_progress'
      nextStep.startedAt = new Date().toISOString()
    }
  }

  // Complete workflow if step 10 complete
  if (stepNum === 10 && status === 'completed') {
    wf.status = 'completed'
    wf.completedAt = new Date().toISOString()
  }

  wf.updatedAt = new Date().toISOString()
  
  // Re-calculate derived fields
  wf.completedSteps = wf.steps.filter(s => s.status === 'completed').length
  wf.currentStep = wf.steps.find(s => s.status === 'in_progress')?.stepNumber || 10
  wf.requestData = wf.steps[0].data

  return getMockWorkflow(id)
}

export function cancelMockWorkflow(id: string) {
  const wf = mockWorkflows.find(w => w._id === id)
  if (wf) wf.status = 'cancelled'
  return { success: true }
}

// ─── Vendor Mock Methods ───

export function getMockVendorsList(filters?: any) {
  let filtered = [...mockVendors]
  
  if (filters?.search) {
    const s = filters.search.toLowerCase()
    filtered = filtered.filter(v => v.name.toLowerCase().includes(s) || v.category.toLowerCase().includes(s))
  }
  if (filters?.category) filtered = filtered.filter(v => v.category === filters.category)
  if (filters?.price_tier) filtered = filtered.filter(v => v.priceTier === filters.price_tier)
  if (filters?.min_rating) filtered = filtered.filter(v => v.rating >= parseFloat(filters.min_rating))

  return {
    vendors: filtered,
    pagination: {
      page: 1,
      limit: 50,
      total: filtered.length,
      totalPages: 1,
    }
  }
}

export function getMockVendorCategories() {
  const counts: Record<string, number> = {}
  mockVendors.forEach(v => {
    counts[v.category] = (counts[v.category] || 0) + 1
  })
  return Object.entries(counts).map(([category, count]) => ({ category, count }))
}

export function addMockVendor(vendor: any) {
  const newVendor: VendorRecord = {
    _id: `v${mockVendors.length + 1}`,
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone || '',
    category: vendor.category,
    rating: vendor.rating || 4.0,
    priceTier: vendor.price_tier || 'mid-range',
    location: vendor.location || 'San Francisco, CA',
    isActive: true,
  }
  mockVendors.push(newVendor)
  return newVendor
}

export function getMockVendor(id: string) {
  return mockVendors.find(v => v._id === id) || null
}

// ─── Quotes Mock Methods ───

export function submitMockQuote(workflowId: string, vendorId: string, quoteAmount: number) {
  const vendor = mockVendors.find(v => v._id === vendorId)
  const newQuote: QuoteDetail = {
    _id: `q-mock-${Date.now()}`,
    workflowId,
    vendorId: {
      _id: vendor?._id || vendorId,
      name: vendor?.name || 'Mock Vendor',
      email: vendor?.email || 'vendor@example.com',
      category: vendor?.category,
      rating: vendor?.rating,
      priceTier: vendor?.priceTier,
    },
    quoteAmount,
    isSelected: false,
    submittedAt: new Date().toISOString(),
  }
  mockQuotes.push(newQuote)
  return newQuote
}

export function selectMockQuote(workflowId: string, quoteId: string) {
  mockQuotes.forEach(q => {
    if (q.workflowId === workflowId) {
      q.isSelected = q._id === quoteId
    }
  })
  return { success: true }
}

export function getMockQuotes(workflowId: string) {
  return mockQuotes.filter(q => q.workflowId === workflowId)
}
