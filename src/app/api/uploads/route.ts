import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { parseIFCFile } from '@/lib/services/ifc/ifc-parser-client'
import { UploadService } from '@/lib/services/upload-service'
import {
  AuthenticatedValidationRequest,
  validateFileUpload,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { ifcFileValidationSchema } from '@/schemas/api/general'
import { ParseIFCFileRequest, parseIFCFileRequestSchema } from '@/schemas/api/ifc'
import {
  DeleteUploadRequest,
  deleteUploadRequestSchema,
} from '@/schemas/api/uploads/upload-requests'

async function createUpload(request: AuthenticatedValidationRequest<ParseIFCFileRequest>) {
  try {
    const userId = getUserId(request)
    const validationResponse = await validateFileUpload(ifcFileValidationSchema, request)
    if (!validationResponse.success) {
      return validationResponse.error
    }
    const { file } = validationResponse.data
    const { projectId } = request.validatedData.data

    const uploadResult = await parseIFCFile({
      data: {
        file,
        projectId,
        userId,
      },
    })

    return sendApiSuccessResponse(uploadResult.data, 'Upload created successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create', resource: 'Upload' })
  }
}

async function deleteUpload(request: AuthenticatedValidationRequest<DeleteUploadRequest>) {
  try {
    const { uploadId, projectId } = request.validatedData.data

    const result = await UploadService.deleteUpload({
      data: { uploadId, projectId },
    })

    return sendApiSuccessResponse(result.data, 'Upload deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'Upload' })
  }
}

export const POST = withAuthAndValidation(parseIFCFileRequestSchema, createUpload)
export const DELETE = withAuthAndValidation(deleteUploadRequestSchema, deleteUpload)
