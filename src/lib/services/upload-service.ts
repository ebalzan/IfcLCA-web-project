import { FilterQuery } from 'mongoose'
import IUploadDB from '@/interfaces/uploads/IUploadDB'
import { logger } from '@/lib/logger'
import { Upload } from '@/models'
import {
  CreateUploadRequest,
  CreateUploadBulkRequest,
  GetUploadRequest,
  GetUploadBulkRequest,
  UpdateUploadRequest,
  UpdateUploadBulkRequest,
  DeleteUploadRequest,
  DeleteUploadBulkRequest,
  CreateUploadWithIFCProcessingRequest,
} from '@/schemas/api/uploads/upload-requests'
import {
  CreateUploadResponse,
  CreateUploadBulkResponse,
  GetUploadResponse,
  GetUploadBulkResponse,
  UpdateUploadResponse,
  UpdateUploadBulkResponse,
  DeleteUploadResponse,
  DeleteUploadBulkResponse,
  CreateUploadWithIFCProcessingResponse,
} from '@/schemas/api/uploads/upload-responses'
import { withTransaction } from '@/utils/withTransaction'
import { IFCProcessingService } from './ifc/ifc-processing-service'
import { parseIfcWithWasm } from './ifc/ifc-wasm-parser'
import {
  DatabaseError,
  NotFoundError,
  UploadCreateError,
  UploadDeleteError,
  UploadUpdateError,
  isAppError,
} from '../errors'

export class UploadService {
  // Cache configuration
  private static uploadCache = new Map<string, any>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Creates a new upload
   */
  static async createUpload({
    data: { projectId, ...upload },
    session,
  }: CreateUploadRequest): Promise<CreateUploadResponse> {
    try {
      const newUpload = await Upload.insertOne(
        { ...upload, projectId },
        { session: session || null, validateBeforeSave: true }
      )

      return {
        success: true,
        data: newUpload,
        message: 'Upload created successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Upload Service] Error in createUpload:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new UploadCreateError(
        error instanceof Error ? error.message : 'Failed to create upload'
      )
    }
  }

  /**
   * Creates multiple uploads
   */
  static async createUploadBulk({
    data: { projectId, uploads },
    session,
  }: CreateUploadBulkRequest): Promise<CreateUploadBulkResponse> {
    try {
      const newUploads = await Upload.insertMany(
        uploads.map(upload => ({
          ...upload,
          projectId: projectId || upload.projectId,
        })),
        { session: session || null }
      )

      return {
        success: true,
        data: newUploads,
        message: 'Uploads created successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Upload Service] Error in createUploadBulk:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new UploadCreateError(
        error instanceof Error ? error.message : 'Failed to create uploads'
      )
    }
  }

  /**
   * Get a upload by its ID
   */
  static async getUpload({
    data: { uploadId, projectId },
    session,
  }: GetUploadRequest): Promise<GetUploadResponse> {
    try {
      // 1. Build query
      const query: FilterQuery<IUploadDB> = {
        _id: uploadId,
      }
      if (projectId) {
        query.projectId = projectId
      }

      // 2. Fetch upload
      const upload = await Upload.findOne(query)
        .session(session || null)
        .lean()

      // 3. Check if upload exists
      if (!upload) {
        throw new NotFoundError('Upload', uploadId.toString())
      }

      return {
        success: true,
        data: upload,
        message: 'Upload fetched successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Upload Service] Error in getUpload:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new DatabaseError(
        error instanceof Error ? error.message : 'Failed to fetch upload',
        'read'
      )
    }
  }

  /**
   * Get multiple uploads by their IDs
   */
  static async getUploadBulk({
    data: { uploadIds, projectId, pagination },
    session,
  }: GetUploadBulkRequest): Promise<GetUploadBulkResponse> {
    return withTransaction(async useSession => {
      try {
        const { page, size } = pagination
        const skip = (page - 1) * size

        // 1. Build query
        const query: FilterQuery<IUploadDB> = {
          _id: { $in: uploadIds },
        }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Fetch uploads
        const uploads = await Upload.find(query).session(useSession).skip(skip).limit(size).lean()

        // 3. Check if uploads exist
        if (!uploads || uploads.length === 0) {
          throw new NotFoundError('Upload', uploadIds.join(', '))
        }

        // 4. Get total count for pagination metadata
        const totalCount = await Upload.countDocuments(query).session(useSession)
        const hasMore = page * size < totalCount

        return {
          success: true,
          data: {
            uploads,
            pagination: {
              page,
              size,
              totalCount,
              hasMore,
              totalPages: Math.ceil(totalCount / size),
            },
          },
          message: 'Uploads fetched successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Upload Service] Error in getUploadBulk:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new DatabaseError(
          error instanceof Error ? error.message : 'Failed to fetch uploads',
          'read'
        )
      }
    }, session)
  }

