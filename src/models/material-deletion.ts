import IMaterialDeletion from "@/interfaces/materials/IMaterialDeletion";
import { Model, Schema, model, models } from "mongoose";

type IMaterialDeletionModelType = Model<IMaterialDeletion>

const materialDeletionSchema = new Schema<IMaterialDeletion, IMaterialDeletionModelType>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    materialName: {
      type: String,
      required: [true, "Material name is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: "material_deletions",
  }
);

// Add validation middleware
materialDeletionSchema.pre("save", function (next) {
  if (!this.projectId || !this.userId) {
    next(new Error("ProjectId and UserId are required"));
    return;
  }
  next();
});

export const MaterialDeletion: IMaterialDeletionModelType =
  models.MaterialDeletion ||
  model("MaterialDeletion", materialDeletionSchema);
