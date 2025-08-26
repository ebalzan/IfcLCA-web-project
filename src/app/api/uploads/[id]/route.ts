import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { UploadService } from '@/lib/services/upload-service'
import { IdParamSchema, idParamSchema } from '@/schemas/general'
import {
  DeleteUploadRequest,
  deleteUploadRequestSchema,
  GetUploadRequest,
  getUploadRequestSchema,
  UpdateUploadRequest,
  updateUploadRequestSchema,
} from '@/schemas/services/uploads/upload-requests'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  withAuthAndDBPathParams,
  withAuthAndDBValidationWithPathParams,
} from '@/lib/validation-middleware'

async function getUpload(
  request: AuthenticatedValidationRequest<GetUploadRequest>,
  context: ValidationContext<{ id: string }, never>
) {
  try {
    const { projectId } = request.validatedData.data
    const { id: uploadId } = await context.params

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
  context: ValidationContext<{ id: string }, never>
) {
  try {
    const { updates, projectId } = request.validatedData.data
    const { id: uploadId } = await context.params

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
  context: ValidationContext<{ id: string }, never>
) {
  try {
    const { projectId } = request.validatedData.data
    const { id: uploadId } = await context.params

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

export const GET = withAuthAndDBValidationWithPathParams({
  dataSchema: getUploadRequestSchema.shape.data,
  pathParamsSchema: idParamSchema,
  handler: getUpload,
})
export const PUT = withAuthAndDBPathParams({
  dataSchema: updateUploadRequestSchema.shape.data,
  pathParamsSchema: idParamSchema,
  handler: updateUpload,
  options: {
    method: 'json',
  },
})
export const DELETE = withAuthAndDBPathParams({
  dataSchema: deleteUploadRequestSchema.shape.data,
  pathParamsSchema: idParamSchema,
  handler: deleteUpload,
  options: {
    method: 'json',
  },
})
