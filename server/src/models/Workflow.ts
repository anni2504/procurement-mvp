import mongoose, { Schema, Document } from 'mongoose'

export interface IWorkflowStep {
  stepNumber: number
  stepName: string
  status: 'pending' | 'in_progress' | 'completed'
  data: Record<string, any>
  startedAt: Date | null
  completedAt: Date | null
}

export interface IWorkflow extends Document {
  status: 'active' | 'completed' | 'cancelled'
  steps: IWorkflowStep[]
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

const WorkflowStepSchema = new Schema<IWorkflowStep>({
  stepNumber: { type: Number, required: true },
  stepName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  data: { type: Schema.Types.Mixed, default: {} },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
})

const WorkflowSchema = new Schema<IWorkflow>({
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  steps: [WorkflowStepSchema],
  completedAt: { type: Date, default: null },
}, { timestamps: true })

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema)
