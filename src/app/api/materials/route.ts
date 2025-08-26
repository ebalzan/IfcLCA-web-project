import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import {
  withAuthAndDBQueryParams,
  withAuthAndDBValidation,
  withAuthAndDBValidationWithQueryParams,
} from '@/lib/validation-middleware'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  CreateMaterialBulkRequestApi,
  createMaterialBulkRequestApiSchema,
  DeleteMaterialBulkRequestApi,
  deleteMaterialBulkRequestApiSchema,
  GetMaterialBulkRequestApi,
  getMaterialBulkRequestApiSchema,
  UpdateMaterialBulkRequestApi,
  updateMaterialBulkRequestApiSchema,
} from '@/schemas/api/materials/material-requests'
import {
  CreateMaterialBulkResponseApi,
  DeleteMaterialBulkResponseApi,
  UpdateMaterialBulkResponseApi,
} from '@/schemas/api/materials/material-responses'

async function createMaterialBulk(
  request: AuthenticatedValidationRequest<CreateMaterialBulkRequestApi['data']>,
  context: ValidationContext<never, CreateMaterialBulkRequestApi['query']>
) {
  try {
    const { materials } = request.validatedData
    const { projectId } = context.query

    const materialsWithProjectId = materials.map(material => ({
      ...material,
      projectId: new Types.ObjectId(projectId),
      uploadId: new Types.ObjectId(material.uploadId),
    }))

    const results = await MaterialService.createMaterialBulk({
      data: {
        materials: materialsWithProjectId,
        projectId: new Types.ObjectId(projectId),
      },
    })

    return sendApiSuccessResponse<CreateMaterialBulkResponseApi['data']>(
      results.data.map(material => ({
        ...material,
        _id: material._id.toString(),
        projectId: material.projectId.toString(),
        uploadId: material.uploadId.toString(),
      })),
      'Materials created successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create bulk', resource: 'material' })
  }
}

async function getMaterialBulk(
  request: AuthenticatedRequest,
  context: ValidationContext<never, GetMaterialBulkRequestApi['query']>
) {
  try {
    const { projectId, pagination } = context.query
    const { page, size } = pagination

    if (projectId && !Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const material = await MaterialService.getMaterialBulk(
      projectId
        ? {
            data: {
              projectId: new Types.ObjectId(projectId),
              pagination: { page, size },
            },
          }
        : {
            data: {
              pagination: { page, size },
            },
          }
    )

    // Convert ObjectIds to strings for API response
    const serializedData = {
      ...material.data,
      materials: material.data.materials.map(material => ({
        ...material,
        _id: material._id.toString(),
        projectId: material.projectId.toString(),
        uploadId: material.uploadId?.toString() || null,
      })),
    }

    return sendApiSuccessResponse(serializedData, 'Material fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'material' })
  }
}

async function updateMaterialBulk(
  request: AuthenticatedValidationRequest<UpdateMaterialBulkRequestApi['data']>
) {
  try {
    const { materialIds, updates } = request.validatedData

    const updatesWithObjectId = updates.map(update => ({
      ...update,
      uploadId: new Types.ObjectId(update.uploadId),
      projectId: new Types.ObjectId(update.projectId),
    }))

    const results = await MaterialService.updateMaterialBulk({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
        updates: updatesWithObjectId,
      },
    })

    return sendApiSuccessResponse<UpdateMaterialBulkResponseApi['data']>(
      results.data.map(material => ({
        ...material,
        _id: material._id.toString(),
        projectId: material.projectId.toString(),
        uploadId: material.uploadId.toString(),
      })),
      'Materials updated successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update bulk', resource: 'material' })
  }
}

async function deleteMaterialBulk(
  request: AuthenticatedValidationRequest<DeleteMaterialBulkRequestApi['data']>
) {
  try {
    const { materialIds } = request.validatedData

    const results = await MaterialService.deleteMaterialBulk({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
      },
    })

    return sendApiSuccessResponse<DeleteMaterialBulkResponseApi['data']>(
      results.data.map(material => ({
        ...material,
        _id: material._id.toString(),
        projectId: material.projectId.toString(),
        uploadId: material.uploadId.toString(),
      })),
      'Materials deleted successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete bulk', resource: 'material' })
  }
}

export const POST = withAuthAndDBValidationWithQueryParams({
  dataSchema: createMaterialBulkRequestApiSchema.shape.data,
  queryParamsSchema: createMaterialBulkRequestApiSchema.shape.query,
  handler: createMaterialBulk,
  options: {
    method: 'json',
  },
})
export const GET = withAuthAndDBQueryParams({
  queryParamsSchema: getMaterialBulkRequestApiSchema.shape.query,
  handler: getMaterialBulk,
})
export const PUT = withAuthAndDBValidation({
  dataSchema: updateMaterialBulkRequestApiSchema.shape.data,
  handler: updateMaterialBulk,
  options: {
    method: 'json',
  },
})
export const DELETE = withAuthAndDBValidation({
  dataSchema: deleteMaterialBulkRequestApiSchema.shape.data,
  handler: deleteMaterialBulk,
  options: {
    method: 'json',
  },
})
