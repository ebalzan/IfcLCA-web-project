import { FilterQuery } from 'mongoose'
import { IEC3Material } from '@/interfaces/materials/IEC3Material'
import IMaterialDB from '@/interfaces/materials/IMaterialDB'
import {
  MaterialNotFoundError,
  MaterialUpdateError,
  MaterialCreateError,
  MaterialDeleteError,
  EC3CreateMatchError,
  DatabaseError,
  isAppError,
  ExternalServiceError,
} from '@/lib/errors'
import { logger } from '@/lib/logger'
import { Material, EC3Match, MaterialDeletion } from '@/models'
import {
  CreateEC3BulkMatchRequest,
  CreateEC3MatchRequest,
  CreateMaterialBulkRequest,
  CreateMaterialRequest,
  DeleteMaterialBulkRequest,
  DeleteMaterialRequest,
  GetMaterialBulkRequest,
  GetMaterialRequest,
  UpdateMaterialBulkRequest,
  UpdateMaterialRequest,
} from '@/schemas/api/materials/material-requests'
import {
  CreateMaterialBulkResponse,
  CreateEC3BulkMatchResponse,
  CreateEC3MatchResponse,
  CreateMaterialResponse,
  DeleteMaterialResponse,
  UpdateMaterialBulkResponse,
  UpdateMaterialResponse,
  GetMaterialResponse,
  GetMaterialBulkResponse,
  DeleteMaterialBulkResponse,
} from '@/schemas/api/materials/material-responses'
import { withTransaction } from '@/utils/withTransaction'
import { api } from '../fetch'

// updateProjectEmissions && calculateProjectTotals && recalculateElementsForMaterials ONLY
// interface IPopulatedElementMaterials {
//   materials: {
//     material: {
//       density: number
//       ec3MatchId: ILCAIndicators
//     }
//     volume: number
//     fraction: number
//     thickness?: number
//   }[]
// }

export class MaterialService {
  // Cache configuration
  private static materialCache = new Map<string, any>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Creates a new material
   */
  static async createMaterial({
    data: { projectId, ...material },
    session,
  }: CreateMaterialRequest): Promise<CreateMaterialResponse> {
    try {
      const createResult = await Material.insertOne(
        { ...material, projectId },
        { session: session || null }
      )

      return {
        success: true,
        data: createResult,
        message: 'Material created successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Material Service] Error in createMaterial:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new MaterialCreateError(
        error instanceof Error ? error.message : 'Failed to create material'
      )
    }
  }

  /**
   * Creates multiple materials
   */
  static async createMaterialBulk({
    data: { materials, projectId },
    session,
  }: CreateMaterialBulkRequest): Promise<CreateMaterialBulkResponse> {
    return withTransaction(async useSession => {
      try {
        const createResult = await Material.insertMany(
          materials.map(material => ({
            ...material,
            projectId: projectId || material.projectId,
          })),
          {
            session: useSession,
          }
        )

        return {
          success: true,
          data: createResult,
          message: 'Materials created successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Material Service] Error in createMaterialBulk:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new MaterialCreateError(
          error instanceof Error ? error.message : 'Failed to create materials'
        )
      }
    }, session)
  }

  /**
   * Create a single material match
   */
  static async createEC3Match({
    data: { materialId, updates },
    session,
  }: CreateEC3MatchRequest): Promise<CreateEC3MatchResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Check if material exists
        const material = await Material.findById(materialId).session(useSession).lean()

        if (!material) {
          throw new MaterialNotFoundError(materialId.toString())
        }

        // 2. Check if material is already matched
        const existingMatch = await EC3Match.findOne({ materialId }).session(useSession).lean()

        if (existingMatch) {
          return {
            success: false,
            data: null,
            message: 'Material already matched to EC3',
          }
        }

        // 3. Update material
        await this.updateMaterial({ data: { materialId, updates }, session: useSession })

        // 3. Create EC3 match record
        await EC3Match.create(
          [
            {
              ec3MatchId: updates.ec3MatchId,
              materialId,
              score: updates.score,
            },
          ],
          { session: useSession }
        )

