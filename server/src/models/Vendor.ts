import mongoose, { Schema, Document } from 'mongoose'

export interface IVendor extends Document {
  name: string
  email: string
  phone: string
  category: string
  rating: number
  priceTier: 'budget' | 'mid-range' | 'premium'
  location: string
  isActive: boolean
  createdAt: Date
}

const VendorSchema = new Schema<IVendor>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  category: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  priceTier: { type: String, enum: ['budget', 'mid-range', 'premium'], default: 'mid-range' },
  location: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// Index for filtering
VendorSchema.index({ category: 1, rating: -1 })
VendorSchema.index({ name: 'text', email: 'text' })

export default mongoose.model<IVendor>('Vendor', VendorSchema)
