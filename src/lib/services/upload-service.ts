import { logger } from '@/lib/logger'
import { Element, Material, Upload } from '@/models'
import {
  CreateUploadRequest,
  CreateUploadBulkRequest,
  GetUploadRequest,
  GetUploadBulkRequest,
  UpdateUploadRequest,
  UpdateUploadBulkRequest,
  DeleteUploadRequest,
  DeleteUploadBulkRequest,
  GetUploadBulkByProjectRequest,
} from '@/schemas/services/uploads/upload-requests'
import {
  CreateUploadResponse,
  CreateUploadBulkResponse,
  GetUploadResponse,
  GetUploadBulkResponse,
  UpdateUploadResponse,
  UpdateUploadBulkResponse,
  DeleteUploadResponse,
  DeleteUploadBulkResponse,
  GetUploadBulkByProjectResponse,
} from '@/schemas/services/uploads/upload-responses'
import { withTransaction } from '@/utils/withTransaction'
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
    data: { upload, userId },
    session,
  }: CreateUploadRequest): Promise<CreateUploadResponse> {
    try {
      const createResult = await Upload.insertOne(
        { ...upload, userId },
        { session: session || null }
      )

      const newUpload = createResult.toObject()

      return newUpload
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
    data: { uploads, projectId, userId },
    session,
  }: CreateUploadBulkRequest): Promise<CreateUploadBulkResponse> {
    try {
      const newUploadsResult = await Upload.insertMany(
        uploads.map(upload => ({
          ...upload,
          projectId,
          userId,
        })),
        { session: session || null }
      )

      const newUploads = newUploadsResult.map(result => result.toObject())

      return newUploads
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
    data: { uploadId },
    session,
  }: GetUploadRequest): Promise<GetUploadResponse> {
    try {
      const upload = await Upload.findOne({ _id: uploadId })
        .session(session || null)
        .lean()

      if (!upload) {
        throw new NotFoundError('Upload', uploadId.toString())
      }

      return upload
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
    data: { uploadIds, pagination },
    session,
  }: GetUploadBulkRequest): Promise<GetUploadBulkResponse> {
    return withTransaction(async useSession => {
      if (!pagination) {
        try {
          const uploads = await Upload.find({
            _id: { $in: uploadIds },
          })
            .session(useSession)
            .lean()

          if (!uploads || uploads.length === 0) {
            throw new NotFoundError('Upload', uploadIds.join(', '))
          }

          return { uploads }
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
      } else {
        try {
          const { page, size } = pagination
          const skip = (page - 1) * size

          const uploads = await Upload.find({
            _id: { $in: uploadIds },
          })
            .session(useSession)
            .limit(size)
            .skip(skip)
            .lean()

          if (!uploads || uploads.length === 0) {
            throw new NotFoundError('Upload', uploadIds.join(', '))
          }

          const totalCount = await Upload.countDocuments({
            _id: { $in: uploadIds },
          }).session(useSession)
          const hasMore = page * size < totalCount

          return {
            uploads,
            pagination: {
              page,
              size,
              totalCount,
              hasMore,
              totalPages: Math.ceil(totalCount / size),
            },
          }
        } catch (error: unknown) {
          logger.error('❌ [Upload Service] Error in getUploadBulk with pagination:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new DatabaseError(
            error instanceof Error ? error.message : 'Failed to fetch uploads',
            'read'
          )
        }
      }
    }, session)
  }

  /**
   * Get multiple materials by project ID
   */
  static async getUploadBulkByProject({
    data: { projectId, pagination },
    session,
  }: GetUploadBulkByProjectRequest): Promise<GetUploadBulkByProjectResponse> {
    return withTransaction(async useSession => {
      if (!pagination) {
        try {
          const uploads = await Upload.find({ projectId }).session(useSession).lean()

          if (!uploads || uploads.length === 0) {
            throw new NotFoundError('Upload', projectId.toString())
          }

          return { uploads }
        } catch (error: unknown) {
          logger.error('❌ [Upload Service] Error in getUploadBulkByProject:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new DatabaseError(
            error instanceof Error ? error.message : 'Failed to fetch uploads',
            'read'
          )
        }
      } else {
        try {
          const { page, size } = pagination
          const skip = (page - 1) * size

          const uploads = await Upload.find({ projectId })
            .session(useSession)
            .limit(size)
            .skip(skip)
            .lean()

          const totalCount = await Upload.countDocuments({ projectId }).session(useSession)

          return {
            uploads,
            pagination: {
              page,
              size,
              totalCount,
              hasMore: page * size < totalCount,
              totalPages: Math.ceil(totalCount / size),
            },
          }
        } catch (error: unknown) {
          logger.error('❌ [Upload Service] Error in getUploadBulkByProject:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new DatabaseError(
            error instanceof Error ? error.message : 'Failed to fetch uploads',
            'read'
          )
        }
      }
    }, session)
  }

  /**
   * Updates a upload
   */
  static async updateUpload({
    data: { uploadId, updates },
    session,
  }: UpdateUploadRequest): Promise<UpdateUploadResponse> {
    return withTransaction(async useSession => {
      try {
        await this.getUpload({
          data: { uploadId },
          session: useSession,
        })

        const updatedResult = await Upload.findOneAndUpdate(
          { _id: uploadId },
          {
            $set: {
              ...updates,
              updatedAt: new Date(),
            },
          },
          {
            upsert: false,
            new: true,
          }
        )
          .session(useSession)
          .lean()

        if (!updatedResult) {
          throw new UploadUpdateError(`Failed to update upload: ${uploadId.toString()}`)
        }

        return updatedResult
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
    data: { uploadIds, updates },
    session,
  }: UpdateUploadBulkRequest): Promise<UpdateUploadBulkResponse> {
    return withTransaction(
      async useSession => {
        try {
          if (uploadIds.length !== updates.length) {
            throw new UploadUpdateError('Upload IDs and updates arrays must have the same length')
          }

          const { uploads: existingUploads } = await this.getUploadBulk({
            data: { uploadIds },
            session: useSession,
          })

          if (existingUploads.length !== uploadIds.length) {
            const foundIds = existingUploads.map(upload => upload._id.toString())
            const missingIds = uploadIds.filter(id => !foundIds.includes(id.toString()))
            throw new NotFoundError(`Uploads not found: ${missingIds.join(', ')}`)
          }

          const bulkOps = uploadIds.map((uploadId, index) => ({
            updateOne: {
              filter: { _id: uploadId },
              update: {
                $set: {
                  ...updates[index],
                  updatedAt: new Date(),
                },
              },
            },
          }))

          const bulkResult = await Upload.bulkWrite(bulkOps, { session: useSession })

          if (bulkResult.modifiedCount !== uploadIds.length) {
            throw new UploadUpdateError(
              `Expected to update ${uploadIds.length} uploads, but only updated ${bulkResult.modifiedCount}`
            )
          }

          const { uploads: updatedUploads } = await this.getUploadBulk({
            data: { uploadIds },
            session: useSession,
          })

          return updatedUploads
        } catch (error: unknown) {
          logger.error('❌ [Upload Service] Error in updateUploadBulk:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new UploadUpdateError(
            error instanceof Error ? error.message : 'Failed to update uploads'
          )
        }
      },
      session,
      'updateUploadBulk'
    )
  }

  /**
   * Deletes a upload with all associated data atomically
   */
  static async deleteUpload({
    data: { uploadId },
    session,
  }: DeleteUploadRequest): Promise<DeleteUploadResponse> {
    return withTransaction(async useSession => {
      try {
        await this.getUpload({
          data: { uploadId },
          session: useSession,
        })

        const [elements, materials] = await Promise.all([
          Element.deleteMany({ uploadId }).session(useSession),
          Material.deleteMany({ uploadId }).session(useSession),
        ])

        if (elements.deletedCount !== 1 || materials.deletedCount !== 1) {
          throw new UploadDeleteError('Failed to delete upload')
        }

        const deleteResult = await Upload.findOneAndDelete({ _id: uploadId })
          .session(useSession)
          .lean()

        if (!deleteResult) {
          throw new NotFoundError('Upload', uploadId.toString())
        }

        return deleteResult
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
    data: { uploadIds },
    session,
  }: DeleteUploadBulkRequest): Promise<DeleteUploadBulkResponse> {
    return withTransaction(async useSession => {
      try {
        const { uploads: existingUploads } = await this.getUploadBulk({
          data: { uploadIds },
          session: useSession,
        })

        if (existingUploads.length !== uploadIds.length) {
          const foundIds = existingUploads.map(upload => upload._id.toString())
          const missingIds = uploadIds.filter(id => !foundIds.includes(id.toString()))
          throw new NotFoundError(`Uploads not found: ${missingIds.join(', ')}`)
        }

        const [elements, materials] = await Promise.all([
          Element.deleteMany({ uploadId: { $in: uploadIds } }).session(useSession),
          Material.deleteMany({ uploadId: { $in: uploadIds } }).session(useSession),
        ])

        if (
          elements.deletedCount !== uploadIds.length ||
          materials.deletedCount !== uploadIds.length
        ) {
          throw new UploadDeleteError('Failed to delete uploads')
        }

        const deleteResult = await Upload.deleteMany({ _id: { $in: uploadIds } })
          .session(useSession)
          .lean()

        if (deleteResult.deletedCount !== uploadIds.length) {
          throw new UploadDeleteError('Failed to delete uploads')
        }

        return existingUploads
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
}
