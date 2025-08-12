import { FilterQuery } from 'mongoose'
import { IElementDB } from '@/interfaces/elements/IElementDB'
import { Element } from '@/models/element'
import { ElementDeletion } from '@/models/element-deletion'
import {
  CreateElementBulkRequest,
  CreateElementRequest,
  DeleteElementBulkRequest,
  DeleteElementRequest,
  GetElementBulkRequest,
  GetElementRequest,
  UpdateElementBulkRequest,
  UpdateElementRequest,
} from '@/schemas/api/elements/element-requests'
import {
  CreateElementBulkResponse,
  CreateElementResponse,
  DeleteElementBulkResponse,
  DeleteElementResponse,
  GetElementBulkResponse,
  GetElementResponse,
  UpdateElementBulkResponse,
  UpdateElementResponse,
} from '@/schemas/api/elements/element-responses'
import { withTransaction } from '@/utils/withTransaction'
import {
  DatabaseError,
  ElementDeleteError,
  ElementNotFoundError,
  ElementUpdateError,
  ElementCreateError,
  isAppError,
} from '../errors'
import { logger } from '../logger'

export class ElementService {
  // Cache configuration
  private static elementCache = new Map<string, any>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Creates a new element
   */
  static async createElement({
    data: { projectId, ...element },
    session,
  }: CreateElementRequest): Promise<CreateElementResponse> {
    try {
      const newElement = await Element.insertOne(
        { ...element, projectId },
        { session: session || null }
      )

      return {
        success: true,
        data: newElement,
        message: 'Element created successfully',
      }
    } catch (error: unknown) {
      logger.error('Error creating element', { error })

      if (isAppError(error)) {
        throw error
      }

      throw new ElementCreateError(
        error instanceof Error ? error.message : 'Failed to create element'
      )
    }
  }

  /**
   * Creates multiple elements
   */
  static async createElementBulk({
    data: { elements, projectId },
    session,
  }: CreateElementBulkRequest): Promise<CreateElementBulkResponse> {
    return withTransaction(
      async useSession => {
        try {
          const newElements = await Element.insertMany(
            elements.map(element => ({
              ...element,
              projectId: projectId || element.projectId,
            })),
            { session: useSession }
          )

          return {
            success: true,
            data: newElements,
            message: 'Elements created successfully',
          }
        } catch (error: unknown) {
          logger.error('Error creating elements', { error })

          if (isAppError(error)) {
            throw error
          }

          throw new ElementCreateError(
            error instanceof Error ? error.message : 'Failed to create elements'
          )
        }
      },
      session,
      'createElementBulk'
    )
  }

  /**
   * Get an element by its ID
   */
  static async getElement({
    data: { elementId, projectId },
    session,
  }: GetElementRequest): Promise<GetElementResponse> {
    try {
      // 1. Build query
      const query: FilterQuery<IElementDB> = {
        _id: elementId,
      }
      if (projectId) {
        query.projectId = projectId
      }

      // 2. Fetch element
      const element = await Element.findOne(query)
        .session(session || null)
        .lean()

      // 3. Check if element exists
      if (!element) {
        throw new ElementNotFoundError(elementId.toString())
      }

      return {
        success: true,
        data: element,
        message: 'Element fetched successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Element Service] Error in getElement:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new DatabaseError(
        error instanceof Error ? error.message : 'Failed to fetch element',
        'read'
      )
    }
  }

  /**
   * Get multiple elements by their IDs
   */
  static async getElementBulk({
    data: { elementIds, projectId, pagination },
    session,
  }: GetElementBulkRequest): Promise<GetElementBulkResponse> {
    try {
      const { page, size } = pagination
      const skip = (page - 1) * size

      // 1. Build query
      const query: FilterQuery<IElementDB> = {
        _id: { $in: elementIds },
      }
      if (projectId) {
        query.projectId = projectId
      }

      // 2. Fetch elements
      const elements = await Element.find(query)
        .session(session || null)
        .limit(size)
        .skip(skip)
        .lean()

      // 3. Check if elements exist
      if (!elements || elements.length === 0) {
        throw new ElementNotFoundError(elementIds.toString())
      }

      // 4. Get total count for pagination metadata
      const totalCount = await Element.countDocuments(query).session(session || null)
      const hasMore = page * size < totalCount

      return {
        success: true,
        data: {
          elements,
          pagination: { page, size, totalCount, hasMore, totalPages: Math.ceil(totalCount / size) },
        },
        message: 'Elements fetched successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Element Service] Error in getElementBulk:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new DatabaseError(
        error instanceof Error ? error.message : 'Failed to fetch elements',
        'read'
      )
    }
  }

