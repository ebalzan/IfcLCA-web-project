import IKBOBMaterial from "@/interfaces/materials/IKBOBMaterial";
import { Model, Schema, models, model } from "mongoose";

interface IKBOBMaterialModel extends Model<IKBOBMaterial> {
  findValidMaterials(): Promise<IKBOBMaterial[]>;
}

const kbobSchema = new Schema<IKBOBMaterial, IKBOBMaterialModel>(
  {
    name: { type: String, required: true, index: true },
    category: { type: String },
    gwp: { type: Number, required: true },
    ubp: { type: Number, required: true },
    penre: { type: Number, required: true },
    "kg/unit": Schema.Types.Mixed,
    "min density": Number,
    "max density": Number,
  },
  {
    collection: "indicatorsKBOB",
    strict: false,
  }
);

// Add indexes for better query performance
kbobSchema.index({ name: 1 });
kbobSchema.index({ category: 1 });

// Add a static method to find valid materials
kbobSchema.static("findValidMaterials", function (this: IKBOBMaterialModel) {
  return this.find({
    $and: [
      // Must have all required indicators
      { gwp: { $exists: true, $ne: null } },
      { ubp: { $exists: true, $ne: null } },
      { penre: { $exists: true, $ne: null } },
      // Must have either valid kg/unit or both min/max density
      {
        $or: [
          {
            "kg/unit": {
              $exists: true,
              $ne: null,
              // $ne: "-",
              $type: "number",
              $nin: [0, -1],
            },
          },
          {
            $and: [
              { "min density": { $exists: true, $ne: null, $type: "number" } },
              { "max density": { $exists: true, $ne: null, $type: "number" } },
            ],
          },
        ],
      },
    ],
  }).sort({ name: 1 });
});

// Create or update the model
export const KBOBMaterial: IKBOBMaterialModel =
  models.KBOBMaterial ||
  model("KBOBMaterial", kbobSchema, "indicatorsKBOB")
