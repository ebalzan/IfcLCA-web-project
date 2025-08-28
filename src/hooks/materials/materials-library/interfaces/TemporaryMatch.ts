import { IEC3MatchClient } from '@/interfaces/client/materials/IEC3MatchClient'
import { IEC3Material } from '@/interfaces/materials/IEC3Material'

export interface TemporaryMatch extends Omit<IEC3MatchClient, '_id'> {
  ec3MaterialData: Pick<IEC3Material, 'name' | 'gwp' | 'id'> & {
    category: Pick<IEC3Material['category'], 'name'>
  }
}
