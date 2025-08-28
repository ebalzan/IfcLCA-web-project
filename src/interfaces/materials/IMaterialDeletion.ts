import { Types } from 'mongoose'

interface IMaterialDeletion {
  _id: Types.ObjectId
  projectId: Types.ObjectId
  userId: string
  materialName: string
  reason: string
  createdAt: Date
  updatedAt: Date
}

export default IMaterialDeletion
