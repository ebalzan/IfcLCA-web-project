import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
  withAuthAndValidationParams,
} from '@/lib/validation-middleware'
import { IdParamSchema, idParamSchema } from '@/schemas/api/general'
import {
  CreateMaterialRequest,
  createMaterialRequestSchema,
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
  request: AuthenticatedRequest,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.pathParams)

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const material = await MaterialService.getMaterial({
      data: { materialId: new Types.ObjectId(materialId) },
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
    const { updates } = request.validatedData.data

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

    return sendApiSuccessResponse(result.data, 'Material updated successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update', resource: 'material' })
  }
}

async function deleteMaterial(
  request: AuthenticatedRequest,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.pathParams)

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const result = await MaterialService.deleteMaterial({
      data: { materialId: new Types.ObjectId(materialId) },
    })

    return sendApiSuccessResponse(result.data, 'Material deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'material' })
  }
}

export const POST = withAuthAndValidation(createMaterialRequestSchema, createMaterial)
export const GET = withAuthAndDBParams(getMaterial)
export const PUT = withAuthAndValidationParams(updateMaterialRequestSchema, updateMaterial)
export const DELETE = withAuthAndDBParams(deleteMaterial)
