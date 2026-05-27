// ─── Centralized API Client ───
const API_BASE = '/api'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `API error: ${res.status}`)
  }
  return res.json()
}

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

// ─── Workflow APIs ───

export async function fetchWorkflows(status?: string): Promise<WorkflowSummary[]> {
  const qs = status ? `?status=${status}` : ''
  return apiFetch<WorkflowSummary[]>(`/workflows${qs}`)
}

export async function fetchWorkflowsByStep(stepNum: number): Promise<WorkflowSummary[]> {
  return apiFetch<WorkflowSummary[]>(`/workflows/by-step/${stepNum}`)
}

export async function createWorkflow(): Promise<WorkflowDetail> {
  return apiFetch<WorkflowDetail>('/workflows', { method: 'POST' })
}

export async function fetchWorkflow(id: string): Promise<WorkflowDetail> {
  return apiFetch<WorkflowDetail>(`/workflows/${id}`)
}

export async function updateStep(
  workflowId: string,
  stepNum: number,
  payload: { status?: string; data?: Record<string, any> }
): Promise<WorkflowDetail> {
  return apiFetch<WorkflowDetail>(`/workflows/${workflowId}/steps/${stepNum}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function cancelWorkflow(id: string): Promise<void> {
  await apiFetch(`/workflows/${id}`, { method: 'DELETE' })
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
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
    })
  }
  const qs = params.toString() ? `?${params.toString()}` : ''
  return apiFetch<VendorListResponse>(`/vendors${qs}`)
}

// ─── Quote APIs ───

export async function submitQuote(
  workflowId: string,
  vendorId: string,
  quoteAmount: number
): Promise<any> {
  return apiFetch(`/workflows/${workflowId}/quotes`, {
    method: 'POST',
    body: JSON.stringify({ vendor_id: vendorId, quote_amount: quoteAmount }),
  })
}

export async function selectQuote(workflowId: string, quoteId: string): Promise<void> {
  await apiFetch(`/workflows/${workflowId}/quotes/${quoteId}/select`, { method: 'PUT' })
}

export async function fetchQuotes(workflowId: string): Promise<QuoteDetail[]> {
  return apiFetch<QuoteDetail[]>(`/workflows/${workflowId}/quotes`)
}

// ─── Health ───

export async function checkHealth(): Promise<{ status: string; db: string }> {
  return apiFetch('/health')
}
