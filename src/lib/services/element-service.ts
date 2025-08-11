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
    data: element,
    session,
  }: CreateElementRequest): Promise<CreateElementResponse> {
    try {
      const newElement = await Element.insertOne(element, { session: session || null })

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
    data: { elementId },
    session,
  }: GetElementRequest): Promise<GetElementResponse> {
    try {
      const element = await Element.findOne({
        _id: elementId,
      })
        .session(session || null)
        .lean()

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
    data: { elementIds, projectId },
    session,
  }: GetElementBulkRequest): Promise<GetElementBulkResponse> {
    try {
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
        .lean()

      // 3. Check if elements exist
      if (!elements) {
        throw new ElementNotFoundError(elementIds.toString())
      }

      return {
        success: true,
        data: elements,
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
    data: { elementId, updates },
    session,
  }: UpdateElementRequest): Promise<UpdateElementResponse> {
    try {
      // 1. Check if element exists
      const element = await Element.findById(elementId)
        .session(session || null)
        .lean()

      if (!element) {
        throw new ElementNotFoundError(elementId.toString())
      }

      // 2. Update element
      const updatedResult = await Element.findByIdAndUpdate(elementId, updates, {
        new: true,
        session: session || null,
      })

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
            const element = await Element.findOne(query).session(useSession).lean()

            if (!element) {
              throw new ElementNotFoundError(elementId.toString())
            }

            // 2. Update element individually
            const updatedElement = await Element.findByIdAndUpdate(
              elementId,
              {
                $set: {
                  ...updates[index],
                  updatedAt: new Date(),
                },
              },
              {
                new: true,
                session: useSession,
                runValidators: true,
              }
            )

            if (!updatedElement) {
              throw new ElementUpdateError(`Failed to update element: ${elementId}`)
            }

            return updatedElement
          } catch (error: unknown) {
            logger.error('❌ [Element Service] Error in updateElementBulk:', error)
            throw error
          }
        })

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
    data: { elementId },
    session,
  }: DeleteElementRequest): Promise<DeleteElementResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Check if element exists
        const element = await Element.findById(elementId).session(useSession).lean()

        if (!element) {
          throw new ElementNotFoundError(elementId.toString())
        }

        // 2. Delete the element
        const deleteResult = await Element.findByIdAndDelete(elementId).session(useSession)

        if (!deleteResult) {
          throw new ElementDeleteError('Failed to delete element')
        }

        // 3. Create a element deletion record
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
        // 1. Check if elements exist
        const query: FilterQuery<IElementDB> = {
          _id: { $in: elementIds },
        }
        if (projectId) {
          query.projectId = projectId
        }
        const elements = await Element.find(query).session(useSession).lean()

        if (!elements) {
          throw new ElementNotFoundError(elementIds.toString())
        }

        // 2. Delete the elements
        const deleteResult = await Element.deleteMany(query).session(useSession)

        if (deleteResult.deletedCount !== elementIds.length) {
          throw new ElementDeleteError('Failed to delete elements')
        }

        // 3. Create element deletion records
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
