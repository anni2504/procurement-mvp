import { Router } from 'express'
import Workflow from '../models/Workflow.js'
import VendorQuote from '../models/VendorQuote.js'
import { STEP_NAMES, TOTAL_STEPS } from '../types.js'
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js'

const router = Router()

// List all workflows (with optional status filter)
router.get('/', authenticate as any, async (req, res) => {
  try {
    const { status } = req.query
    const filter: Record<string, any> = {}
    if (status) filter.status = status

    const workflows = await Workflow.find(filter).sort({ createdAt: -1 }).lean()
    const result = workflows.map(w => {
      const completedSteps = w.steps.filter(s => s.status === 'completed').length
      // Find the current active step (first non-completed step)
      const currentStep = w.steps.find(s => s.status !== 'completed')?.stepNumber || TOTAL_STEPS
      // Get step 1 data for display (request info)
      const requestData = w.steps.find(s => s.stepNumber === 1)?.data || {}
      return {
        ...w,
        completedSteps,
        currentStep,
        requestData,
      }
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workflows' })
  }
})

// Get workflows by current step number (key endpoint for multi-request view)
router.get('/by-step/:stepNum', authenticate as any, async (req, res) => {
  const stepNumber = parseInt(req.params.stepNum)
  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > TOTAL_STEPS) {
    return res.status(400).json({ error: 'Invalid step number' })
  }

  try {
    const workflows = await Workflow.find({ status: 'active' }).sort({ createdAt: -1 }).lean()

    // Filter to workflows whose current active step matches the requested step
    const atStep = workflows.filter(w => {
      // For completed workflows, skip
      if (w.status === 'completed') return false

      // Find the current step: first step that is 'in_progress', or if none,
      // check if the requested step is specifically in_progress or pending with previous completed
      const step = w.steps.find(s => s.stepNumber === stepNumber)
      if (!step) return false

      if (step.status === 'in_progress') return true

      // Also include if this step is pending but the previous step is completed
      // (meaning this is the next step to work on)
      if (step.status === 'pending' && stepNumber === 1) return true
      if (step.status === 'pending' && stepNumber > 1) {
        const prevStep = w.steps.find(s => s.stepNumber === stepNumber - 1)
        return prevStep?.status === 'completed'
      }

      // Also show completed steps if the workflow is still at a later step
      // (so users can review past work)
      if (step.status === 'completed') return true

      return false
    })

    const result = atStep.map(w => {
      const requestData = w.steps.find(s => s.stepNumber === 1)?.data || {}
      const completedSteps = w.steps.filter(s => s.status === 'completed').length
      const currentStep = w.steps.find(s => s.status === 'in_progress')?.stepNumber
        || (w.steps.find(s => s.status === 'pending')?.stepNumber || TOTAL_STEPS)
      return {
        ...w,
        completedSteps,
        currentStep,
        requestData,
      }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workflows by step' })
  }
})

// Create new workflow
router.post('/', authenticate as any, requireRole(['requester', 'procurement']) as any, async (_req, res) => {
  try {
    const steps = []
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      steps.push({
        stepNumber: i,
        stepName: STEP_NAMES[i],
        status: i === 1 ? 'in_progress' : 'pending',
        data: {},
        startedAt: i === 1 ? new Date() : null,
      })
    }
    const workflow = await Workflow.create({ status: 'active', steps })
    res.json(workflow)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workflow' })
  }
})

// Get single workflow with all steps and quotes
router.get('/:id', authenticate as any, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id).lean()
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })

    const quotes = await VendorQuote.find({ workflowId: req.params.id })
      .populate('vendorId', 'name email category rating priceTier')
      .sort({ submittedAt: 1 })
      .lean()

    res.json({ ...workflow, quotes })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workflow' })
  }
})

