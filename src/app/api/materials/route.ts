import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validateQueryParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { paginationRequestSchema } from '@/schemas/api/general'
import {
  CreateMaterialBulkRequest,
  createMaterialBulkRequestSchema,
  DeleteMaterialBulkRequest,
  deleteMaterialBulkRequestSchema,
  GetMaterialBulkRequest,
  getMaterialBulkRequestSchema,
  UpdateMaterialBulkRequest,
  updateMaterialBulkRequestSchema,
} from '@/schemas/api/materials/material-requests'

async function createMaterialBulk(
  request: AuthenticatedValidationRequest<CreateMaterialBulkRequest>
) {
  try {
    const { materials, projectId } = request.validatedData.data

    const results = await MaterialService.createMaterialBulk({
      data: { materials, projectId },
    })

    return sendApiSuccessResponse(results.data, 'Materials created successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create bulk', resource: 'material' })
  }
}

async function getMaterialBulk(request: AuthenticatedValidationRequest<GetMaterialBulkRequest>) {
  try {
    const { materialIds, projectId } = request.validatedData.data
    const queryParams = validateQueryParams(paginationRequestSchema, request, {
      page: 1,
      size: 10,
    })
    const { page, size } = queryParams

    const material = await MaterialService.getMaterialBulk({
      data: { materialIds, projectId, pagination: { page, size } },
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
    const { materialIds, updates, projectId } = request.validatedData.data

    const results = await MaterialService.updateMaterialBulk({
      data: { materialIds, updates, projectId },
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
    const { materialIds, projectId } = request.validatedData.data

    const results = await MaterialService.deleteMaterialBulk({
      data: { materialIds, projectId },
    })

    return sendApiSuccessResponse(results.data, 'Materials deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete bulk', resource: 'material' })
  }
}

export const POST = withAuthAndValidation(createMaterialBulkRequestSchema, createMaterialBulk, {
  method: 'json',
})
export const GET = withAuthAndValidation(getMaterialBulkRequestSchema, getMaterialBulk, {
  method: 'json',
})
export const PUT = withAuthAndValidation(updateMaterialBulkRequestSchema, updateMaterialBulk, {
  method: 'json',
})
export const DELETE = withAuthAndValidation(deleteMaterialBulkRequestSchema, deleteMaterialBulk, {
  method: 'json',
})
