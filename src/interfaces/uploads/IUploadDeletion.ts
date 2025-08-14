import { Types } from 'mongoose'

export interface IUploadDeletion {
  _id: Types.ObjectId
  projectId: Types.ObjectId
  userId: string
  filename: string
  reason: string
  deletedAt: Date
}