// Update step data & status
router.put('/:id/steps/:stepNum', authenticate as any, async (req: AuthRequest, res) => {
  const { id, stepNum } = req.params
  const { status, data } = req.body
  const stepNumber = parseInt(stepNum)

  // Role check based on step number
  const userRole = req.user?.role
  if (userRole !== 'admin') {
    if (stepNumber === 1 && userRole !== 'requester') {
      return res.status(403).json({ error: 'Forbidden: Only a Requester can create or edit step 1 requests' })
    }
    if (stepNumber === 2 && userRole !== 'manager') {
      return res.status(403).json({ error: 'Forbidden: Only a Manager can approve step 2 requests' })
    }
    if ((stepNumber === 3 || stepNumber === 4) && userRole !== 'procurement') {
      return res.status(403).json({ error: 'Forbidden: Only a Procurement user can manage quotes and issue POs' })
    }
    if (stepNumber === 5 && userRole !== 'warehouse') {
      return res.status(403).json({ error: 'Forbidden: Only a Warehouse user can issue Goods Receipts' })
    }
    if (stepNumber === 6 && userRole !== 'vendor') {
      return res.status(403).json({ error: 'Forbidden: Only a Vendor can submit invoices' })
    }
    if (stepNumber === 7 && userRole !== 'procurement' && userRole !== 'finance') {
      return res.status(403).json({ error: 'Forbidden: Only Procurement or Finance can trigger 3-Way Matching' })
    }
    if (stepNumber === 8) {
      const correctiveAction = data?.correctiveAction
      if (correctiveAction === 'po_amendment' && userRole !== 'procurement') {
        return res.status(403).json({ error: 'Forbidden: Only Procurement can raise PO amendments' })
      }
      if (correctiveAction === 'grn_correction' && userRole !== 'warehouse') {
        return res.status(403).json({ error: 'Forbidden: Only Warehouse can correct GRNs' })
      }
      if (correctiveAction === 'invoice_correction' && userRole !== 'vendor') {
        return res.status(403).json({ error: 'Forbidden: Only the Vendor can correct invoices' })
      }
    }
    if ((stepNumber === 9 || stepNumber === 10) && userRole !== 'finance') {
      return res.status(403).json({ error: 'Forbidden: Only Finance can approve or process payments' })
    }
  }

  try {
    const workflow = await Workflow.findById(id)
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })

    const step = workflow.steps.find(s => s.stepNumber === stepNumber)
    if (!step) return res.status(404).json({ error: 'Step not found' })

    // Business rule: Purchase Requisition (step 1) cannot be reverted once completed
    if (stepNumber === 1 && step.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ error: 'Purchase Requisition cannot be reverted once submitted' })
    }

    // Business rule: Purchase Order (step 5) cannot be modified once completed
    if (stepNumber === 5 && step.status === 'completed') {
      return res.status(400).json({ error: 'Purchase Order cannot be modified once approved' })
    }

    if (status) {
      step.status = status
      if (status === 'in_progress' && !step.startedAt) step.startedAt = new Date()
      if (status === 'completed') step.completedAt = new Date()
    }
    if (data !== undefined) {
      // Merge data instead of replacing, to preserve existing fields
      step.data = { ...step.data, ...data }
    }

    // If completing a step, auto-advance the next step to 'in_progress'
    if (status === 'completed' && stepNumber < TOTAL_STEPS) {
      const nextStep = workflow.steps.find(s => s.stepNumber === stepNumber + 1)
      if (nextStep && nextStep.status === 'pending') {
        nextStep.status = 'in_progress'
        nextStep.startedAt = new Date()
      }
    }

    // If last step completed, mark workflow as completed
    if (stepNumber === TOTAL_STEPS && status === 'completed') {
      workflow.status = 'completed'
      workflow.completedAt = new Date()
    }

    await workflow.save()

    // Return the full updated workflow
    const updated = await Workflow.findById(id).lean()
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update step' })
  }
})

// Cancel a workflow
router.delete('/:id', authenticate as any, requireRole(['admin']) as any, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' })
    workflow.status = 'cancelled'
    await workflow.save()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel workflow' })
  }
})

// Submit vendor quote for workflow
router.post('/:id/quotes', authenticate as any, requireRole(['vendor']) as any, async (req, res) => {
  const { vendor_id, quote_amount } = req.body
  try {
    const quote = await VendorQuote.create({
      workflowId: req.params.id,
      vendorId: vendor_id,
      quoteAmount: quote_amount,
    })
    res.json(quote)
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit quote' })
  }
})

// Get quotes for workflow
router.get('/:id/quotes', authenticate as any, async (req, res) => {
  try {
    const quotes = await VendorQuote.find({ workflowId: req.params.id })
      .populate('vendorId', 'name email')
      .sort({ submittedAt: 1 })
      .lean()
    res.json(quotes)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes' })
  }
})

// Select vendor quote
router.put('/:id/quotes/:quoteId/select', authenticate as any, requireRole(['procurement']) as any, async (req, res) => {
  const { id, quoteId } = req.params
  try {
    await VendorQuote.updateMany({ workflowId: id }, { isSelected: false })
    await VendorQuote.findByIdAndUpdate(quoteId, { isSelected: true })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to select quote' })
  }
})

export default router
