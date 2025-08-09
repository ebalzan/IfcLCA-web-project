import { Model, Schema, model, models } from 'mongoose'
import mongooseLeanGetters from 'mongoose-lean-getters'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import IElementDB, { IElementVirtuals } from '@/interfaces/elements/IElementDB'
import IMaterialLayer from '@/interfaces/elements/IMaterialLayer'

type IElementModelType = Model<IElementDB, {}, {}, IElementVirtuals>

const materialLayerSchema = new Schema<IMaterialLayer>({
  material: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  volume: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: 'Volume must be a finite number',
    },
  },
  fraction: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  thickness: {
    type: Number,
    min: 0,
  },
})

const elementSchema = new Schema<IElementDB, IElementModelType, {}, IElementVirtuals>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    guid: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    loadBearing: {
      type: Boolean,
      default: false,
    },
    isExternal: {
      type: Boolean,
      default: false,
    },
    materials: [materialLayerSchema],
  },
  {
    timestamps: true,
  }
)

// Indexes
elementSchema.index({ projectId: 1, guid: 1 }, { unique: true })
elementSchema.index({ 'materials.material': 1 })

// Virtuals
elementSchema.plugin(mongooseLeanVirtuals)
elementSchema.plugin(mongooseLeanGetters)

// Virtual for total volume
elementSchema.virtual('totalVolume').get(function () {
  return this.materials.reduce((sum, materialLayer) => sum + (materialLayer.volume || 0), 0)
})

// Virtual for emissions (calculated on-the-fly)
elementSchema.virtual('emissions').get(function () {
  return this.materials.reduce(
    (acc, materialLayer) => {
      const material = materialLayer.material as any // Will be populated
      if (!material?.ec3MatchId) return acc

      const volume = materialLayer.volume || 0
      const density = material.density || 0
      const mass = volume * density

      return {
        gwp: acc.gwp + mass * (material.ec3MatchId?.gwp || 0),
        ubp: acc.ubp + mass * (material.ec3MatchId.ubp || 0),
        penre: acc.penre + mass * (material.ec3MatchId.penre || 0),
      }
    },
    { gwp: 0, ubp: 0, penre: 0 }
  )
})

// Middleware to validate material fractions sum to 1
elementSchema.pre('save', function (next) {
  const totalFraction = this.materials.reduce(
    (sum, materialLayer) => sum + (materialLayer?.fraction || 0),
    0
  )
  if (Math.abs(totalFraction - 1) > 0.0001) {
    next(new Error('Material fractions must sum to 1'))
  }
  next()
})

export const Element: IElementModelType = models.Element || model('Element', elementSchema)
