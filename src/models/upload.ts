import IUploadDB from "@/interfaces/uploads/IUploadDB";
import { Model, Schema, model, models } from "mongoose";

type IUploadModelType = Model<IUploadDB>

const uploadSchema = new Schema<IUploadDB, IUploadModelType>(
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
    filename: {
      type: String,
      required: [true, "Filename is required"],
    },
    status: {
      type: String,
      enum: ["Processing", "Completed", "Failed"],
      default: "Processing",
    },
    elementCount: {
      type: Number,
      default: 0,
    },
    materialCount: {
      type: Number,
      default: 0,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: "uploads", // Explicitly set collection name
  }
);

// Add validation middleware
uploadSchema.pre("save", function (next) {
  if (!this.projectId || !this.userId) {
    next(new Error("ProjectId and UserId are required"));
    return;
  }
  next();
});

// Export as a named constant to ensure consistent usage
export const Upload: IUploadModelType = models.Upload || model("Upload", uploadSchema);
