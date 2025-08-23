import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, withAuthAndDB } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validateQueryParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import {
  CreateMaterialBulkRequestApi,
  createMaterialBulkRequestApiSchema,
  DeleteMaterialBulkRequestApi,
  deleteMaterialBulkRequestApiSchema,
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
  request: AuthenticatedValidationRequest<CreateMaterialBulkRequestApi>
) {
  try {
    const { materials, projectId } = request.validatedData.data

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

async function getMaterialBulk(request: AuthenticatedRequest) {
  try {
    const queryParams = validateQueryParams(getMaterialBulkRequestApiSchema, request, {
      data: {
        pagination: {
          page: 1,
          size: 10,
        },
      },
    })
    const { projectId } = queryParams.data
    const { page, size } = queryParams.data.pagination

    if (projectId && !Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const material = await MaterialService.getMaterialBulk({
      data: {
        projectId: projectId ? new Types.ObjectId(projectId) : undefined,
        pagination: { page, size },
      },
    })

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
  request: AuthenticatedValidationRequest<UpdateMaterialBulkRequestApi>
) {
  try {
    const { materialIds, updates, projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const updatesWithObjectId = updates.map(update => ({
      ...update,
      uploadId: new Types.ObjectId(update.uploadId),
      projectId: new Types.ObjectId(projectId),
    }))

    const results = await MaterialService.updateMaterialBulk({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
        updates: updatesWithObjectId,
        projectId: new Types.ObjectId(projectId),
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
  request: AuthenticatedValidationRequest<DeleteMaterialBulkRequestApi>
) {
  try {
    const { materialIds, projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const results = await MaterialService.deleteMaterialBulk({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
        projectId: new Types.ObjectId(projectId),
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

export const POST = withAuthAndValidation(createMaterialBulkRequestApiSchema, createMaterialBulk, {
  method: 'json',
})
export const GET = withAuthAndDB(getMaterialBulk)
export const PUT = withAuthAndValidation(updateMaterialBulkRequestApiSchema, updateMaterialBulk, {
  method: 'json',
})
export const DELETE = withAuthAndValidation(
  deleteMaterialBulkRequestApiSchema,
  deleteMaterialBulk,
  {
    method: 'json',
  }
)
