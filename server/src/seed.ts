import mongoose from 'mongoose'
import Workflow from './models/Workflow.js'
import Vendor from './models/Vendor.js'
import VendorQuote from './models/VendorQuote.js'
import { STEP_NAMES, TOTAL_STEPS } from './types.js'

const sampleVendors = [
  { name: 'TechHub Solutions', email: 'sales@techhub.com', phone: '123-456-7890', category: 'IT Equipment', rating: 4.8, priceTier: 'premium', location: 'New York, NY', isActive: true },
  { name: 'Global Office Supplies', email: 'orders@globaloffice.com', phone: '234-567-8901', category: 'Office Supplies', rating: 4.5, priceTier: 'mid-range', location: 'Chicago, IL', isActive: true },
  { name: 'ErgoFurniture Co', email: 'b2b@ergofurniture.com', phone: '345-678-9012', category: 'Furniture', rating: 4.2, priceTier: 'mid-range', location: 'Austin, TX', isActive: true },
  { name: 'CloudNet Services', email: 'contact@cloudnet.io', phone: '456-789-0123', category: 'Software', rating: 4.9, priceTier: 'premium', location: 'San Francisco, CA', isActive: true },
  { name: 'BudgetTech', email: 'sales@budgettech.com', phone: '567-890-1234', category: 'IT Equipment', rating: 3.8, priceTier: 'budget', location: 'Miami, FL', isActive: true },
  { name: 'Elite Design Studio', email: 'hello@elitedesign.com', phone: '678-901-2345', category: 'Services', rating: 4.7, priceTier: 'premium', location: 'London, UK', isActive: true },
  { name: 'Paper & Pens Direct', email: 'sales@paperpens.com', phone: '789-012-3456', category: 'Office Supplies', rating: 4.1, priceTier: 'budget', location: 'Dallas, TX', isActive: true },
  { name: 'SecureSoft Systems', email: 'info@securesoft.com', phone: '890-123-4567', category: 'Software', rating: 4.6, priceTier: 'mid-range', location: 'Seattle, WA', isActive: true },
  { name: 'ModernWorkspace', email: 'quotes@modernworkspace.com', phone: '901-234-5678', category: 'Furniture', rating: 4.4, priceTier: 'premium', location: 'Los Angeles, CA', isActive: true },
  { name: 'QuickFix IT', email: 'support@quickfixit.com', phone: '012-345-6789', category: 'Services', rating: 4.0, priceTier: 'budget', location: 'Denver, CO', isActive: true },
]

// Generate 50 additional vendors
const categories = ['IT Equipment', 'Office Supplies', 'Furniture', 'Software', 'Services']
const tiers = ['budget', 'mid-range', 'premium']
const cities = ['Atlanta, GA', 'Boston, MA', 'Seattle, WA', 'Denver, CO', 'Phoenix, AZ', 'Houston, TX', 'Miami, FL', 'Portland, OR']
const adjectives = ['Alpha', 'Beta', 'Prime', 'Apex', 'Global', 'National', 'Summit', 'Pinnacle', 'NextGen', 'Quantum']
const nouns = ['Systems', 'Solutions', 'Corp', 'Inc', 'LLC', 'Group', 'Enterprises', 'Partners', 'Networks', 'Dynamics']

for (let i = 1; i <= 50; i++) {
  const cat = categories[i % categories.length]
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  sampleVendors.push({
    name: `${adj} ${cat.split(' ')[0]} ${noun} ${i}`,
    email: `contact${i}@${adj.toLowerCase()}${noun.toLowerCase()}.com`,
    phone: `800-555-${String(i).padStart(4, '0')}`,
    category: cat,
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    priceTier: tiers[i % tiers.length],
    location: cities[i % cities.length],
    isActive: true
  })
}

const sampleItems = [
  { name: 'MacBook Pro M3', cat: 'IT Equipment', price: 150000 },
  { name: 'Ergonomic Chair', cat: 'Furniture', price: 8000 },
  { name: 'Office Desk', cat: 'Furniture', price: 12000 },
  { name: 'Printer Paper (A4)', cat: 'Office Supplies', price: 300 },
  { name: 'Adobe CC License', cat: 'Software', price: 65000 },
  { name: 'AWS Cloud Hosting', cat: 'Services', price: 50000 },
  { name: 'Dell UltraSharp Monitor', cat: 'IT Equipment', price: 35000 },
  { name: 'Meeting Room Table', cat: 'Furniture', price: 45000 },
  { name: 'Whiteboard markers', cat: 'Office Supplies', price: 50 },
  { name: 'Security Audit', cat: 'Services', price: 120000 },
]