  /**
   * Updates an element
   */
  static async updateElement({
    data: { elementId, updates, projectId },
    session,
  }: UpdateElementRequest): Promise<UpdateElementResponse> {
    return withTransaction(
      async useSession => {
        try {
          // 1. Build query
          const query: FilterQuery<IElementDB> = {
            _id: elementId,
          }
          if (projectId) {
            query.projectId = projectId
          }

          // 2. Check if element exists
          const element = await Element.findOne(query).session(useSession).lean()

          if (!element) {
            throw new ElementNotFoundError(elementId.toString())
          }

          // 3. Update element
          const updatedResult = await Element.findOneAndUpdate(
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
            }
          )

          // 4. Check if update was successful
          if (!updatedResult) {
            throw new ElementUpdateError(`Failed to update element: ${elementId}`)
          }

          return {
            success: true,
            data: updatedResult,
            message: 'Element updated successfully',
          }
        } catch (error: unknown) {
          logger.error('Error updating element', { error })

          if (isAppError(error)) {
            throw error
          }

          throw new ElementUpdateError(
            error instanceof Error ? error.message : 'Failed to update element'
          )
        }
      },
      session,
      'updateElement'
    )
  }

  /**
   * Updates multiple elements
   */
  static async updateElementBulk({
    data: { elementIds, updates, projectId },
    session,
  }: UpdateElementBulkRequest): Promise<UpdateElementBulkResponse> {
    return withTransaction(
      async useSession => {
        // 1. Build query
        const query: FilterQuery<IElementDB> = { _id: { $in: elementIds } }

        if (projectId) {
          query.projectId = projectId
        }

        // 2. Update elements
        const elementUpdatePromises = elementIds.map(async (elementId, index) => {
          try {
            // 1. Check if element exists and belongs to project (if projectId provided)
            const elementQuery: FilterQuery<IElementDB> = { _id: elementId }
            if (projectId) {
              elementQuery.projectId = projectId
            }

            const element = await Element.findOne(query).session(useSession).lean()

            if (!element) {
              throw new ElementNotFoundError(elementId.toString())
            }

            // 3. Update element
            const updatedElement = await Element.findOneAndUpdate(
              elementQuery,
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
            if (!updatedElement) {
              throw new ElementUpdateError(`Failed to update element: ${elementId}`)
            }

            return updatedElement
          } catch (error: unknown) {
            logger.error('❌ [Element Service] Error in updateElementBulk:', error)
            throw error
          }
        })

        // 3. Check if updates were successful
        const elements = await Promise.all(elementUpdatePromises)

        return {
          success: true,
          data: elements,
          message: 'Elements updated successfully',
        }
      },
      session,
      'updateElementBulk'
    )
  }

  /**
   * Deletes an element
   */
  static async deleteElement({
    data: { elementId, projectId },
    session,
  }: DeleteElementRequest): Promise<DeleteElementResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Build query
        const query: FilterQuery<IElementDB> = { _id: elementId }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Check if element exists
        const element = await Element.findOne(query).session(useSession).lean()

        if (!element) {
          throw new ElementNotFoundError(elementId.toString())
        }

        // 3. Delete the element
        const deleteResult = await Element.findOneAndDelete(query).session(useSession)

        if (!deleteResult) {
          throw new ElementDeleteError('Failed to delete element')
        }

        // 4. Create a element deletion record
        await ElementDeletion.create(
          [
            {
              projectId: element.projectId,
              elementName: element.name,
              reason: 'Element deleted by user',
            },
          ],
          { session: useSession }
        )

        return {
          success: true,
          data: element,
          message: 'Element deleted successfully',
        }
      } catch (error: unknown) {
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
   * Deletes multiple elements
   */
  static async deleteElementBulk({
    data: { elementIds, projectId },
    session,
  }: DeleteElementBulkRequest): Promise<DeleteElementBulkResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Build query
        const query: FilterQuery<IElementDB> = {
          _id: { $in: elementIds },
        }
        if (projectId) {
          query.projectId = projectId
        }

        // 2. Check if elements exist
        const elements = await Element.find(query).session(useSession).lean()

        if (!elements) {
          throw new ElementNotFoundError(elementIds.toString())
        }

        // 3. Delete the elements
        const deleteResult = await Element.deleteMany(query).session(useSession)

        if (deleteResult.deletedCount !== elementIds.length) {
          throw new ElementDeleteError('Failed to delete elements')
        }

        // 4. Create element deletion records
        await ElementDeletion.insertMany(
          elements.map(element => ({
            projectId: element.projectId,
            elementName: element.name,
            reason: 'Element deleted by user',
          })),
          { session: useSession }
        )

        return {
          success: true,
          data: elements,
          message: 'Elements deleted successfully',
        }
      } catch (error: unknown) {
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
}
