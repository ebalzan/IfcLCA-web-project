import { Element, MaterialDeletion } from '@/models'
import {
  CreateElementBulkRequest,
  CreateElementRequest,
  DeleteElementRequest,
  UpdateElementBulkRequest,
  UpdateElementRequest,
} from '@/schemas/api/elements/elementRequests'
import {
  CreateElementBulkResponse,
  CreateElementResponse,
  DeleteElementResponse,
  UpdateElementBulkResponse,
  UpdateElementResponse,
} from '@/schemas/api/elements/elementResponses'
import { withTransaction } from '@/utils/withTransaction'
import {
  DatabaseError,
  ElementDeleteError,
  ElementNotFoundError,
  ElementUpdateError,
  isAppError,
} from '../errors'
import { logger } from '../logger'

export class ElementService {
  // Cache configuration
  private static materialCache = new Map<string, any>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Creates a new element
   */
  static async createElement({
    data: element,
    session,
  }: CreateElementRequest): Promise<CreateElementResponse> {
    try {
      const newElement = await Element.create([element], { session: session || null })

      return {
        success: true,
        data: newElement[0],
        message: 'Element created successfully',
      }
    } catch (error: unknown) {
      logger.error('Error creating element', { error })
      throw error
    }
  }

  /**
   * Creates multiple elements
   */
  static async createElementBulk({
    data: { elements },
    session,
  }: CreateElementBulkRequest): Promise<CreateElementBulkResponse> {
    try {
      const newElements = await Element.insertMany(elements, { session: session || null })

      return {
        success: true,
        data: newElements,
        message: 'Elements created successfully',
      }
    } catch (error: unknown) {
      logger.error('Error creating elements', { error })
      throw error
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
      throw error
    }
  }

  /**
   * Updates multiple elements
   */
  static async updateElementBulk({
    data: { elementIds, updates },
    session,
  }: UpdateElementBulkRequest): Promise<UpdateElementBulkResponse> {
    const elementUpdatePromises = elementIds.map(async elementId => {
      try {
        // 1. Check if element exists
        const element = await Element.findById(elementId)
          .session(session || null)
          .lean()

        if (!element) {
          throw new ElementNotFoundError(elementId.toString())
        }

        // 2. Update material
        const updateResult = await Element.updateMany(
          { _id: elementId },
          {
            $set: {
              ...updates,
              updatedAt: new Date(),
            },
          },
          { session, upsert: false }
        )

        if (updateResult.modifiedCount === 0) {
          throw new ElementUpdateError(`Failed to update element: ${elementId}`)
        }

        // 3. Fetch updated material (for response)
        const updatedElement = await Element.findById(elementId)
          .session(session || null)
          .lean()

        if (!updatedElement) {
          throw new ElementNotFoundError(elementId.toString())
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
  }

  /**
   * Deletes an element
   */
  static async deleteElement({
    data: { id: elementId },
    session,
  }: DeleteElementRequest): Promise<DeleteElementResponse> {
    return withTransaction(async useSession => {
      try {
        // 1. Check if material exists
        const element = await Element.findById(elementId).session(useSession).lean()

        if (!element) {
          throw new ElementNotFoundError(elementId.toString())
        }

        // 2. Delete the material
        const deleteResult = await Element.findByIdAndDelete(elementId).session(useSession)

        if (!deleteResult) {
          throw new ElementDeleteError('Failed to delete element')
        }

        // 3. Create a material deletion record
        await MaterialDeletion.create(
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
}
