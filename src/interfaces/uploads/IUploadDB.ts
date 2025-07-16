import { Types } from 'mongoose'

interface IUploadDB {
  _id: Types.ObjectId
  projectId: Types.ObjectId
  userId: string
  filename: string
  status: 'Processing' | 'Completed' | 'Failed'
  elementCount: number
  materialCount: number
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}

export default IUploadDB
