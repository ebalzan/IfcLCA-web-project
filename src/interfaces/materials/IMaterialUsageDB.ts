import { Types } from "mongoose"

interface IMaterialUsageDB {
  _id: Types.ObjectId
  materialId: Types.ObjectId
  projectId: Types.ObjectId
  volume?: number
  createdAt: Date
  updatedAt: Date
}

export default IMaterialUsageDB