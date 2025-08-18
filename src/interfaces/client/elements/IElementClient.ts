import { IElementDB } from '@/interfaces/elements/IElementDB'
import { IMaterialLayerClient } from './IMaterialLayerClient'

export interface IElementClient extends Omit<IElementDB, '_id' | 'materialLayers'> {
  _id: string
  materialLayers: IMaterialLayerClient[]
}
