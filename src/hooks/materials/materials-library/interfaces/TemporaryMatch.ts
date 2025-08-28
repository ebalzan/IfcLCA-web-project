import { IEC3MatchClient } from '@/interfaces/client/materials/IEC3MatchClient'
import { IEC3MaterialClient } from '@/interfaces/client/materials/IEC3MaterialClient'

export interface TemporaryMatch extends Omit<IEC3MatchClient, '_id'> {
  ec3MaterialData: IEC3MaterialClient
  projectName: string
  elementsAffectedCount: number
  materialName: string
}
