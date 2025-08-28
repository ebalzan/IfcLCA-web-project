import IMaterialDB, { IMaterialVirtuals } from '@/interfaces/materials/IMaterialDB'

export interface IMaterialClient
  extends Omit<IMaterialDB, '_id' | 'projectId' | 'uploadId'>,
    IMaterialVirtuals {
  _id: string
  projectId: string
  uploadId: string
}
