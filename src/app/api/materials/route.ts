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
  GetMaterialBulkResponseApi,
  UpdateMaterialBulkResponseApi,
} from '@/schemas/api/materials/material-responses'

async function createMaterialBulk(
  request: AuthenticatedValidationRequest<CreateMaterialBulkRequestApi['data']>
) {
  try {
    const { materials, projectId } = request.validatedData

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
      results.map(material => ({
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
    const { materialIds, pagination } = context.query
    const { page, size } = pagination || { page: 1, size: 50 }

    if (!materialIds.every(id => Types.ObjectId.isValid(id))) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const material = await MaterialService.getMaterialBulk({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
        pagination: { page, size },
      },
    })

    return sendApiSuccessResponse<GetMaterialBulkResponseApi['data']>(
      {
        materials: material.materials.map(material => ({
          ...material,
          _id: material._id.toString(),
          projectId: material.projectId.toString(),
          uploadId: material.uploadId.toString(),
        })),
        pagination: {
          page,
          size,
          hasMore: material.pagination?.hasMore || false,
          totalCount: material.pagination?.totalCount || 0,
          totalPages: material.pagination?.totalPages || 0,
        },
      },
      'Materials fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'material' })
  }
}

async function updateMaterialBulk(
  request: AuthenticatedValidationRequest<UpdateMaterialBulkRequestApi['data']>
) {
  try {
    const { materialIds, updates } = request.validatedData

    if (!materialIds.every(id => Types.ObjectId.isValid(id))) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        operation: 'update bulk',
        resource: 'materials',
      })
    }

    const results = await MaterialService.updateMaterialBulk({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
        updates,
      },
    })

    return sendApiSuccessResponse<UpdateMaterialBulkResponseApi['data']>(
      results.map(material => ({
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

    if (!materialIds.every(id => Types.ObjectId.isValid(id))) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        operation: 'delete bulk',
        resource: 'materials',
      })
    }

    const results = await MaterialService.deleteMaterialBulk({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
      },
    })

    return sendApiSuccessResponse<DeleteMaterialBulkResponseApi['data']>(
      results.map(material => ({
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
