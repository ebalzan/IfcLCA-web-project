import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { UploadService } from '@/lib/services/upload-service'
import {
  AuthenticatedValidationRequest,
  validateFileUpload,
  validatePathParams,
  withAuthAndValidation,
  withAuthAndValidationWithParams,
} from '@/lib/validation-middleware'
import { IdParamSchema, idParamSchema, ifcFileValidationSchema } from '@/schemas/api/general'
import {
  CreateUploadRequest,
  createUploadRequestSchema,
  DeleteUploadRequest,
  deleteUploadRequestSchema,
  GetUploadRequest,
  getUploadRequestSchema,
  UpdateUploadRequest,
  updateUploadRequestSchema,
} from '@/schemas/api/uploads/upload-requests'

async function createUpload(request: AuthenticatedValidationRequest<CreateUploadRequest>) {
  try {
    // 1. Validation
    const userId = getUserId(request)
    const validationResponse = await validateFileUpload(ifcFileValidationSchema, request)
    if (!validationResponse.success) {
      return validationResponse.error
    }
    const { file } = validationResponse.data
    const { projectId } = request.validatedData.data

    // 2. Call service for business logic
    const upload = await UploadService.createUploadWithIFCProcessing({
      data: {
        file,
        projectId,
        userId,
      },
    })

    return sendApiSuccessResponse(upload.data, 'Upload created successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create', resource: 'Upload' })
  }
}

async function getUpload(
  request: AuthenticatedValidationRequest<GetUploadRequest>,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: uploadId } = await validatePathParams(idParamSchema, context.pathParams)
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
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: uploadId } = await validatePathParams(idParamSchema, context.pathParams)
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
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: uploadId } = await validatePathParams(idParamSchema, context.pathParams)
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
export const POST = withAuthAndValidation(createUploadRequestSchema, createUpload)
export const GET = withAuthAndValidationWithParams(getUploadRequestSchema, getUpload)
export const PUT = withAuthAndValidationWithParams(updateUploadRequestSchema, updateUpload)
export const DELETE = withAuthAndValidationWithParams(deleteUploadRequestSchema, deleteUpload)
