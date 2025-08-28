import { IMaterialLayer } from '@/interfaces/elements/IMaterialLayer'

export interface IMaterialLayerClient extends Omit<IMaterialLayer, 'materialId'> {
  materialId: string
}
