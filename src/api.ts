// ─── Centralized API Client (Connected to Express Backend) ───

// ─── Helper for LocalStorage Token ───
const TOKEN_KEY = 'procurement_auth_token'

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// ─── Base HTTP Request Helper ───
const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
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

// ─── Auth APIs ───

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'requester' | 'manager' | 'procurement' | 'warehouse' | 'vendor' | 'finance'
}

export interface LoginResponse {
  token: string
  user: User
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export async function fetchCurrentUser(): Promise<User> {
  const data = await request<{ user: User }>('/auth/me')
  return data.user
}

export function logout() {
  setToken(null)
}

// ─── Workflow APIs ───

export async function fetchWorkflows(status?: string): Promise<WorkflowSummary[]> {
  const url = status ? `/workflows?status=${status}` : '/workflows'
  return request<WorkflowSummary[]>(url)
}

export async function fetchWorkflowsByStep(stepNum: number): Promise<WorkflowSummary[]> {
  return request<WorkflowSummary[]>(`/workflows/by-step/${stepNum}`)
}

export async function createWorkflow(): Promise<WorkflowDetail> {
  return request<WorkflowDetail>('/workflows', {
    method: 'POST',
  })
}

export async function fetchWorkflow(id: string): Promise<WorkflowDetail> {
  return request<WorkflowDetail>(`/workflows/${id}`)
}

export async function updateStep(
  workflowId: string,
  stepNum: number,
  payload: { status?: string; data?: Record<string, any> }
): Promise<WorkflowDetail> {
  return request<WorkflowDetail>(`/workflows/${workflowId}/steps/${stepNum}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function cancelWorkflow(id: string): Promise<void> {
  await request<any>(`/workflows/${id}`, {
    method: 'DELETE',
  })
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
  const qs = new URLSearchParams()
  if (filters) {
    if (filters.category) qs.set('category', filters.category)
    if (filters.price_tier) qs.set('price_tier', filters.price_tier)
    if (filters.min_rating) qs.set('min_rating', String(filters.min_rating))
    if (filters.search) qs.set('search', filters.search)
    if (filters.page) qs.set('page', String(filters.page))
    if (filters.limit) qs.set('limit', String(filters.limit))
  }
  const query = qs.toString()
  return request<VendorListResponse>(`/vendors${query ? `?${query}` : ''}`)
}

// ─── Quote APIs ───

export async function submitQuote(workflowId: string, vendorId: string, quoteAmount: number): Promise<any> {
  return request<any>(`/workflows/${workflowId}/quotes`, {
    method: 'POST',
    body: JSON.stringify({ vendor_id: vendorId, quote_amount: quoteAmount }),
  })
}

export async function selectQuote(workflowId: string, quoteId: string): Promise<void> {
  await request<any>(`/workflows/${workflowId}/quotes/${quoteId}/select`, {
    method: 'PUT',
  })
}

export async function fetchQuotes(workflowId: string): Promise<QuoteDetail[]> {
  return request<QuoteDetail[]>(`/workflows/${workflowId}/quotes`)
}

// ─── Health check ───
export async function checkHealth(): Promise<{ status: string; db: string }> {
  return request<{ status: string; db: string }>('/health')
}
