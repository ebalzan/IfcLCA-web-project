import IMaterialDB, { IMaterialVirtuals } from '@/interfaces/materials/IMaterialDB'

export interface IMaterialClient extends Omit<IMaterialDB, '_id'>, IMaterialVirtuals {
  _id: string
}
