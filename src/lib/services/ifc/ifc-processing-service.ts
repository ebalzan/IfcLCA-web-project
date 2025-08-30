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
import { parseDensity, parseIndicator } from '@/utils/parses'
import { transformSnakeToCamel } from '@/utils/transformers'
import { withTransaction } from '@/utils/withTransaction'
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
    return withTransaction(
      async useSession => {
        try {
          if (!elements || elements.length === 0) {
            return {
              success: false,
              data: { elementCount: 0, materialCount: 0 },
              message: 'No elements found',
            }
          }

          logger.debug('Starting IFC file processing', {
            elementCount: elements.length,
            projectId,
            uploadId,
          })

          const materialNames = new Set<string>(
            elements.flatMap(element => {
              const directMaterials = element.materials?.map(material => material.name) || []
              const layerMaterials =
                element.materialLayers?.layers.map(layer => layer.materialName) || []
              return [...directMaterials, ...layerMaterials]
            })
          )

          logger.debug('Materials found', {
            count: materialNames.size,
            materials: Array.from(materialNames),
          })

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
                  uploadId,
                  createdAt: new Date(),
                },
                $set: {
                  updatedAt: new Date(),
                },
              },
              upsert: true,
            },
          }))
          const materialResult = await Material.bulkWrite(materialOps, { session: useSession })

          logger.debug('Material creation result', {
            upsertedCount: materialResult.upsertedCount,
            modifiedCount: materialResult.modifiedCount,
            matchedCount: materialResult.matchedCount,
          })

          const materialBulkResult = await Material.find({
            name: { $in: Array.from(materialNames) },
            projectId,
          })
            .session(useSession)
            .lean()

          if (!materialBulkResult || materialBulkResult.length !== materialNames.size) {
            logger.warn('Material not found', {
              materialNames: Array.from(materialNames),
              materialBulkResult: materialBulkResult.map(mat => mat.name),
            })
          }

          const materialMap = new Map(materialBulkResult.map(mat => [mat.name, mat]))

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
                    .map(ifcMaterial => {
                      const material = materialMap.get(ifcMaterial.name)

                      if (!material) {
                        logger.warn(`Material not found: ${ifcMaterial.name}`)
                        return null
                      }

                      return {
                        materialId: material._id,
                        materialName: ifcMaterial.name,
                        volume: ifcMaterial.volume,
                        fraction: ifcMaterial.fraction,
                        thickness: null,
                        indicators: null,
                      }
                    })
                    .filter(item => item !== null)
                )
              }

              // Process material layers
              if (element.materialLayers?.layers.length) {
                const totalVolume = element.volume || 0
                const layers = element.materialLayers?.layers

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
                        materialName: layer.materialName,
                        volume: layer.volume || totalVolume / layers.length,
                        thickness: null,
                        fraction: null,
                        indicators: null,
                      }
                    })
                    .filter(item => item !== null)
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
                      volume: element.volume,
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
            const result = await Element.bulkWrite(bulkOps, { session: useSession })
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
              materialCount: materialMap.size,
            },
            message: 'Elements and materials processed successfully',
          }
        } catch (error: unknown) {
          logger.error('Error processing elements', { error })
          throw error
        }
      },
      session,
      'processElementsAndMaterialsFromIFC'
    )
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

      const { materials } = await MaterialService.getMaterialBulkByProject({
        data: {
          projectId,
          pagination: { page: 1, size: materialIds.length },
        },
        session,
      })
      const materialNames = materials.map(material => material.name)

      const bestMatches = await Promise.all(
        materialNames.map(async name => {
          const bestMatch = await MaterialService.getBestEC3Match(name)

          if (!bestMatch || bestMatch.score < 0.9) {
            logger.debug(`No good match found for material: ${name}`, {
              score: bestMatch?.score || 0,
            })
            return null
          }

          logger.debug(`Found match for material: ${name}`, {
            ec3Material: bestMatch.ec3Material.name,
            score: bestMatch.score,
          })

          // TYPE THIS LATER
          const result: any = {
            ec3Material: bestMatch.ec3Material,
            ec3MatchId: bestMatch.ec3Material.id,
            materialId:
              materials.find(material => material.name === name)?._id || new Types.ObjectId(),
            autoMatched: true,
            score: bestMatch.score,
          }

          return result
        })
      )

      const validMatches = bestMatches.filter(bestMatch => bestMatch !== null)
      const hasValidMatches = validMatches.length > 0

      logger.debug('Automatic matching results', {
        totalMaterials: materialIds.length,
        validMatches: validMatches.length,
        matchedMaterials: validMatches.map(m => m.ec3Material.name),
      })

      if (hasValidMatches) {
        const transformedMatches = validMatches.map(match => ({
          ...transformSnakeToCamel(match),
          category: null,
          ec3MatchId: match.ec3Material.id,
          autoMatched: true,
          materialId: match.materialId,
        }))
        await MaterialService.createEC3BulkMatch({
          data: {
            materialIds: materialIds,
            updates: transformedMatches.map(match => ({
              ...match,
              category: null,
              densityMin: match.densityMin ? parseDensity(match.densityMin) : null,
              densityMax: match.densityMax ? parseDensity(match.densityMax) : null,
              gwp: parseIndicator(match.gwp ?? ''),
              ubp: parseIndicator(match.ubp ?? ''),
              penre: parseIndicator(match.penre ?? ''),
              declaredUnit: match.declaredUnit,
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
