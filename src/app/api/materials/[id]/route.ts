import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import {
  withAuthAndDBPathParams,
  withAuthAndDBValidation,
  withAuthAndDBValidationWithPathParams,
} from '@/lib/validation-middleware'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  CreateMaterialRequestApi,
  createMaterialRequestApiSchema,
  DeleteMaterialRequestApi,
  deleteMaterialRequestApiSchema,
  getMaterialRequestApiSchema,
  updateMaterialRequestApiSchema,
  UpdateMaterialRequestApi,
  GetMaterialRequestApi,
} from '@/schemas/api/materials/material-requests'
import {
  CreateMaterialResponseApi,
  DeleteMaterialResponseApi,
  GetMaterialResponseApi,
  UpdateMaterialResponseApi,
} from '@/schemas/api/materials/material-responses'

async function createMaterial(
  request: AuthenticatedValidationRequest<CreateMaterialRequestApi['data']>
) {
  const { projectId, uploadId, ...rest } = request.validatedData

  try {
    const result = await MaterialService.createMaterial({
      data: {
        ...rest,
        projectId: new Types.ObjectId(projectId),
        uploadId: new Types.ObjectId(uploadId),
      },
    })

    return sendApiSuccessResponse<CreateMaterialResponseApi['data']>(
      {
        ...result.data,
        _id: result.data._id.toString(),
        projectId: result.data.projectId.toString(),
        uploadId: result.data.uploadId.toString(),
      },
      'Material created successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create', resource: 'material' })
  }
}

async function getMaterial(
  request: AuthenticatedRequest,
  context: ValidationContext<GetMaterialRequestApi['pathParams'], never>
) {
  try {
    const { id: materialId } = await context.params

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const material = await MaterialService.getMaterial({
      data: {
        materialId: new Types.ObjectId(materialId),
      },
    })

    return sendApiSuccessResponse<GetMaterialResponseApi['data']>(
      {
        ...material.data,
        _id: material.data._id.toString(),
        projectId: material.data.projectId.toString(),
        uploadId: material.data.uploadId.toString(),
      },
      'Material fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'material' })
  }
}

async function updateMaterial(
  request: AuthenticatedValidationRequest<UpdateMaterialRequestApi['data']>,
  context: ValidationContext<UpdateMaterialRequestApi['pathParams'], never>
) {
  try {
    const { id: materialId } = await context.params
    const { updates } = request.validatedData

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const result = await MaterialService.updateMaterial({
      data: {
        materialId: new Types.ObjectId(materialId),
        updates: {
          ...updates,
          projectId: new Types.ObjectId(updates.projectId),
          uploadId: new Types.ObjectId(updates.uploadId),
        },
      },
    })

    return sendApiSuccessResponse<UpdateMaterialResponseApi['data']>(
      {
        ...result.data,
        _id: result.data._id.toString(),
        projectId: result.data.projectId.toString(),
        uploadId: result.data.uploadId.toString(),
      },
      'Material updated successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update', resource: 'material' })
  }
}

async function deleteMaterial(
  request: AuthenticatedRequest,
  context: ValidationContext<DeleteMaterialRequestApi['pathParams'], never>
) {
  try {
    const { id: materialId } = await context.params

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const result = await MaterialService.deleteMaterial({
      data: {
        materialId: new Types.ObjectId(materialId),
      },
    })

    return sendApiSuccessResponse<DeleteMaterialResponseApi['data']>(
      {
        ...result.data,
        _id: result.data._id.toString(),
        projectId: result.data.projectId.toString(),
        uploadId: result.data.uploadId.toString(),
      },
      'Material deleted successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'material' })
  }
}

export const POST = withAuthAndDBValidation({
  dataSchema: createMaterialRequestApiSchema.shape.data,
  handler: createMaterial,
  options: {
    method: 'json',
  },
})
export const GET = withAuthAndDBPathParams({
  pathParamsSchema: getMaterialRequestApiSchema.shape.pathParams,
  handler: getMaterial,
})
export const PUT = withAuthAndDBValidationWithPathParams({
  dataSchema: updateMaterialRequestApiSchema.shape.data,
  pathParamsSchema: updateMaterialRequestApiSchema.shape.pathParams,
  handler: updateMaterial,
  options: {
    method: 'json',
  },
})
export const DELETE = withAuthAndDBPathParams({
  pathParamsSchema: deleteMaterialRequestApiSchema.shape.pathParams,
  handler: deleteMaterial,
})
