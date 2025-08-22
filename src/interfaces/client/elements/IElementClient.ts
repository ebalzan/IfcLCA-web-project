import { IElementDB, IElementVirtuals } from '@/interfaces/elements/IElementDB'
import { IMaterialLayerClient } from './IMaterialLayerClient'

export interface IElementClient
  extends Omit<IElementDB, '_id' | 'materialLayers'>,
    IElementVirtuals {
  _id: string
  materialLayers: IMaterialLayerClient[]
}
