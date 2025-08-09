import { IEC3Material } from '@/interfaces/materials/ec3/IEC3Material'
import { EC3MatchError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { Element, Material, Project } from '@/models'
import { ApplyAutomaticMaterialMatchesRequest } from '@/schemas/api/requests'
import { ApplyAutomaticMaterialMatchesResponse } from '@/schemas/api/responses'
import { ProcessElementsAndMaterialsFromIFCProps } from './ProcessElementsAndMaterialsFromIFC'
import { MaterialService } from '../../material-service'

export class IFCProcessingService {
  /**
   * Process elements from Ifc file with existing material matches
   */
  static async processElementsAndMaterialsFromIFC({
    projectId,
    elements,
    uploadId,
  }: ProcessElementsAndMaterialsFromIFCProps) {
    try {
      if (!elements?.length) {
        throw new Error('No elements provided for processing')
      }

      logger.debug('Starting Ifc element processing', {
        elementCount: elements.length,
        projectId,
        uploadId,
      })

      // First, process all materials
      const uniqueMaterialNames = new Set(
        elements.flatMap(element => {
          const directMaterials = element.materials?.map(material => material.name) || []
          const layerMaterials =
            element.materialLayers?.map(layer => layer.layers.map(material => material.name)) || []
          return [...directMaterials, ...layerMaterials]
        })
      )

      logger.debug('Unique materials found', {
        count: uniqueMaterialNames.size,
        materials: Array.from(uniqueMaterialNames),
      })

      // Create or update materials first
      const materialOps = Array.from(uniqueMaterialNames).map(name => ({
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

      const materialResult = await Material.bulkWrite(materialOps)

      logger.debug('Material creation result', {
        upsertedCount: materialResult.upsertedCount,
        modifiedCount: materialResult.modifiedCount,
        matchedCount: materialResult.matchedCount,
      })

      // Get all materials with their matches
      const materials = await Material.find({
        name: { $in: Array.from(uniqueMaterialNames) },
        projectId,
      })
        .populate<{ ec3MatchId: IEC3Material }>('ec3MatchId')
        .lean()

      // Create map for quick lookups
      const materialMatchMap = new Map(materials.map(mat => [mat.name, mat]))

      // Process elements in batches
      const BATCH_SIZE = 50
      let processedCount = 0

      for (let i = 0; i < elements.length; i += BATCH_SIZE) {
        const batch = elements.slice(i, i + BATCH_SIZE)

        const bulkOps = batch.map(element => {
          const processedMaterials = []

          // Process direct materials
          if (element.materials?.length) {
            processedMaterials.push(
              ...element.materials
                .map(material => {
                  const match = materialMatchMap.get(material.name)
                  if (!match) {
                    logger.warn(`Material not found: ${material.name}`)
                    return null
                  }
                  return {
                    material: match._id,
                    name: material.name,
                    volume: material.volume,
                    indicators: match.ec3MatchId
                      ? MaterialService.calculateIndicators(
                          material.volume,
                          match.density,
                          match.ec3MatchId
                        )
                      : {
                          gwp: 0,
                          ubp: 0,
                          penre: 0,
                        },
                  }
                })
                .filter(Boolean)
            )
          }

          // Process material layers
          if (element.materialLayers?.length) {
            const totalVolume = element.volume || 0
            const layers = element.materialLayers.flatMap(l => l.layers)

            processedMaterials.push(
              ...layers
                .map(layer => {
                  const match = materialMatchMap.get(layer.name)
                  if (!match) {
                    logger.warn(`Material not found: ${layer.name}`)
                    return null
                  }
                  return {
                    material: match._id,
                    name: layer.name,
                    volume: layer.volume || totalVolume / layers.length,
                    indicators: match.ec3MatchId
                      ? MaterialService.calculateIndicators(
                          layer.volume || totalVolume / layers.length,
                          match.density,
                          match.ec3MatchId
                        )
                      : undefined,
                  }
                })
                .filter(Boolean)
            )
          }

          return {
            updateOne: {
              filter: {
                guid: element.guid,
                projectId,
              },
              update: {
                $set: {
                  name: element.name,
                  type: element.type,
                  volume: element.volume,
                  loadBearing: element.properties?.loadBearing || false,
                  isExternal: element.properties?.isExternal || false,
                  materials: processedMaterials,
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

        const result = await Element.bulkWrite(bulkOps)
        processedCount += result.upsertedCount + result.modifiedCount

        logger.debug(`Processed batch ${i / BATCH_SIZE + 1}`, {
          batchSize: batch.length,
          totalProcessed: processedCount,
          upsertedCount: result.upsertedCount,
          modifiedCount: result.modifiedCount,
        })
      }

      // Update project emissions if there are matched materials
      const matchedMaterials = materials.filter(m => m.ec3MatchId)
      if (matchedMaterials.length > 0) {
        try {
          const totals = await MaterialService.calculateProjectEmissions(projectId)

          await Project.updateOne(
            { _id: projectId },
            {
              $set: {
                emissions: {
                  gwp: totals.totalGWP,
                  ubp: totals.totalUBP,
                  penre: totals.totalPENRE,
                  lastCalculated: new Date(),
                },
              },
            }
          )

          logger.debug('Updated project emissions', {
            projectId,
            totals,
          })
        } catch (error: unknown) {
          logger.error('Failed to update project emissions', {
            error,
            projectId,
          })
        }
      }

      await MaterialService.calculateProjectEmissions(projectId)

      return {
        elementCount: processedCount,
        materialCount: uniqueMaterialNames.size,
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
    projectId,
    materialIds,
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
        const matchResult = await MaterialService.createMaterialBulkMatch({
          materialIds: validMatches.map(match => match.material._id),
          data: validMatches.map(match => ({
            ...match.ec3Match,
            ec3MatchId: match.ec3Match.id,
            score: match.score,
          })),
        })

        logger.debug('Material matching update result', {
          materialsAffected: matchResult.materialsAffected,
          data: matchResult.data,
        })
      }

      return { matchedCount: validMatches.length }
    } catch (error: unknown) {
      throw new EC3MatchError(error instanceof Error ? error.message : 'Unknown error')
    }
  }
}
