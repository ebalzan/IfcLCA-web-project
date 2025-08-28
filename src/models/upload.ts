import { Model, Schema, model, models } from 'mongoose'
import IUploadDB from '@/interfaces/uploads/IUploadDB'

type IUploadModelType = Model<IUploadDB>

const uploadSchema = new Schema<IUploadDB, IUploadModelType>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    filename: {
      type: String,
      required: [true, 'Filename is required'],
    },
    status: {
      type: String,
      enum: ['Processing', 'Completed', 'Failed'],
      default: 'Processing',
    },
    _count: {
      elements: {
        type: Number,
        default: 0,
      },
      materials: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'uploads', // Explicitly set collection name
  }
)

// Add validation middleware
uploadSchema.pre('save', function (next) {
  if (!this.projectId || !this.userId) {
    next(new Error('ProjectId and UserId are required'))
    return
  }
  next()
})

// Export as a named constant to ensure consistent usage
export const Upload: IUploadModelType = models.Upload || model('Upload', uploadSchema)
