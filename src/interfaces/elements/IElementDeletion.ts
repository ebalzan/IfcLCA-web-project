import { Types } from 'mongoose'

export interface IElementDeletion {
  _id: Types.ObjectId
  projectId: Types.ObjectId
  userId: string
  elementName: string
  reason: string
  createdAt: Date
  updatedAt: Date
}
