import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
  withAuthAndValidationWithParams,
} from '@/lib/validation-middleware'
import { IdParamSchema, idParamSchema } from '@/schemas/api/general'
import {
  CreateMaterialRequest,
  createMaterialRequestSchema,
  deleteMaterialRequestSchema,
  DeleteMaterialRequest,
  GetMaterialRequest,
  getMaterialRequestSchema,
  UpdateMaterialRequest,
  updateMaterialRequestSchema,
} from '@/schemas/api/materials/material-requests'

async function createMaterial(request: AuthenticatedValidationRequest<CreateMaterialRequest>) {
  const { data } = request.validatedData

  try {
    const result = await MaterialService.createMaterial({
      data,
    })

    return sendApiSuccessResponse(result.data, 'Material created successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create', resource: 'material' })
  }
}

async function getMaterial(
  request: AuthenticatedValidationRequest<GetMaterialRequest>,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.pathParams)
    const { projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const material = await MaterialService.getMaterial({
      data: { materialId: new Types.ObjectId(materialId), projectId },
    })

    return sendApiSuccessResponse(material.data, 'Material fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'material' })
  }
}

async function updateMaterial(
  request: AuthenticatedValidationRequest<UpdateMaterialRequest>,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.pathParams)
    const { updates, projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const result = await MaterialService.updateMaterial({
      data: {
        materialId: new Types.ObjectId(materialId),
        updates,
        projectId,
      },
    })

    return sendApiSuccessResponse(result.data, 'Material updated successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update', resource: 'material' })
  }
}

async function deleteMaterial(
  request: AuthenticatedValidationRequest<DeleteMaterialRequest>,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.pathParams)
    const { projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const result = await MaterialService.deleteMaterial({
      data: { materialId: new Types.ObjectId(materialId), projectId },
    })

    return sendApiSuccessResponse(result.data, 'Material deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'material' })
  }
}

export const POST = withAuthAndValidation(createMaterialRequestSchema, createMaterial)
export const GET = withAuthAndValidationWithParams(getMaterialRequestSchema, getMaterial)
export const PUT = withAuthAndValidationWithParams(updateMaterialRequestSchema, updateMaterial)
export const DELETE = withAuthAndValidationWithParams(deleteMaterialRequestSchema, deleteMaterial)
