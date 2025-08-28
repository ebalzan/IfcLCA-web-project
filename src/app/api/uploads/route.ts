import { Types } from 'mongoose'
import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId } from '@/lib/api-middleware'
import { UploadService } from '@/lib/services/upload-service'
import {
  withAuthAndDBValidation,
  withAuthAndDBValidationWithQueryParams,
} from '@/lib/validation-middleware'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  DeleteUploadBulkRequestApi,
  deleteUploadBulkRequestSchemaApi,
  GetUploadBulkRequestApi,
  getUploadBulkRequestSchemaApi,
  UpdateUploadBulkRequestApi,
  updateUploadBulkRequestSchemaApi,
} from '@/schemas/api/uploads/upload-requests'

async function getUploadBulk(
  request: AuthenticatedRequest,
  context: ValidationContext<never, GetUploadBulkRequestApi['query']>
) {
  try {
    const { uploadIds, pagination } = context.query
    const { page, size } = pagination || { page: 1, size: 50 }

    if (!uploadIds.every(id => Types.ObjectId.isValid(id))) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const uploads = await UploadService.getUploadBulk({
      data: {
        uploadIds: uploadIds.map(id => new Types.ObjectId(id)),
        pagination: { size, page },
      },
    })

    return sendApiSuccessResponse(uploads, 'Uploads fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'get', resource: 'Uploads' })
  }
}

async function updateUploadBulk(
  request: AuthenticatedValidationRequest<UpdateUploadBulkRequestApi['data']>
) {
  try {
    const { uploadIds, updates } = request.validatedData

    if (!uploadIds.every(id => Types.ObjectId.isValid(id))) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const result = await UploadService.updateUploadBulk({
      data: { uploadIds: uploadIds.map(id => new Types.ObjectId(id)), updates },
    })
    return sendApiSuccessResponse(result, 'Uploads updated successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update bulk', resource: 'Uploads' })
  }
}

async function deleteUploadBulk(
  request: AuthenticatedValidationRequest<DeleteUploadBulkRequestApi['data']>
) {
  try {
    const { uploadIds } = request.validatedData

    if (!uploadIds.every(id => Types.ObjectId.isValid(id))) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const result = await UploadService.deleteUploadBulk({
      data: { uploadIds: uploadIds.map(id => new Types.ObjectId(id)) },
    })
    return sendApiSuccessResponse(result, 'Uploads deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete bulk', resource: 'Uploads' })
  }
}

export const GET = withAuthAndDBValidationWithQueryParams({
  dataSchema: getUploadBulkRequestSchemaApi.shape.data,
  queryParamsSchema: getUploadBulkRequestSchemaApi.shape.query,
  handler: getUploadBulk,
  options: {
    method: 'json',
  },
})
export const PUT = withAuthAndDBValidation({
  dataSchema: updateUploadBulkRequestSchemaApi.shape.data,
  handler: updateUploadBulk,
  options: {
    method: 'json',
  },
})
export const DELETE = withAuthAndDBValidation({
  dataSchema: deleteUploadBulkRequestSchemaApi.shape.data,
  handler: deleteUploadBulk,
  options: {
    method: 'json',
  },
})
