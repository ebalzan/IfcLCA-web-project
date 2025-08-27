import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { UploadService } from '@/lib/services/upload-service'
import {
  withAuthAndDBPathParams,
  withAuthAndDBValidationWithPathParams,
} from '@/lib/validation-middleware'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  DeleteUploadRequestApi,
  deleteUploadRequestSchemaApi,
  GetUploadRequestApi,
  getUploadRequestSchemaApi,
  UpdateUploadRequestApi,
  updateUploadRequestSchemaApi,
} from '@/schemas/api/uploads/upload-requests'
import {
  DeleteUploadResponseApi,
  GetUploadResponseApi,
  UpdateUploadResponseApi,
} from '@/schemas/api/uploads/upload-responses'

async function getUpload(
  request: AuthenticatedRequest,
  context: ValidationContext<GetUploadRequestApi['pathParams'], never>
) {
  try {
    const { id: uploadId } = await context.params

    if (!Types.ObjectId.isValid(uploadId)) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const upload = await UploadService.getUpload({
      data: { uploadId: new Types.ObjectId(uploadId) },
    })

    return sendApiSuccessResponse<GetUploadResponseApi['data']>(
      {
        ...upload,
        _id: upload._id.toString(),
        projectId: upload.projectId.toString(),
      },
      'Upload fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'get', resource: 'upload' })
  }
}

async function updateUpload(
  request: AuthenticatedValidationRequest<UpdateUploadRequestApi['data']>,
  context: ValidationContext<UpdateUploadRequestApi['pathParams'], never>
) {
  try {
    const { updates } = request.validatedData
    const { id: uploadId } = await context.params

    if (!Types.ObjectId.isValid(uploadId)) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const result = await UploadService.updateUpload({
      data: { uploadId: new Types.ObjectId(uploadId), updates },
    })

    return sendApiSuccessResponse<UpdateUploadResponseApi['data']>(
      {
        ...result,
        _id: result._id.toString(),
        projectId: result.projectId.toString(),
      },
      'Upload updated successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update', resource: 'Upload' })
  }
}

async function deleteUpload(
  request: AuthenticatedRequest,
  context: ValidationContext<DeleteUploadRequestApi['pathParams'], never>
) {
  try {
    const { id: uploadId } = await context.params

    if (!Types.ObjectId.isValid(uploadId)) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const result = await UploadService.deleteUpload({
      data: { uploadId: new Types.ObjectId(uploadId) },
    })

    return sendApiSuccessResponse<DeleteUploadResponseApi['data']>(
      {
        ...result,
        _id: result._id.toString(),
        projectId: result.projectId.toString(),
      },
      'Upload deleted successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'Upload' })
  }
}

export const GET = withAuthAndDBPathParams({
  pathParamsSchema: getUploadRequestSchemaApi.shape.pathParams,
  handler: getUpload,
})
export const PUT = withAuthAndDBValidationWithPathParams({
  dataSchema: updateUploadRequestSchemaApi.shape.data,
  pathParamsSchema: updateUploadRequestSchemaApi.shape.pathParams,
  handler: updateUpload,
  options: {
    method: 'json',
  },
})
export const DELETE = withAuthAndDBPathParams({
  pathParamsSchema: deleteUploadRequestSchemaApi.shape.pathParams,
  handler: deleteUpload,
})