function generateStepsData(targetStep: number, itemIndex: number, requestNum: number) {
  const item = sampleItems[itemIndex % sampleItems.length]
  const qty = (requestNum * 2) + 1
  const vendor = sampleVendors[itemIndex % sampleVendors.length]
  const vendor2 = sampleVendors[(itemIndex + 1) % sampleVendors.length]
  const vendor3 = sampleVendors[(itemIndex + 2) % sampleVendors.length]

  const poNumber = `PO-SEED-${targetStep}-${requestNum}`
  const invNumber = `INV-SEED-${targetStep}-${requestNum}`
  const grnNumber = `GRN-SEED-${targetStep}-${requestNum}`

  const steps = []

  for (let i = 1; i <= TOTAL_STEPS; i++) {
    let status = 'pending'
    let data = {}

    if (i < targetStep || (targetStep === TOTAL_STEPS && i === TOTAL_STEPS)) {
      status = 'completed'
    } else if (i === targetStep && targetStep !== TOTAL_STEPS) {
      status = 'in_progress'
    }

    // Step 1: Procurement Request
    if (i >= 1 && status !== 'pending') {
      data = {
        itemName: item.name,
        quantity: qty,
        unitPrice: item.price,
        category: item.cat,
        justification: `Needed for department expansion - request ${requestNum}`
      }
    }
    
    // Step 2: Manager Approval
    if (i >= 2 && status !== 'pending') {
      data = { ...data, approved: true, approvedAt: new Date().toISOString() }
    }

    // Step 3: RFP & Vendor Selection
    if (i >= 3 && status !== 'pending') {
      const v = [
        { name: vendor.name, email: vendor.email, quote: item.price - 100 },
        { name: vendor2.name, email: vendor2.email, quote: item.price + 200 },
        { name: vendor3.name, email: vendor3.email, quote: item.price - 50 }
      ]
      data = { ...data, vendors: v, quotesFinalized: true }
      if (i > 3 || (i === 3 && status === 'completed')) {
        data = { ...data, selectedVendor: v[0], vendorSelected: true }
      }
    }

    // Step 4: Purchase Order
    if (i >= 4 && status !== 'pending') {
      data = { ...data, 
        poNumber,
        totalAmount: qty * (item.price - 100),
        vendorName: vendor.name,
        vendorEmail: vendor.email,
        issuedAt: new Date().toISOString()
      }
    }

    // Step 5: Goods Receipt (GRN)
    if (i >= 5 && status !== 'pending') {
      // If we are targeting Step 8 (Dispute), simulate partial delivery
      const rcvQty = targetStep === 8 ? qty - 1 : qty
      data = { 
        ...data, 
        receivedQuantity: rcvQty, 
        condition: 'good', 
        notes: 'Received in good condition',
        grnNumber, 
        inspectedBy: 'Seed Warehouse Mgr', 
        generatedAt: new Date().toISOString() 
      }
    }

    // Step 6: Invoice Submission
    if (i >= 6 && status !== 'pending') {
      data = { ...data, invoiceNumber: invNumber, billedQuantity: qty, billedAmount: qty * (item.price - 100) }
    }

    // Step 7: 3-Way Matching
    if (i >= 7 && status !== 'pending') {
      const matchStatus = targetStep === 8 ? 'mismatched' : 'matched'
      data = { ...data, matchStatus }
    }

    // Step 8: Dispute Resolution
    if (i >= 8 && status !== 'pending') {
      if (targetStep > 8) {
        data = { ...data, skipped: true, disputeResolved: true }
      } else if (targetStep === 8) {
        data = { ...data, responsibleParty: 'vendor' } // active dispute
      }
    }

    // Step 9: Finance Approval
    if (i >= 9 && status !== 'pending') {
      data = { ...data, financeApproved: true, approvedAt: new Date().toISOString() }
    }

    // Step 10: Payment
    if (i === 10 && status === 'completed') {
      data = { ...data, paymentApproved: true, completedAt: new Date().toISOString() }
    }

    steps.push({
      stepNumber: i,
      stepName: STEP_NAMES[i],
      status,
      data,
      startedAt: status !== 'pending' ? new Date() : null,
      completedAt: status === 'completed' ? new Date() : null,
    })
  }

  return steps
}

export async function seedDatabase() {
  try {
    const vendorCount = await Vendor.countDocuments()
    if (vendorCount === 0) {
      console.log('🌱 Seeding Vendors...')
      await Vendor.insertMany(sampleVendors)
    }

    const workflowCount = await Workflow.countDocuments()
    if (workflowCount === 0) {
      console.log('🌱 Seeding Workflows (5 per step, 1-12)...')
      
      const workflowsToInsert = []
      
      for (let step = 1; step <= TOTAL_STEPS; step++) {
        for (let r = 1; r <= 5; r++) {
          workflowsToInsert.push({
            status: step === TOTAL_STEPS ? 'completed' : 'active',
            steps: generateStepsData(step, step + r, r),
            createdAt: new Date(Date.now() - Math.random() * 10000000000) // random past date
          })
        }
      }
      
      await Workflow.insertMany(workflowsToInsert)
      console.log(`✅ Seeded ${workflowsToInsert.length} workflows successfully!`)
    }
  } catch (err) {
    console.error('❌ Seeding failed:', err)
  }
}

