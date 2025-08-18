import { Schema, model, models, Model } from 'mongoose'
import mongooseLeanGetters from 'mongoose-lean-getters'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import IMaterialDB, { IMaterialVirtuals } from '@/interfaces/materials/IMaterialDB'

type IMaterialModelType = Model<IMaterialDB, {}, {}, IMaterialVirtuals>

const materialSchema = new Schema<IMaterialDB, IMaterialModelType, {}, IMaterialVirtuals>(
  {
    uploadId: {
      type: Schema.Types.ObjectId,
      ref: 'Upload',
      required: true,
      default: null,
      nullable: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    ec3MatchId: {
      type: String,
      required: true,
      default: null,
      nullable: true,
    },
    name: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
    },
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    gwp: {
      type: Number,
    },
    ubp: {
      type: Number,
    },
    penre: {
      type: Number,
    },
    unit: {
      type: String,
    },
    density: {
      type: Number,
    },
    declaredUnit: {
      type: String,
    },
    validFrom: {
      type: String,
    },
    validTo: {
      type: String,
    },
    'kg/unit': {
      type: Number,
    },
    'min density': {
      type: Number,
    },
    'max density': {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
materialSchema.index({ projectId: 1, name: 1 }, { unique: true })
materialSchema.index({ ec3MatchId: 1 })

// Plugins
materialSchema.plugin(mongooseLeanVirtuals)
materialSchema.plugin(mongooseLeanGetters)

// Virtual for elements using this material
materialSchema.virtual('elements', {
  ref: 'Element',
  localField: '_id',
  foreignField: 'materialLayers.materialId',
})

// Virtual for total volume
materialSchema.virtual('totalVolume').get(async function () {
  const result = await model('Element').aggregate<Pick<IMaterialVirtuals, 'totalVolume'>>([
    { $match: { 'materialLayers.materialId': this._id } },
    { $unwind: '$materialLayers' },
    { $match: { 'materialLayers.materialId': this._id } },
    { $group: { _id: null, totalVolume: { $sum: '$materialLayers.volume' } } },
  ])

  return result[0]?.totalVolume || 0
})

export const Material: IMaterialModelType = models.Material || model('Material', materialSchema)