  /**
   * Updates a upload
   */
  static async updateUpload({
    data: { uploadId, updates, projectId },
    session,
  }: UpdateUploadRequest): Promise<UpdateUploadResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Build query
        const query: FilterQuery<IUploadDB> = {
          _id: uploadId,
        }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Fetch upload
        const upload = await Upload.findOne(query).session(useSession).lean()

        // 3. Check if upload exists
        if (!upload) {
          throw new NotFoundError('Upload', uploadId.toString())
        }

        // 4. Update upload
        const updatedResult = await Upload.findOneAndUpdate(
          query,
          {
            $set: {
              ...updates,
              updatedAt: new Date(),
            },
          },
          {
            session: useSession,
            upsert: false,
            new: true,
            runValidators: true,
          }
        )

        if (!updatedResult) {
          throw new UploadUpdateError(`Failed to update upload: ${uploadId.toString()}`)
        }

        return {
          success: true,
          data: updatedResult,
          message: 'Upload updated successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Upload Service] Error in updateUpload:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new UploadUpdateError(
          error instanceof Error ? error.message : 'Failed to update upload'
        )
      }
    }, session)
  }

  /**
   * Updates multiple uploads efficiently using bulk operations
   */
  static async updateUploadBulk({
    data: { uploadIds, updates, projectId },
    session,
  }: UpdateUploadBulkRequest): Promise<UpdateUploadBulkResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Validate input arrays have matching lengths
        if (uploadIds.length !== updates.length) {
          throw new UploadUpdateError('Upload IDs and updates arrays must have the same length')
        }

        // 2. Build base query for all operations
        const baseQuery: FilterQuery<IUploadDB> = {
          _id: { $in: uploadIds },
        }
        if (projectId) {
          baseQuery.projectId = projectId
        }

        // 3. First, verify all uploads exist and belong to the project
        const existingUploads = await Upload.find(baseQuery)
          .session(useSession)
          .lean()
          .select('_id')

        const existingUploadIds = new Set(existingUploads.map(upload => upload._id.toString()))
        const missingUploadIds = uploadIds.filter(id => !existingUploadIds.has(id.toString()))

        if (missingUploadIds.length > 0) {
          throw new NotFoundError(
            `Uploads not found: ${missingUploadIds.map(id => id.toString()).join(', ')}`
          )
        }

        // 4. Prepare bulk update operations
        const bulkOps = uploadIds.map((uploadId, index) => {
          const filter: FilterQuery<IUploadDB> = { _id: uploadId }
          if (projectId) {
            filter.projectId = projectId
          }

          return {
            updateOne: {
              filter,
              update: {
                $set: {
                  ...updates[index],
                  updatedAt: new Date(),
                },
              },
            },
          }
        })

        // 5. Execute bulk update
        const bulkResult = await Upload.bulkWrite(bulkOps, {
          session: useSession,
          ordered: false, // Continue processing even if some operations fail
        })

        // 6. Check for any failed operations
        if (bulkResult.hasWriteErrors()) {
          throw new UploadUpdateError(`Failed to update uploads`)
        }

        // 7. Fetch all updated uploads in a single query
        const updatedUploads = await Upload.find(baseQuery)
          .session(useSession)
          .lean()
          .sort({ _id: 1 })

        return {
          success: true,
          data: updatedUploads,
          message: `Successfully updated ${bulkResult.modifiedCount} uploads`,
        }
      } catch (error: unknown) {
        logger.error('❌ [Upload Service] Error in updateUploadBulk:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new UploadUpdateError(
          error instanceof Error ? error.message : 'Failed to update uploads'
        )
      }
    }, session)
  }

  /**
   * Deletes a upload with all associated data atomically
   */
  static async deleteUpload({
    data: { uploadId, projectId },
    session,
  }: DeleteUploadRequest): Promise<DeleteUploadResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Build query
        const query: FilterQuery<IUploadDB> = {
          _id: uploadId,
        }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Fetch upload to get projectId
        const upload = await Upload.findOne(query).session(useSession).lean()

        if (!upload) {
          throw new NotFoundError('Upload', uploadId.toString())
        }

        // 3. Perform all deletions atomically using bulkWrite
        const bulkOperations = [
          // Delete the upload
          {
            deleteOne: {
              filter: { _id: uploadId },
              collation: { locale: 'simple' },
            },
          },
          // Delete all elements for this upload
          {
            deleteMany: {
              filter: { uploadId },
              collation: { locale: 'simple' },
            },
          },
          // Delete all materials for this upload
          {
            deleteMany: {
              filter: { uploadId },
              collation: { locale: 'simple' },
            },
          },
        ]

        const bulkResult = await Upload.bulkWrite(bulkOperations, {
          session: useSession,
          ordered: true, // Ensures operations happen in order
        })

        // 4. Verify the upload was actually deleted
        if (bulkResult.deletedCount === 0) {
          throw new UploadDeleteError('Failed to delete upload')
        }

        return {
          success: true,
          data: upload,
          message: `Upload and associated data deleted successfully. Deleted: ${bulkResult.deletedCount} documents`,
        }
      } catch (error: unknown) {
        logger.error('❌ [Upload Service] Error in deleteUpload:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new DatabaseError(
          error instanceof Error ? error.message : 'Unknown database error',
          'delete'
        )
      }
    }, session)
  }

  /**
   * Deletes multiple uploads with all associated data atomically
   */
  static async deleteUploadBulk({
    data: { uploadIds, projectId },
    session,
  }: DeleteUploadBulkRequest): Promise<DeleteUploadBulkResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Build query
        const query: FilterQuery<IUploadDB> = {
          _id: { $in: uploadIds },
        }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Fetch uploads to verify they exist and get data for response
        const uploads = await Upload.find(query).session(useSession).lean()

        if (!uploads || uploads.length === 0) {
          throw new NotFoundError('Upload', uploadIds.join(', '))
        }

        // 3. Verify all requested uploads were found
        const foundUploadIds = uploads.map(upload => upload._id.toString())
        const missingUploadIds = uploadIds.filter(id => !foundUploadIds.includes(id.toString()))

        if (missingUploadIds.length > 0) {
          throw new NotFoundError('Upload', missingUploadIds.join(', '))
        }

        // 4. Perform all deletions atomically using bulkWrite
        const bulkOperations = [
          // Delete all uploads
          {
            deleteMany: {
              filter: query,
              collation: { locale: 'simple' },
            },
          },
          // Delete all elements for these uploads
          {
            deleteMany: {
              filter: { uploadId: { $in: uploadIds } },
              collation: { locale: 'simple' },
            },
          },
          // Delete all materials for these uploads
          {
            deleteMany: {
              filter: { uploadId: { $in: uploadIds } },
              collation: { locale: 'simple' },
            },
          },
        ]

        const bulkResult = await Upload.bulkWrite(bulkOperations, {
          session: useSession,
          ordered: true, // Ensures operations happen in order
        })

        // 5. Verify the uploads were actually deleted
        if (bulkResult.deletedCount === 0) {
          throw new UploadDeleteError('Failed to delete uploads')
        }

        return {
          success: true,
          data: uploads,
          message: `Uploads and associated data deleted successfully. Deleted: ${bulkResult.deletedCount} documents`,
        }
      } catch (error: unknown) {
        logger.error('❌ [Upload Service] Error in deleteUploadBulk:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new UploadDeleteError(
          error instanceof Error ? error.message : 'Failed to delete uploads'
        )
      }
    }, session)
  }

  static async createUploadWithIFCProcessing({
    data: { file, projectId, userId },
    session,
  }: CreateUploadWithIFCProcessingRequest): Promise<CreateUploadWithIFCProcessingResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Create upload record using existing function
        const uploadResult = await UploadService.createUpload({
          data: {
            projectId,
            filename: file.name,
            status: 'Processing',
            userId,
            _count: {
              elements: 0,
              materials: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session: useSession,
        })

        // 2. Check if upload was created successfully
        if (!uploadResult.success) {
          throw new UploadCreateError('Failed to create upload record')
        }

        const upload = uploadResult.data

        // 3. Parse IFC file
        const parseResult = await parseIfcWithWasm(file)

        // 4. Process elements and materials
        // TODO: CHECK IT LATER
        const [elementResult, matchResult] = await Promise.all([
          IFCProcessingService.processElementsAndMaterialsFromIFC({
            data: { projectId, elements: parseResult.elements, uploadId: upload._id },
            session: useSession,
          }),
          IFCProcessingService.applyAutomaticMaterialMatches({
            data: {
              projectId,
              materialIds: parseResult.elements.map(element => element.materials).flat(),
            },
            session: useSession,
          }),
        ])

        // 5. Update upload with results using existing update function
        const updateResult = await UploadService.updateUpload({
          data: {
            uploadId: upload._id,
            projectId,
            updates: {
              status: 'Completed',
              _count: {
                elements: elementResult.data.elementCount,
                materials: elementResult.data.materialCount,
              },
              updatedAt: new Date(),
            },
          },
          session: useSession,
        })

        return {
          success: true,
          data: updateResult.data,
          message: 'Upload created and processed successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Upload Service] Error in createUploadWithIFCProcessing:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new UploadCreateError(
          error instanceof Error ? error.message : 'Failed to create upload with IFC processing'
        )
      }
    }, session)
  }
}
