import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  validateQueryParams,
  withAuthAndValidation,
  withAuthAndValidationWithParams,
} from '@/lib/validation-middleware'
import {
  CreateMaterialRequestApi,
  createMaterialRequestApiSchema,
  DeleteMaterialRequestApi,
  deleteMaterialRequestApiSchema,
  getMaterialRequestApiSchema,
  updateMaterialRequestApiSchema,
  UpdateMaterialRequestApi,
} from '@/schemas/api/materials/material-requests'
import {
  CreateMaterialResponseApi,
  DeleteMaterialResponseApi,
  GetMaterialResponseApi,
  UpdateMaterialResponseApi,
} from '@/schemas/api/materials/material-responses'
import { IdParamSchema, idParamSchema } from '@/schemas/general'

async function createMaterial(request: AuthenticatedValidationRequest<CreateMaterialRequestApi>) {
  const { projectId, uploadId, ...rest } = request.validatedData.data

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
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.params)
    const { projectId } = validateQueryParams(getMaterialRequestApiSchema.shape.data, request)

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const material = await MaterialService.getMaterial({
      data: {
        materialId: new Types.ObjectId(materialId),
        projectId: new Types.ObjectId(projectId),
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
  request: AuthenticatedValidationRequest<UpdateMaterialRequestApi>,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.params)
    const { updates, projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const result = await MaterialService.updateMaterial({
      data: {
        materialId: new Types.ObjectId(materialId),
        updates: {
          ...updates,
          projectId: new Types.ObjectId(projectId),
          uploadId: new Types.ObjectId(updates.uploadId),
        },
        projectId: new Types.ObjectId(projectId),
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
  request: AuthenticatedValidationRequest<DeleteMaterialRequestApi>,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.params)
    const { projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const result = await MaterialService.deleteMaterial({
      data: {
        materialId: new Types.ObjectId(materialId),
        projectId: new Types.ObjectId(projectId),
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

export const POST = withAuthAndValidation(createMaterialRequestApiSchema, createMaterial, {
  method: 'json',
})
export const GET = withAuthAndDBParams(getMaterial)
export const PUT = withAuthAndValidationWithParams(updateMaterialRequestApiSchema, updateMaterial, {
  method: 'json',
})
export const DELETE = withAuthAndValidationWithParams(
  deleteMaterialRequestApiSchema,
  deleteMaterial,
  {
    method: 'json',
  }
)
