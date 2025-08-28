import { Model, Schema, model, models } from 'mongoose'
import { IElementDeletion } from '@/interfaces/elements/IElementDeletion'

type IElementDeletionModelType = Model<IElementDeletion>

const elementDeletionSchema = new Schema<IElementDeletion, IElementDeletionModelType>(
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
    elementName: {
      type: String,
      required: [true, 'Element name is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'element_deletions',
  }
)

// Add validation middleware
elementDeletionSchema.pre('save', function (next) {
  if (!this.projectId || !this.userId) {
    next(new Error('ProjectId and UserId are required'))
    return
  }
  next()
})

export const ElementDeletion: IElementDeletionModelType =
  models.ElementDeletion || model('ElementDeletion', elementDeletionSchema)
