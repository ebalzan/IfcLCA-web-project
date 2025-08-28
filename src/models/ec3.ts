import { Model, Schema, models, model } from 'mongoose'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'

type IEC3MatchModel = Model<IEC3Match>

const ec3Schema = new Schema<IEC3Match, IEC3MatchModel>(
  {
    ec3MatchId: { type: String, required: true },
    materialId: { type: Schema.Types.ObjectId, required: true },
    autoMatched: { type: Boolean, required: true, default: false },
    score: { type: Number, required: false },
  },
  {
    collection: 'ec3_matches',
    strict: false,
  }
)

// Add indexes for better query performance
ec3Schema.index({ ec3MatchId: 1, materialId: 1 })

// Create or update the model
export const EC3Match: IEC3MatchModel = (models.EC3Match ||
  model('EC3Match', ec3Schema, 'ec3_matches')) as IEC3MatchModel
