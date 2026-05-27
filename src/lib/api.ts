// ─── API Client for Accounts Payable Backend ───

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Workflows ───

export interface WorkflowSummary {
  id: string
  status: string
  created_at: string
  updated_at: string
  completed_at: string | null
  completed_steps: string
}

export interface WorkflowStep {
  id: string
  workflow_id: string
  step_number: number
  step_name: string
  status: 'pending' | 'in_progress' | 'completed'
  data: Record<string, any>
  started_at: string | null
  completed_at: string | null
}

export interface WorkflowQuote {
  id: string
  workflow_id: string
  vendor_id: string
  quote_amount: number
  is_selected: boolean
  submitted_at: string
  vendor_name: string
  vendor_email: string
  vendor_category?: string
}

export interface WorkflowDetail {
  id: string
  status: string
  created_at: string
  updated_at: string
  completed_at: string | null
  steps: WorkflowStep[]
  quotes: WorkflowQuote[]
}

export const workflowApi = {
  list: () => request<WorkflowSummary[]>('/workflows'),
  create: () => request<WorkflowDetail>('/workflows', { method: 'POST' }),
  get: (id: string) => request<WorkflowDetail>(`/workflows/${id}`),
  updateStep: (workflowId: string, stepNum: number, body: { status?: string; data?: any }) =>
    request<WorkflowStep>(`/workflows/${workflowId}/steps/${stepNum}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  submitQuote: (workflowId: string, vendorId: string, quoteAmount: number) =>
    request<any>(`/workflows/${workflowId}/quotes`, {
      method: 'POST',
      body: JSON.stringify({ vendor_id: vendorId, quote_amount: quoteAmount }),
    }),
  getQuotes: (workflowId: string) => request<WorkflowQuote[]>(`/workflows/${workflowId}/quotes`),
  selectQuote: (workflowId: string, quoteId: string) =>
    request<any>(`/workflows/${workflowId}/quotes/${quoteId}/select`, { method: 'PUT' }),
}

// ─── Vendors ───

export interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  category: string
  rating: number
  price_tier: string
  location: string
  is_active: boolean
  created_at: string
}

export interface VendorListResponse {
  vendors: Vendor[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface VendorCategory {
  category: string
  count: string
}

export const vendorApi = {
  list: (params?: {
    category?: string
    price_tier?: string
    min_rating?: number
    search?: string
    page?: number
    limit?: number
  }) => {
    const qs = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') qs.set(k, String(v))
      })
    }
    const query = qs.toString()
    return request<VendorListResponse>(`/vendors${query ? `?${query}` : ''}`)
  },
  categories: () => request<VendorCategory[]>('/vendors/categories'),
  add: (vendor: { name: string; email: string; phone?: string; category: string; rating?: number; price_tier?: string; location?: string }) =>
    request<Vendor>('/vendors', { method: 'POST', body: JSON.stringify(vendor) }),
  get: (id: string) => request<Vendor>(`/vendors/${id}`),
}
