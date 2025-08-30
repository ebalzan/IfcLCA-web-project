import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import {
  withAuthAndDBPathParams,
  withAuthAndDBValidationWithPathParams,
} from '@/lib/validation-middleware'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  DeleteMaterialRequestApi,
  deleteMaterialRequestApiSchema,
  getMaterialRequestApiSchema,
  updateMaterialRequestApiSchema,
  UpdateMaterialRequestApi,
  GetMaterialRequestApi,
} from '@/schemas/api/materials/material-requests'
import {
  DeleteMaterialResponseApi,
  GetMaterialResponseApi,
  UpdateMaterialResponseApi,
} from '@/schemas/api/materials/material-responses'

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
        ...material,
        _id: material._id.toString(),
        projectId: material.projectId.toString(),
        uploadId: material.uploadId.toString(),
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
        updates,
      },
    })

    return sendApiSuccessResponse<UpdateMaterialResponseApi['data']>(
      {
        ...result,
        _id: result._id.toString(),
        projectId: result.projectId.toString(),
        uploadId: result.uploadId.toString(),
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
        ...result,
        _id: result._id.toString(),
        projectId: result.projectId.toString(),
        uploadId: result.uploadId.toString(),
      },
      'Material deleted successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'material' })
  }
}

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
