import { Schema, model, models, Model } from "mongoose"
import IMaterialDB, { IMaterialVirtuals } from "@/interfaces/materials/IMaterialDB"
import mongooseLeanVirtuals from "mongoose-lean-virtuals"
import mongooseLeanGetters from "mongoose-lean-getters"

type IMaterialModelType = Model<IMaterialDB, {}, {}, IMaterialVirtuals>

const materialSchema = new Schema<IMaterialDB, IMaterialModelType, {}, IMaterialVirtuals>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    density: {
      type: Number,
      min: 0,
      validate: {
        validator: (v: number) => v === 0 || Number.isFinite(v),
        message: "Density must be 0 or a finite number",
      },
    },
    kbobMatchId: {
      type: Schema.Types.ObjectId,
      ref: "KBOBMaterial",
    },
    lastCalculated: {
      type: Date,
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
materialSchema.index({ kbobMatchId: 1 })

// Virtual for elements using this material
materialSchema.virtual("elements", {
  ref: "Element",
  localField: "_id",
  foreignField: "materials.material",
})

// Virtual for total volume across all elements
materialSchema.virtual("totalVolume").get(async function () {
  const result = await model("Element").aggregate<Pick<IMaterialVirtuals, "totalVolume">>([
    { $match: { "materials.material": this._id } },
    { $unwind: "$materials" },
    { $match: { "materials.material": this._id } },
    { $group: { _id: null, totalVolume: { $sum: "$materials.volume" } } },
  ])
  
  return result[0]?.totalVolume || 0
})

// Plugins
materialSchema.plugin(mongooseLeanVirtuals)
materialSchema.plugin(mongooseLeanGetters)

// Check if model already exists before creating
export const Material: IMaterialModelType = models.Material || model("Material", materialSchema)
