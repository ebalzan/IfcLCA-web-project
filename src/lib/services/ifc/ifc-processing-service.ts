import { Types } from 'mongoose'
import { IMaterialLayer } from '@/interfaces/elements/IMaterialLayer'
import { EC3MatchError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { Element, Material } from '@/models'
import {
  ApplyAutomaticMaterialMatchesRequest,
  ApplyAutomaticMaterialMatchesResponse,
  ProcessElementsAndMaterialsFromIFCRequest,
  ProcessElementsAndMaterialsFromIFCResponse,
} from '@/schemas/services/ifc'
import { MaterialService } from '../material-service'

export class IFCProcessingService {
  private static materialCache = new Map<string, any>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Process elements from Ifc file with existing material matches
   */
  static async processElementsAndMaterialsFromIFC({
    data: { projectId, elements, uploadId },
    session,
  }: ProcessElementsAndMaterialsFromIFCRequest): Promise<ProcessElementsAndMaterialsFromIFCResponse> {
    try {
      logger.debug('Starting IFC file processing', {
        elementCount: elements.length,
        projectId,
        uploadId,
      })

      // 1. Get all material names
      const materialNames = new Set<string>(
        elements.flatMap(element => {
          const directMaterials = element.materials || []
          const layerMaterials = Object.keys(element.material_volumes || {})
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
      const materialBulkResult = await MaterialService.getMaterialBulk({
        data: {
          projectId,
          pagination: { page: 1, size: materialNames.size },
        },
        session,
      })
      const materials = materialBulkResult.data.materials

      console.log('materials', materials)

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
                .map(materialName => {
                  console.log('materialName', materialName)
                  const material = materialMap.get(materialName)

                  if (!material) {
                    logger.warn(`Material not found: ${materialName}`)
                    return null
                  }

                  return {
                    materialId: new Types.ObjectId(material._id),
                    materialName: material.name,
                    volume: 0,
                    fraction: null,
                    thickness: null,
                    indicators: null,
                  }
                })
                .filter(item => item !== null)
            )
          }

          // Process material layers
          if (Object.keys(element.material_volumes).length) {
            const totalVolume = element.volume
            const layers = Object.entries(element.material_volumes)

            processedMaterials.push(
              ...layers
                .map(([materialName, data], index) => {
                  const material = materialMap.get(materialName)

                  if (!material) {
                    logger.warn(`Material not found: ${materialName}`)
                    return null
                  }

                  return {
                    materialId: new Types.ObjectId(material._id),
                    materialName: material.name,
                    // volume: data[index].volume / totalVolume,
                    // fraction: data[index].fraction,
                    volume: 0,
                    fraction: 0,
                    thickness: null,
                    indicators: null,
                  }
                })
                .filter(item => item !== null)
            )
          }

          return {
            updateOne: {
              filter: {
                guid: element.id,
                projectId,
              },
              update: {
                $set: {
                  name: element.object_type,
                  type: element.type,
                  volume: element.volume,
                  loadBearing: element.properties.loadBearing,
                  isExternal: element.properties.isExternal,
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
      const materials = await MaterialService.getMaterialBulk({
        data: {
          projectId,
          pagination: { page: 1, size: materialIds.length },
        },
        session,
      })

      // 2. Get best matches for each material
      const bestMatches = await Promise.all(
        materials.data.materials.map(async material => {
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
            materialIds: validMatches.map(match => new Types.ObjectId(match.material._id)),
            updates: validMatches.map(match => ({
              ...match.ec3Match,
              ec3MatchId: match.ec3Match.id,
              score: match.score,
            })),
            projectId,
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
