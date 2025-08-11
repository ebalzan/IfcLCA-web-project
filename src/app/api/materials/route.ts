import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { IdParamSchema, idParamSchema } from '@/schemas/api/general'
import {
  CreateMaterialBulkRequest,
  createMaterialBulkRequestSchema,
  DeleteMaterialBulkRequest,
  deleteMaterialBulkRequestSchema,
  GetMaterialBulkRequest,
  getMaterialBulkRequestSchema,
  UpdateMaterialBulkRequest,
  updateMaterialBulkRequestSchema,
} from '@/schemas/api/materials/materialRequests'

async function createMaterialBulk(
  request: AuthenticatedValidationRequest<CreateMaterialBulkRequest>
) {
  try {
    const { materials } = request.validatedData.data

    const results = await MaterialService.createMaterialBulk({
      data: { materials },
    })

    return sendApiSuccessResponse(results.data, 'Materials created successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create bulk', resource: 'material' })
  }
}

async function getMaterialBulk(
  request: AuthenticatedValidationRequest<GetMaterialBulkRequest>,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.params)

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const material = await MaterialService.getMaterialBulk({
      data: { materialIds: [new Types.ObjectId(materialId)] },
    })

    return sendApiSuccessResponse(material.data, 'Material fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'material' })
  }
}

async function updateMaterialBulk(
  request: AuthenticatedValidationRequest<UpdateMaterialBulkRequest>
) {
  try {
    const { materialIds, updates } = request.validatedData.data

    const results = await MaterialService.updateMaterialBulk({
      data: { materialIds, updates },
    })

    return sendApiSuccessResponse(results.data, 'Materials updated successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update bulk', resource: 'material' })
  }
}

async function deleteMaterialBulk(
  request: AuthenticatedValidationRequest<DeleteMaterialBulkRequest>
) {
  try {
    const { materialIds } = request.validatedData.data

    const results = await MaterialService.deleteMaterialBulk({
      data: { materialIds },
    })

    return sendApiSuccessResponse(results.data, 'Materials deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete bulk', resource: 'material' })
  }
}

export const POST = withAuthAndValidation(createMaterialBulkRequestSchema, createMaterialBulk)
export const GET = withAuthAndValidation(getMaterialBulkRequestSchema, getMaterialBulk)
export const PUT = withAuthAndValidation(updateMaterialBulkRequestSchema, updateMaterialBulk)
export const DELETE = withAuthAndValidation(deleteMaterialBulkRequestSchema, deleteMaterialBulk)
