import { Schema, model, models, Model } from 'mongoose'
import IMaterialUsageDB from '@/interfaces/materials/IMaterialUsageDB'

type IMaterialUsageModelType = Model<IMaterialUsageDB>

const materialUsageSchema = new Schema<IMaterialUsageDB, IMaterialUsageModelType>(
  {
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    volume: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
)

materialUsageSchema.index({ materialId: 1, projectId: 1 }, { unique: true })

export const MaterialUsage: IMaterialUsageModelType =
  models.MaterialUsage || model('MaterialUsage', materialUsageSchema)
