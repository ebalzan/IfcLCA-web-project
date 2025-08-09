import { z } from 'zod'

export const ifcMaterialSchema = z.object({
  name: z.string().min(1, {
    message: 'Material name is required',
  }),
  volume: z.number().nonnegative({
    message: 'Volume must be non-negative',
  }),
})

export const ifcMaterialLayerSchema = z.object({
  layers: z.array(ifcMaterialSchema),
})

export const ifcElementSchema = z.object({
  globalId: z.string().min(1, {
    message: 'Global ID is required',
  }),
  type: z.string().min(1, {
    message: 'Element type is required',
  }),
  name: z.string().min(1, {
    message: 'Element name is required',
  }),
  volume: z.number().nonnegative({
    message: 'Volume must be non-negative',
  }),
  properties: z
    .object({
      loadBearing: z.boolean().optional(),
      isExternal: z.boolean().optional(),
    })
    .optional(),
  materials: z.array(ifcMaterialSchema).optional(),
  materialLayers: z.array(ifcMaterialLayerSchema).optional(),
})

export type IFCElement = z.infer<typeof ifcElementSchema>
