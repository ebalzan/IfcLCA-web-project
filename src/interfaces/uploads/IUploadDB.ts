import { Types } from 'mongoose'

interface IUploadDB {
  _id: Types.ObjectId
  projectId: Types.ObjectId
  userId: string
  filename: string
  status: 'Processing' | 'Completed' | 'Failed'
  _count: {
    elements: number
    materials: number
  }
  createdAt: Date
  updatedAt: Date
}

export default IUploadDB
