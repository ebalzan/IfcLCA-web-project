import IMaterialDB from '@/interfaces/materials/IMaterialDB'

export interface IMaterialClient extends Omit<IMaterialDB, '_id'> {
  _id: string
}
