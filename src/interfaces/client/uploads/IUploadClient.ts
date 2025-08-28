import IUploadDB from '@/interfaces/uploads/IUploadDB'

export interface IUploadClient extends Omit<IUploadDB, '_id' | 'projectId'> {
  _id: string
  projectId: string
}
