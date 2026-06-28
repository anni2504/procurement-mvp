import mongoose, { Schema, Document } from 'mongoose'

export interface IVendorQuote {
  workflowId: mongoose.Types.ObjectId
  vendorId: mongoose.Types.ObjectId
  quoteAmount: number
  isSelected: boolean
  submittedAt: Date
}

const VendorQuoteSchema = new Schema<IVendorQuote>({
  workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  quoteAmount: { type: Number, required: true },
  isSelected: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
})

VendorQuoteSchema.index({ workflowId: 1 })

export default mongoose.model<IVendorQuote>('VendorQuote', VendorQuoteSchema)
