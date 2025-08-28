import { Schema, model, models, Model } from 'mongoose'
import IProjectDB from '@/interfaces/projects/IProjectDB'

type IProjectModelType = Model<IProjectDB>

const projectSchema = new Schema<IProjectDB, IProjectModelType>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    indicators: {
      gwp: { type: Number, default: 0 },
      ubp: { type: Number, default: 0 },
      penre: { type: Number, default: 0 },
      lastCalculated: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
)

// Add index for better query performance
projectSchema.index({ 'indicators.lastCalculated': -1 })

export const Project: IProjectModelType = models.Project || model('Project', projectSchema)
