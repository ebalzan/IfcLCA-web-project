import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { UploadService } from '@/lib/services/upload-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidationWithParams,
} from '@/lib/validation-middleware'
import { IdParamSchema, idParamSchema } from '@/schemas/api/general'
import {
  DeleteUploadRequest,
  deleteUploadRequestSchema,
  GetUploadRequest,
  getUploadRequestSchema,
  UpdateUploadRequest,
  updateUploadRequestSchema,
} from '@/schemas/api/uploads/upload-requests'

async function getUpload(
  request: AuthenticatedValidationRequest<GetUploadRequest>,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const { id: uploadId } = await validatePathParams(idParamSchema, context.params)
    const { projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(uploadId)) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const upload = await UploadService.getUpload({
      data: { uploadId: new Types.ObjectId(uploadId), projectId },
    })

    return sendApiSuccessResponse(upload.data, 'Upload fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'get', resource: 'upload' })
  }
}

async function updateUpload(
  request: AuthenticatedValidationRequest<UpdateUploadRequest>,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const { id: uploadId } = await validatePathParams(idParamSchema, context.params)
    const { updates, projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(uploadId)) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const result = await UploadService.updateUpload({
      data: { uploadId: new Types.ObjectId(uploadId), updates, projectId },
    })

    return sendApiSuccessResponse(result.data, 'Upload updated successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update', resource: 'Upload' })
  }
}

async function deleteUpload(
  request: AuthenticatedValidationRequest<DeleteUploadRequest>,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const { id: uploadId } = await validatePathParams(idParamSchema, context.params)
    const { projectId } = request.validatedData.data

    if (!Types.ObjectId.isValid(uploadId)) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const result = await UploadService.deleteUpload({
      data: { uploadId: new Types.ObjectId(uploadId), projectId },
    })

    return sendApiSuccessResponse(result.data, 'Upload deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'Upload' })
  }
}

export const GET = withAuthAndValidationWithParams(getUploadRequestSchema, getUpload, {
  method: 'json',
})
export const PUT = withAuthAndValidationWithParams(updateUploadRequestSchema, updateUpload, {
  method: 'json',
})
export const DELETE = withAuthAndValidationWithParams(deleteUploadRequestSchema, deleteUpload, {
  method: 'json',
})
