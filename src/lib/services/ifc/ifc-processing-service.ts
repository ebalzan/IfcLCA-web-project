import { IMaterialLayer } from '@/interfaces/elements/IMaterialLayer'
import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import { EC3MatchError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { Element, Material } from '@/models'
import {
  ApplyAutomaticMaterialMatchesRequest,
  ApplyAutomaticMaterialMatchesResponse,
  ProcessElementsAndMaterialsFromIFCRequest,
  ProcessElementsAndMaterialsFromIFCResponse,
} from '@/schemas/api/ifc'
import { MaterialService } from '../material-service'

export class IFCProcessingService {
  /**
   * Process elements from Ifc file with existing material matches
   */
  static async processElementsAndMaterialsFromIFC({
    data: { projectId, elements, uploadId },
    session,
  }: ProcessElementsAndMaterialsFromIFCRequest): Promise<ProcessElementsAndMaterialsFromIFCResponse> {
    try {
      logger.debug('Starting Ifc element processing', {
        elementCount: elements.length,
        projectId,
        uploadId,
      })

      // 1. Get all material names
      const materialNames = new Set<string>(
        elements.flatMap(element => {
          const directMaterials = element.materials?.map(material => material.name) || []
          const layerMaterials =
            element.materialLayers?.layers?.map(layer => layer.materialName) || []
          return [...directMaterials, ...layerMaterials]
        })
      )

      logger.debug('Materials found', {
        count: materialNames.size,
        materials: Array.from(materialNames),
      })

      // 2. Create or update materials
      const materialOps = Array.from(materialNames).map(name => ({
        updateOne: {
          filter: {
            name,
            projectId,
          },
          update: {
            $setOnInsert: {
              name,
              projectId,
              createdAt: new Date(),
            },
            $set: {
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      }))
      const materialResult = await Material.bulkWrite(materialOps, { session })

      logger.debug('Material creation result', {
        upsertedCount: materialResult.upsertedCount,
        modifiedCount: materialResult.modifiedCount,
        matchedCount: materialResult.matchedCount,
      })

      // 3. Get all materials
      const materials = await Material.find({
        name: { $in: Array.from(materialNames) },
        projectId,
      })
        .populate<{ ec3MatchId: IEC3Material }>('ec3MatchId')
        .lean()

      // 4. Create map for quick lookups
      const materialMap = new Map(materials.map(mat => [mat.name, mat]))

      // 5. Process elements in batches
      const BATCH_SIZE = 50
      let processedCount = 0

      for (let i = 0; i < elements.length; i += BATCH_SIZE) {
        const batch = elements.slice(i, i + BATCH_SIZE)

        const bulkOps = batch.map(element => {
          const processedMaterials: IMaterialLayer[] = []

          // Process direct materials
          if (element.materials?.length) {
            processedMaterials.push(
              ...element.materials
                .map(materialLayer => {
                  const material = materialMap.get(materialLayer.name)

                  if (!material) {
                    logger.warn(`Material not found: ${materialLayer.name}`)
                    return null
                  }

                  return {
                    materialId: material._id,
                    materialName: materialLayer.name,
                    volume: materialLayer.volume ?? 0,
                    fraction: materialLayer.fraction ?? null,
                    thickness: null,
                    indicators: null,
                  }
                })
                .filter((item): item is NonNullable<typeof item> => item !== null)
            )
          }

          // Process material layers
          if (element.materialLayers?.layers.length) {
            const totalVolume = element.volume || 0
            const layers = element.materialLayers.layers

            processedMaterials.push(
              ...layers
                .map(layer => {
                  const material = materialMap.get(layer.materialName)

                  if (!material) {
                    logger.warn(`Material not found: ${layer.materialName}`)
                    return null
                  }

                  return {
                    materialId: material._id,
                    materialName: material.name,
                    volume: layer.volume || totalVolume / layers.length,
                    fraction: null,
                    thickness: null,
                    indicators: null,
                  }
                })
                .filter((item): item is NonNullable<typeof item> => item !== null)
            )
          }

          return {
            updateOne: {
              filter: {
                guid: element.globalId,
                projectId,
              },
              update: {
                $set: {
                  name: element.name,
                  type: element.type,
                  volume: element.volume ?? 0,
                  loadBearing: element.properties.loadBearing || false,
                  isExternal: element.properties.isExternal || false,
                  materialLayers: processedMaterials,
                  updatedAt: new Date(),
                },
                $setOnInsert: {
                  projectId,
                  uploadId,
                  createdAt: new Date(),
                },
              },
              upsert: true,
            },
          }
        })
        const result = await Element.bulkWrite(bulkOps, { session })
        processedCount += result.upsertedCount + result.modifiedCount

        logger.debug(`Processed batch ${i / BATCH_SIZE + 1}`, {
          batchSize: batch.length,
          totalProcessed: processedCount,
          upsertedCount: result.upsertedCount,
          modifiedCount: result.modifiedCount,
        })
      }

      return {
        success: true,
        data: {
          elementCount: processedCount,
          materialCount: materials.length,
        },
        message: 'Elements and materials processed successfully',
      }
    } catch (error: unknown) {
      logger.error('Error processing elements', { error })
      throw error
    }
  }

  /**
   * Apply automatic matches to materials
   */
  static async applyAutomaticMaterialMatches({
    data: { materialIds, projectId },
    session,
  }: ApplyAutomaticMaterialMatchesRequest): Promise<ApplyAutomaticMaterialMatchesResponse> {
    try {
      logger.debug('Starting automatic material matching', {
        materialCount: materialIds.length,
        materials: materialIds,
      })

      // 1. Get materials
      const materials = await Material.find({
        _id: { $in: materialIds },
        projectId,
      }).lean()

      // 2. Get best matches for each material
      const bestMatches = await Promise.all(
        materials.map(async material => {
          const bestMatch = await MaterialService.getBestEC3Match(material.name)

          if (!bestMatch || bestMatch.score < 0.9) {
            logger.debug(`No good match found for material: ${material.name}`, {
              score: bestMatch?.score || 0,
            })
            return null
          }

          logger.debug(`Found match for material: ${material.name}`, {
            ec3Material: bestMatch.ec3Material,
            score: bestMatch.score,
          })

          return {
            material,
            ec3Match: bestMatch.ec3Material,
            score: bestMatch.score,
          }
        })
      )

      // 2. Filter out failed matches and update materials with matches
      const validMatches = bestMatches.filter(bestMatch => bestMatch !== null)
      const hasValidMatches = validMatches.length > 0

      logger.debug('Automatic matching results', {
        totalMaterials: materialIds.length,
        validMatches: validMatches.length,
        matchedMaterials: validMatches.map(m => m.material.name),
      })

      if (hasValidMatches) {
        await MaterialService.createEC3BulkMatch({
          data: {
            materialIds: validMatches.map(match => match.material._id),
            updates: validMatches.map(match => ({
              ...match.ec3Match,
              ec3MatchId: match.ec3Match.id,
              score: match.score,
            })),
          },
          session,
        })
      }

      return {
        success: true,
        data: {
          matchedCount: validMatches.length,
        },
        message: 'Automatic material matches applied',
      }
    } catch (error: unknown) {
      throw new EC3MatchError(error instanceof Error ? error.message : 'Unknown error')
    }
  }
}
