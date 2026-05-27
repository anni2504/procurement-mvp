export interface Workflow {
  id: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  completed_at: string | null
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

export interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  category: string
  rating: number
  price_tier: 'budget' | 'mid-range' | 'premium'
  location: string
  is_active: boolean
  created_at: string
}

export interface VendorQuote {
  id: string
  workflow_id: string
  vendor_id: string
  quote_amount: number
  is_selected: boolean
  submitted_at: string
}

export const STEP_NAMES: Record<number, string> = {
  1: 'Procurement Request',
  2: 'Manager Approval',
  3: 'RFP & Vendor Selection',
  4: 'Purchase Order',
  5: 'Goods Receipt (GRN)',
  6: 'Invoice Submission',
  7: '3-Way Matching',
  8: 'Dispute Resolution',
  9: 'Finance Approval',
  10: 'Payment',
}

export const TOTAL_STEPS = 10
