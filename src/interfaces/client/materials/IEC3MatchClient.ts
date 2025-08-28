import { IEC3Match } from '@/interfaces/materials/IEC3Match'

export interface IEC3MatchClient extends Omit<IEC3Match, '_id' | 'materialId'> {
  _id: string
  materialId: string
}
