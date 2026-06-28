import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: 'admin' | 'requester' | 'manager' | 'procurement' | 'warehouse' | 'vendor' | 'finance'
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'requester', 'manager', 'procurement', 'warehouse', 'vendor', 'finance'],
  },
}, { timestamps: true })

export default mongoose.model<IUser>('User', UserSchema)
