  interface IUploadClient {
  _id: string
  projectId: string
  userId: string
  filename: string
  status: "Processing" | "Completed" | "Failed"
  elementCount: number
  materialCount: number
  deleted: boolean
  createdAt: Date
  updatedAt: Date
}
export default IUploadClient