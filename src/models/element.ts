import { Model, Schema, model, models } from 'mongoose'
import mongooseLeanGetters from 'mongoose-lean-getters'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import { IElementDB, IElementVirtuals } from '@/interfaces/elements/IElementDB'
import { IMaterialLayer } from '@/interfaces/elements/IMaterialLayer'
import { calculateElementIndicators } from '@/utils/calculateElementIndicators'

type IElementModelType = Model<IElementDB, {}, {}, IElementVirtuals>

const materialLayerSchema = new Schema<IMaterialLayer>({
  materialId: {
    type: Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  },
  materialName: {
    type: String,
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
    default: null,
    nullable: true,
  },
  thickness: {
    type: Number,
    required: true,
    min: 0,
    default: null,
    nullable: true,
  },
})

const elementSchema = new Schema<IElementDB, IElementModelType, {}, IElementVirtuals>(
  {
    uploadId: {
      type: Schema.Types.ObjectId,
      ref: 'Upload',
      required: true,
    },
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
    materialLayers: [materialLayerSchema],
  },
  {
    timestamps: true,
  }
)

// Indexes
elementSchema.index({ projectId: 1, guid: 1 }, { unique: true })
elementSchema.index({ 'materialLayers.materialId': 1 })

// Plugins
elementSchema.plugin(mongooseLeanVirtuals)
elementSchema.plugin(mongooseLeanGetters)

// Virtuals
elementSchema.virtual('totalVolume').get(function () {
  return this.materialLayers.reduce((sum, materialLayer) => sum + (materialLayer.volume || 0), 0)
})

// Virtual for emissions
elementSchema.virtual('indicators').get(async function () {
  return await calculateElementIndicators({ data: { elementId: this._id } })
})

// Middleware to validate material fractions sum to 1
elementSchema.pre('save', function (next) {
  const totalFraction = this.materialLayers.reduce(
    (sum, materialLayer) => sum + (materialLayer?.fraction || 0),
    0
  )
  if (Math.abs(totalFraction - 1) > 0.0001) {
    next(new Error('Material fractions must sum to 1'))
  }
  next()
})

export const Element: IElementModelType = models.Element || model('Element', elementSchema)