        return {
          success: true,
          data: {
            ec3MatchId: updates.ec3MatchId,
            materialId: materialId.toString(),
            score: updates.score,
          },
          message: 'Material matched to EC3 successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Material Service] Error in createEC3Match:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new EC3CreateMatchError(
          error instanceof Error ? error.message : 'Failed to create EC3 match'
        )
      }
    }, session)
  }

  /**
   * Create multiple material matches in bulk
   */
  static async createEC3BulkMatch({
    data: { materialIds, updates, projectId },
    session,
  }: CreateEC3BulkMatchRequest): Promise<CreateEC3BulkMatchResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Build query
        const query: FilterQuery<IMaterialDB> = {
          _id: { $in: materialIds },
        }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Check if the materials are already matched to EC3
        const existingMatches = await EC3Match.find(query).session(useSession).lean()

        if (existingMatches.length > 0) {
          return {
            success: true,
            data: [],
            message: 'Materials already matched to EC3',
          }
        }

        // 3. Update materials with EC3 matches
        await this.updateMaterialBulk({ data: { materialIds, updates }, session: useSession })

        // 4. Create EC3 matches
        const bulkOperations = materialIds.map((materialId, index) => ({
          insertOne: {
            document: {
              ec3MatchId: updates[index].ec3MatchId,
              materialId,
              score: updates[index].score,
            },
          },
        }))
        await EC3Match.bulkWrite(bulkOperations, { session: useSession })

        return {
          success: true,
          data: updates.map((material, index) => ({
            ec3MatchId: material.ec3MatchId,
            materialId: materialIds[index].toString(),
            score: updates[index].score,
          })),
          message: 'Materials matched to EC3 successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Material Service] Error in createEC3BulkMatch:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new EC3CreateMatchError(
          error instanceof Error ? error.message : 'Failed to create EC3 bulk matches'
        )
      }
    }, session)
  }

  /**
   * Get a material by its ID
   */
  static async getMaterial({
    data: { materialId, projectId },
    session,
  }: GetMaterialRequest): Promise<GetMaterialResponse> {
    try {
      // 1. Build query
      const query: FilterQuery<IMaterialDB> = {
        _id: materialId,
      }
      if (projectId) {
        query.projectId = projectId
      }

      // 2. Fetch material
      const material = await Material.findOne(query)
        .session(session || null)
        .lean()

      // 3. Check if material exists
      if (!material) {
        throw new MaterialNotFoundError(materialId.toString())
      }

      return {
        success: true,
        data: material,
        message: 'Material fetched successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Material Service] Error in getMaterial:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new DatabaseError(
        error instanceof Error ? error.message : 'Failed to fetch material',
        'read'
      )
    }
  }

  /**
   * Get multiple materials by their IDs
   */
  static async getMaterialBulk({
    data: { materialIds, projectId, pagination },
    session,
  }: GetMaterialBulkRequest): Promise<GetMaterialBulkResponse> {
    try {
      const { page, size } = pagination
      const skip = (page - 1) * size

      // 1. Build query
      const query: FilterQuery<IMaterialDB> = {
        _id: { $in: materialIds },
      }
      if (projectId) {
        query.projectId = projectId
      }

      // 2. Fetch materials with pagination
      const materials = await Material.find(query)
        .session(session || null)
        .limit(size)
        .skip(skip)
        .lean()

      if (!materials || materials.length === 0) {
        throw new MaterialNotFoundError(materialIds.join(', '))
      }

      // 3. Get total count for pagination metadata
      const totalCount = await Material.countDocuments(query).session(session || null)
      const hasMore = page * size < totalCount

      return {
        success: true,
        data: {
          materials,
          pagination: { page, size, totalCount, hasMore, totalPages: Math.ceil(totalCount / size) },
        },
        message: 'Materials fetched successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Material Service] Error in getMaterialBulk:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new DatabaseError(
        error instanceof Error ? error.message : 'Failed to fetch materials',
        'read'
      )
    }
  }

  /**
   * Update a material
   */
  static async updateMaterial({
    data: { materialId, updates, projectId },
    session,
  }: UpdateMaterialRequest): Promise<UpdateMaterialResponse> {
    return withTransaction(
      async useSession => {
        try {
          // 1. Build query
          const query: FilterQuery<IMaterialDB> = { _id: materialId }
          if (projectId) {
            query.projectId = projectId
          }

          // 2. Check if material exists
          const material = await Material.findOne(query).session(useSession).lean()

          if (!material) {
            throw new MaterialNotFoundError(materialId.toString())
          }

          // 3. Update material
          const updateResult = await Material.findOneAndUpdate(
            query,
            {
              $set: {
                ...updates,
                updatedAt: new Date(),
              },
            },
            { session: useSession, upsert: false, new: true }
          )

          // 4. Check if update was successful
          if (!updateResult) {
            throw new MaterialUpdateError(`Failed to update material: ${materialId}`)
          }

          return {
            success: true,
            data: updateResult,
            message: 'Material updated successfully',
          }
        } catch (error: unknown) {
          logger.error('❌ [Material Service] Error in updateMaterial:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new MaterialUpdateError(
            error instanceof Error ? error.message : 'Failed to update material'
          )
        }
      },
      session,
      'updateMaterial'
    )
  }

  /**
   * Update multiple materials
   */
  static async updateMaterialBulk({
    data: { materialIds, updates, projectId },
    session,
  }: UpdateMaterialBulkRequest): Promise<UpdateMaterialBulkResponse> {
    return withTransaction(
      async useSession => {
        // 1. Build query
        const query: FilterQuery<IMaterialDB> = {
          _id: { $in: materialIds },
        }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Update materials
        const materialUpdatePromises = materialIds.map(async (materialId, index) => {
          try {
            // 1. Check if material exists and belongs to project (if projectId provided)
            const materialQuery: FilterQuery<IMaterialDB> = { _id: materialId }
            if (projectId) {
              materialQuery.projectId = projectId
            }

            // 2. Check if material exists
            const material = await Material.findOne(materialQuery).session(useSession).lean()

            if (!material) {
              throw new MaterialNotFoundError(materialId.toString())
            }

            // 3. Update material individually
            const updatedMaterial = await Material.findOneAndUpdate(
              materialQuery,
              {
                $set: {
                  ...updates[index],
                  updatedAt: new Date(),
                },
              },
              {
                session: useSession,
                upsert: false,
                new: true,
              }
            )

            // 4. Check if update was successful
            if (!updatedMaterial) {
              throw new MaterialUpdateError(`Failed to update material: ${materialId}`)
            }

            return updatedMaterial
          } catch (error: unknown) {
            logger.error('❌ [Material Service] Error in updateMaterialBulk:', error)
            throw error
          }
        })

        // 3. Check if updates were successful
        const materials = await Promise.all(materialUpdatePromises)

        return {
          success: true,
          data: materials,
          message: 'Materials updated successfully',
        }
      },
      session,
      'updateMaterialBulk'
    )
  }

  /**
   * Deletes a material
   */
  static async deleteMaterial({
    data: { materialId, projectId },
    session,
  }: DeleteMaterialRequest): Promise<DeleteMaterialResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Build query
        const query: FilterQuery<IMaterialDB> = { _id: materialId }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Check if material exists
        const material = await Material.findOne(query).session(useSession).lean()

        if (!material) {
          throw new MaterialNotFoundError(materialId.toString())
        }

        // 3. Delete the material
        const deleteResult = await Material.findOneAndDelete(query).session(useSession)

        if (!deleteResult) {
          throw new MaterialDeleteError('Failed to delete material')
        }

        // 4. Create a material deletion record
        await MaterialDeletion.create(
          [
            {
              projectId: material.projectId,
              materialName: material.name,
              reason: 'Material deleted by user',
            },
          ],
          { session: useSession }
        )

        return {
          success: true,
          data: material,
          message: 'Material deleted successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Material Service] Error in deleteMaterial:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new MaterialDeleteError(
          error instanceof Error ? error.message : 'Failed to delete material'
        )
      }
    }, session)
  }

  /**
   * Delete multiple materials
   */
  static async deleteMaterialBulk({
    data: { materialIds, projectId },
    session,
  }: DeleteMaterialBulkRequest): Promise<DeleteMaterialBulkResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Build query
        const query: FilterQuery<IMaterialDB> = {
          _id: { $in: materialIds },
        }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Check if materials exist
        const materials = await Material.find(query).session(useSession).lean()

        if (materials.length !== materialIds.length) {
          throw new MaterialNotFoundError(materialIds.toString())
        }

        // 3. Delete the materials
        const deleteResult = await Material.deleteMany(query).session(useSession)

        if (deleteResult.deletedCount !== materialIds.length) {
          throw new MaterialDeleteError('Failed to delete materials')
        }

        // 4. Create material deletion records
        await MaterialDeletion.insertMany(
          materials.map(material => ({
            projectId: projectId || material.projectId,
            materialName: material.name,
            reason: 'Material deleted by user',
          })),
          { session: useSession }
        )

        return {
          success: true,
          data: materials,
          message: 'Materials deleted successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Material Service] Error in deleteMaterialBulk:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new MaterialDeleteError(
          error instanceof Error ? error.message : 'Failed to delete materials'
        )
      }
    }, session)
  }

  /**
   * Finds the best EC3 match for a material
   */
  static async getBestEC3Match(
    materialName: string
  ): Promise<{ ec3Material: IEC3Material; score: number } | null> {
    const cleanedName = materialName.trim()

    try {
      // Try exact match first
      const ec3Materials = await api.get<IEC3Material[]>(
        `${process.env.EC3_API_URL}/industry_epds?name__like=${cleanedName}`
      )
      const exactMatch = ec3Materials.find(m => m.name === cleanedName)

      if (exactMatch) {
        return { ec3Material: exactMatch, score: 1.0 }
      }

      // // Try case-insensitive match
      // const caseInsensitiveMatch = await EC3Material.findOne({
      //   name: { $regex: `^${cleanedName}$`, $options: 'i' },
      // })
      //   .session(session || null)
      //   .lean()

      // if (caseInsensitiveMatch) {
      //   return { ec3Material: caseInsensitiveMatch, score: 0.99 }
      // }

      return null
    } catch (error: unknown) {
      logger.error('❌ [Material Service] Error in findBestEC3Match:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new ExternalServiceError(
        'EC3',
        error instanceof Error ? error.message : 'Failed to find EC3 match'
      )
    }
  }

  // static calculateDensityFromEC3(ec3Material: IEC3Material): number {
  //   if (typeof ec3Material['kg/unit'] === 'number' && !isNaN(ec3Material['kg/unit'])) {
  //     return ec3Material['kg/unit']
  //   }

  //   if (
  //     typeof ec3Material['min density'] === 'number' &&
  //     typeof ec3Material['max density'] === 'number' &&
  //     !isNaN(ec3Material['min density']) &&
  //     !isNaN(ec3Material['max density'])
  //   ) {
  //     return (ec3Material['min density'] + ec3Material['max density']) / 2
  //   }

  //   return 0
  // }

  /**
   * Get EC3 match preview
   */
  // static async getEC3MatchPreview(
  //   materialIds: Types.ObjectId[],
  //   ec3MatchId: Types.ObjectId,
  //   density?: number,
  //   session?: ClientSession
  // ): Promise<IMaterialPreview> {
  //   const cacheKey = `preview-${materialIds.map(id => id.toString()).join('-')}-${ec3MatchId.toString()}-${density}`
  //   const cached = MaterialService.materialCache.get(cacheKey)
  //   if (cached?.timestamp > Date.now() - MaterialService.cacheTimeout) {
  //     return cached.data
  //   }

  //   try {
  //     const [materials, newEC3Product, elements] = await Promise.all([
  //       Material.find({ _id: { $in: materialIds } })
  //         .populate<{ ec3MatchId: IEC3Material }>('ec3MatchId')
  //         .session(session || null)
  //         .lean(),
  //       EC3Material.findById(ec3MatchId)
  //         .session(session || null)
  //         .lean(),
  //       Element.find({ 'materials.material': { $in: materialIds } })
  //         .populate<{ projectId: { name: string } }>('projectId', 'name')
  //         .session(session || null)
  //         .lean(),
  //     ])

  //     if (!newEC3Product) {
  //       throw new Error('EC3 product not found')
  //     }

  //     // Calculate affected elements per material
  //     const elementCounts = new Map<string, number>()
  //     const projectMap = new Map<string, Set<string>>()

  //     elements.forEach(element => {
  //       const projectName = element.projectId.name
  //       if (!projectName) return

  //       element.materials.forEach(materialLayer => {
  //         const materialId = materialLayer.material._id.toString()
  //         elementCounts.set(materialId, (elementCounts.get(materialId) || 0) + materialLayer.volume)

  //         if (!projectMap.has(materialId)) {
  //           projectMap.set(materialId, new Set())
  //         }
  //         projectMap.get(materialId)?.add(projectName)
  //       })
  //     })

  //     const changes: IMaterialChange[] = materials.map(material => ({
  //       materialId: material._id,
  //       materialName: material.name,
  //       oldEC3MatchId: material.ec3MatchId?._id,
  //       newEC3MatchId: newEC3Product._id,
  //       oldDensity: material.density,
  //       newDensity: Number(density || this.calculateDensityFromEC3(newEC3Product)),
  //       affectedElements: elementCounts.get(material._id.toString()) || 0,
  //       projects: Array.from(projectMap.get(material._id.toString()) || new Set<string>())
  //         .map(projectName => new Types.ObjectId(projectName))
  //         .sort(),
  //     }))

  //     const preview = { changes }
  //     MaterialService.materialCache.set(cacheKey, {
  //       data: preview,
  //       timestamp: Date.now(),
  //     })

  //     return preview
  //   } catch (error: unknown) {
  //     console.error('❌ [Material Service] Error in getEC3MatchPreview:', error)
  //     throw error
  //   }
  // }

  /**
   * Finds existing material match across all projects
   */
  // static async getMaterialByNameInUserProjects(
  //   materialName: string,
  //   userId: string,
  //   session?: ClientSession
  // ) {
  //   const cleanedName = materialName.trim().toLowerCase()

  //   try {
  //     // Get projects belonging to the user
  //     const userProjects = await Project.find({ userId })
  //       .select<Pick<IProjectDB, '_id'>>('_id')
  //       .session(session || null)
  //       .lean()
  //     const projectIds = userProjects.map(project => project._id)

  //     // DO I HAVE THIS MATERIAL IN THE PROJECT?
  //     // Try exact match first within user's projects
  //     const exactMatch = await Material.findOne({
  //       name: materialName,
  //       projectId: { $in: projectIds },
  //       ec3MatchId: { $exists: true },
  //     })
  //       .populate<{ ec3MatchId: IEC3Material }>('ec3MatchId')
  //       .session(session || null)
  //       .lean()

  //     if (exactMatch) {
  //       return exactMatch
  //     }

  //     // Try case-insensitive match
  //     const caseInsensitiveMatch = await Material.findOne({
  //       name: { $regex: `^${cleanedName}$`, $options: 'i' },
  //       projectId: { $in: projectIds },
  //       ec3MatchId: { $exists: true },
  //     })
  //       .populate<{ ec3MatchId: IEC3Material }>('ec3MatchId')
  //       .session(session || null)
  //       .lean()

  //     if (caseInsensitiveMatch) {
  //       return caseInsensitiveMatch
  //     }

  //     return null
  //   } catch (error: unknown) {
  //     logger.error('Error finding existing material:', { error })
  //     return null
  //   }
  // }

  /**
   * Processes materials after Ifc upload with validation
   */
  // static async processMaterials(
  //   projectId: Types.ObjectId,
  //   elements: Array<{
  //     globalId: string
  //     type: string
  //     name: string
  //     netVolume?: number | { net: number; gross: number }
  //     grossVolume?: number | { net: number; gross: number }
  //     materialLayers?: {
  //       layers: Array<{
  //         materialName: string
  //         thickness: number
  //       }>
  //       layerSetName?: string
  //     }
  //     properties?: {
  //       loadBearing?: boolean
  //       isExternal?: boolean
  //     }
  //   }>,
  //   uploadId: Types.ObjectId,
  //   session: ClientSession
  // ) {
  //   try {
  //     const materialVolumes = new Map<string, number>()
  //     const elementOps = []

  //     // First pass: Calculate total volumes per material
  //     for (const element of elements) {
  //       // const elementVolume = this.calculateIFCElementVolume(element)

  //       if (element.materialLayers?.layers) {
  //         const totalThickness = element.materialLayers.layers.reduce(
  //           (sum, layer) => sum + (layer.thickness || 0),
  //           0
  //         )

  //         for (const layer of element.materialLayers.layers) {
  //           if (layer.materialName) {
  //             const volumeFraction =
  //               totalThickness > 0
  //                 ? (layer.thickness || 0) / totalThickness
  //                 : 1 / element.materialLayers.layers.length

  //             const materialVolume = elementVolume * volumeFraction
  //             materialVolumes.set(
  //               layer.materialName,
  //               (materialVolumes.get(layer.materialName) || 0) + materialVolume
  //             )
  //           }
  //         }
  //       }

  //       // Create element operation
  //       elementOps.push({
  //         updateOne: {
  //           filter: { guid: element.globalId, projectId },
  //           update: {
  //             $set: {
  //               name: element.name,
  //               type: element.type,
  //               volume: elementVolume,
  //               loadBearing: element.properties?.loadBearing || false,
  //               isExternal: element.properties?.isExternal || false,
  //               updatedAt: new Date(),
  //             },
  //             $setOnInsert: {
  //               projectId,
  //               guid: element.globalId,
  //               createdAt: new Date(),
  //             },
  //           },
  //           upsert: true,
  //         },
  //       })
  //     }

  //     // Second pass: Update materials with accumulated volumes
  //     const materialOps = Array.from(materialVolumes.entries()).map(([name, volume]) => ({
  //       updateOne: {
  //         filter: { name, projectId },
  //         update: {
  //           $set: {
  //             volume,
  //             updatedAt: new Date(),
  //           },
  //           $setOnInsert: {
  //             name,
  //             projectId,
  //             createdAt: new Date(),
  //           },
  //         },
  //         upsert: true,
  //       },
  //     }))

  //     // Execute operations
  //     const [elementResult, materialResult] = await Promise.all([
  //       Element.bulkWrite(elementOps, { session }),
  //       Material.bulkWrite(materialOps, { session }),
  //     ])

  //     logger.debug('Processing results', {
  //       elements: {
  //         matched: elementResult.matchedCount,
  //         modified: elementResult.modifiedCount,
  //         upserted: elementResult.upsertedCount,
  //       },
  //       materials: {
  //         matched: materialResult.matchedCount,
  //         modified: materialResult.modifiedCount,
  //         upserted: materialResult.upsertedCount,
  //       },
  //     })

  //     return {
  //       success: true,
  //       elementCount: elementResult.modifiedCount + elementResult.upsertedCount,
  //       materialCount: materialResult.modifiedCount + materialResult.upsertedCount,
  //     }
  //   } catch (error: unknown) {
  //     logger.error('Error in material processing', { error })
  //     throw error
  //   }
  // }

  /**
   * Calculates emissions for a project using aggregation
   */
  // static async calculateProjectEmissions(projectId: Types.ObjectId, session?: ClientSession) {
  //   try {
  //     const elements = await Element.find({
  //       projectId: projectId,
  //     })
  //       .select<Pick<IElementDB, 'materials'>>('materials')
  //       .populate<IPopulatedElementMaterials>({
  //         path: 'materials.material',
  //         select: 'density ec3MatchId',
  //         populate: {
  //           path: 'ec3MatchId',
  //           select: 'gwp ubp penre',
  //         },
  //       })
  //       .session(session || null)
  //       .lean()

  //     const totals = elements.reduce(
  //       (acc, element) => {
  //         const elementTotals: ILCAIndicators = element.materials.reduce(
  //           (matAcc, material) => {
  //             const volume = material.volume || 0
  //             const density = material.material?.density || 0
  //             const ec3Match = material.material?.ec3MatchId

  //             // Calculate mass-based emissions
  //             const mass = volume * density
  //             return {
  //               gwp: matAcc.gwp + mass * (ec3Match?.gwp || 0),
  //               ubp: matAcc.ubp + mass * (ec3Match?.ubp || 0),
  //               penre: matAcc.penre + mass * (ec3Match?.penre || 0),
  //             }
  //           },
  //           { gwp: 0, ubp: 0, penre: 0 }
  //         )

  //         return {
  //           totalGWP: acc.totalGWP + elementTotals.gwp,
  //           totalUBP: acc.totalUBP + elementTotals.ubp,
  //           totalPENRE: acc.totalPENRE + elementTotals.penre,
  //         }
  //       },
  //       { totalGWP: 0, totalUBP: 0, totalPENRE: 0 }
  //     )

  //     return totals
  //   } catch (error: unknown) {
  //     logger.error('Error calculating project totals:', {
  //       error,
  //       projectId: projectId.toString(),
  //     })
  //     return { totalGWP: 0, totalUBP: 0, totalPENRE: 0 }
  //   }
  // }

  /**
   * Recalculates elements for given materials with efficient batching
   */
  // static async recalculateElementsForMaterials(
  //   materialIds: Types.ObjectId[],
  //   session: ClientSession | null = null
  // ): Promise<number> {
  //   try {
  //     // 1. Get all materials with their EC3 matches
  //     const materials = await Material.find({ _id: { $in: materialIds } })
  //       .select<Pick<IMaterialDB, '_id' | 'density' | 'ec3MatchId' | 'name'>>(
  //         '_id density ec3MatchId name'
  //       )
  //       .populate<{
  //         ec3MatchId: Pick<IEC3Material, 'gwp' | 'ubp' | 'penre'>
  //       }>('ec3MatchId', 'gwp ubp penre')
  //       .session(session)
  //       .lean()

  //     // Create a map for faster lookups
  //     // const materialMap = new Map(materials.map(m => [m._id.toString(), m]))

  //     // Update elements with new calculations
  //     const bulkOps = await Element.aggregate([
  //       {
  //         $match: { 'materials.material': { $in: materialIds.map(id => id.toString()) } },
  //       },
  //       {
  //         $addFields: {
  //           materials: {
  //             $map: {
  //               input: '$materials',
  //               as: 'mat',
  //               in: {
  //                 $cond: {
  //                   if: { $in: ['$$mat.material', materialIds.map(id => id.toString())] },
  //                   then: {
  //                     $let: {
  //                       vars: {
  //                         material: {
  //                           $arrayElemAt: [
  //                             materials,
  //                             {
  //                               $indexOfArray: [materials.map(m => m._id), '$$mat.material'],
  //                             },
  //                           ],
  //                         },
  //                       },
  //                       in: {
  //                         material: '$$mat.material',
  //                         volume: '$$mat.volume',
  //                         density: '$$material.density',
  //                         mass: {
  //                           $multiply: ['$$mat.volume', '$$material.density'],
  //                         },
  //                         fraction: '$$mat.fraction',
  //                         indicators: {
  //                           gwp: {
  //                             $multiply: [
  //                               {
  //                                 $multiply: ['$$mat.volume', '$$material.density'],
  //                               },
  //                               { $ifNull: ['$$material.ec3MatchId.gwp', 0] },
  //                             ],
  //                           },
  //                           ubp: {
  //                             $multiply: [
  //                               {
  //                                 $multiply: ['$$mat.volume', '$$material.density'],
  //                               },
  //                               { $ifNull: ['$$material.ec3MatchId.ubp', 0] },
  //                             ],
  //                           },
  //                           penre: {
  //                             $multiply: [
  //                               {
  //                                 $multiply: ['$$mat.volume', '$$material.density'],
  //                               },
  //                               {
  //                                 $ifNull: ['$$material.ec3MatchId.penre', 0],
  //                               },
  //                             ],
  //                           },
  //                         },
  //                       },
  //                     },
  //                   },
  //                   else: '$$mat',
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           totalIndicators: {
  //             $reduce: {
  //               input: '$materials',
  //               initialValue: { gwp: 0, ubp: 0, penre: 0 },
  //               in: {
  //                 gwp: {
  //                   $add: ['$$value.gwp', { $ifNull: ['$$this.indicators.gwp', 0] }],
  //                 },
  //                 ubp: {
  //                   $add: ['$$value.ubp', { $ifNull: ['$$this.indicators.ubp', 0] }],
  //                 },
  //                 penre: {
  //                   $add: ['$$value.penre', { $ifNull: ['$$this.indicators.penre', 0] }],
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     ]).session(session)

  //     // Execute bulk updates
  //     let modifiedCount = 0
  //     if (bulkOps.length) {
  //       const result = await Element.bulkWrite(
  //         bulkOps.map(doc => ({
  //           updateOne: {
  //             filter: { _id: doc._id },
  //             update: {
  //               $set: {
  //                 materials: doc.materials,
  //                 totalIndicators: doc.totalIndicators,
  //               },
  //             },
  //           },
  //         })),
  //         { session: session || undefined }
  //       )
  //       modifiedCount = result.modifiedCount
  //     }

  //     return modifiedCount
  //   } catch (error: unknown) {
  //     logger.error('Error recalculating elements for materials', {
  //       error,
  //       materialIds: materialIds.map(id => id.toString()),
  //     })

  //     if (isAppError(error)) {
  //       throw error
  //     }

  //     throw error
  //   }
  // }

  /**
   * Update elements for multiple materials with EC3 matches
   */
  // static async updateElementsForMaterialMatches(
  //   materialIds: Types.ObjectId[],
  //   session: ClientSession
  // ): Promise<number> {
  //   // 1. Recalculate elements for materials
  //   const processedCount = await this.recalculateElementsForMaterials(materialIds, session)

  //   // 2. Get unique project IDs for these materials
  //   const affectedProjects = await Element.distinct('projectId', {
  //     'materials.material': { $in: materialIds },
  //   }).session(session)

  //   // 3. Update emissions for all affected projects
  //   await Promise.all(
  //     affectedProjects.map(projectId => this.calculateProjectEmissions(projectId, session))
  //   )

  //   return processedCount
  // }

  /**
   * Assign EC3 match to material
   */
  // static async assignEC3MatchToMaterial(
  //   projectId: Types.ObjectId,
  //   materialName: string,
  //   ec3MatchId: string,
  //   density?: number,
  //   session?: ClientSession
  // ): Promise<IMaterialDB> {
  //   return this.withTransaction(async useSession => {
  //     // 1. Find existing material (CRUD: Read)
  //     const existingMaterial = await this.getMaterialByName(projectId, materialName, useSession)

  //     // 2. Find EC3 material (CRUD: Read)
  //     const ec3Material = await this.searchMaterialEPDOnEC3(materialName)
  //     if (!ec3Material) {
  //       throw new EC3MatchError(`EC3 product not found for id: ${ec3MatchId}`)
  //     }

  //     // 3. Calculate density and indicators
  //     const finalDensity = density || this.calculateDensityFromEC3(ec3Material)
  //     if (!finalDensity) {
  //       throw new Error(`Could not determine density for material: ${materialName}`)
  //     }

  //     const indicators = this.calculateIndicators(1, finalDensity, ec3Material)
  //     if (!indicators) {
  //       throw new Error(`Could not calculate indicators for material: ${materialName}`)
  //     }

  //     // 4. Create or Update (CRUD: Create/Update)
  //     if (existingMaterial) {
  //       // Update existing material
  //       const updatedMaterial = await this.updateMaterialAfterEC3Match(
  //         {
  //           ec3MatchId,
  //           density: finalDensity,
  //           gwp: indicators.gwp,
  //           ubp: indicators.ubp,
  //           penre: indicators.penre,
  //         },
  //         useSession
  //       )

  //       if (!updatedMaterial) {
  //         throw new MaterialUpdateError('Failed to update material')
  //       }

  //       return updatedMaterial
  //     } else {
  //       // Create new material
  //       return await this.createMaterialAfterEC3Match(
  //         {
  //           name: materialName,
  //           projectId,
  //           ec3MatchId,
  //           density: finalDensity,
  //           gwp: indicators.gwp,
  //           ubp: indicators.ubp,
  //           penre: indicators.penre,
  //         },
  //         useSession
  //       )
  //     }
  //   }, session)
  // }

  /**
   * Sync material matches
   */
  // static async syncMaterialMatches(
  //   projectId: Types.ObjectId,
  //   materialNames: string[],
  //   userId: string,
  //   session?: ClientSession
  // ): Promise<CheckMatchesResponse> {
  //   return this.withTransaction(async useSession => {
  //     // Verify that the project belongs to the current user
  //     const project = await Project.findOne({ _id: projectId, userId }).session(useSession).lean()

  //     if (!project) {
  //       throw new ProjectNotFoundError(projectId.toString())
  //     }

  //     const unmatchedMaterials: string[] = []
  //     const matchedMaterials: string[] = []

  //     for (const materialName of materialNames) {
  //       // Check if the material, already matched to EC3, exists in the user's projects
  //       const existingMatch = await this.getMaterialByNameInUserProjects(
  //         materialName,
  //         userId,
  //         useSession
  //       )

  //       if (!existingMatch) {
  //         unmatchedMaterials.push(materialName)
  //       } else {
  //         // If the material, already matched to EC3, exists in the user's projects, create a new material in the current project with the same match
  //         const newMaterial = await this.assignEC3MatchToMaterial(
  //           projectId,
  //           materialName,
  //           existingMatch.ec3MatchId.id,
  //           existingMatch.density,
  //           useSession
  //         )
  //         matchedMaterials.push(newMaterial.name)
  //       }
  //     }

  //     return {
  //       unmatchedMaterials,
  //       matchedMaterials,
  //       unmatchedCount: unmatchedMaterials.length,
  //     }
  //   }, session)
  // }
}
