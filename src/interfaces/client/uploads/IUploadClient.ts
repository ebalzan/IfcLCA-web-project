import IUploadDB from '@/interfaces/uploads/IUploadDB'

export interface IUploadClient extends Omit<IUploadDB, '_id'> {
  _id: string
}
