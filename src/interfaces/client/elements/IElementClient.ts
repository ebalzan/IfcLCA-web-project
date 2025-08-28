import { IElementDB, IElementVirtuals } from '@/interfaces/elements/IElementDB'
import { IMaterialLayerClient } from './IMaterialLayerClient'

export interface IElementClient
  extends Omit<IElementDB, '_id' | 'projectId' | 'uploadId' | 'materialLayers'>,
    IElementVirtuals {
  _id: string
  projectId: string
  uploadId: string
  materialLayers: IMaterialLayerClient[]
}
