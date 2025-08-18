import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { parseIFCFile } from '@/lib/services/ifc/ifc-parser-client'
import { UploadService } from '@/lib/services/upload-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import { ParseIFCFileRequestClient, parseIFCFileRequestClientSchema } from '@/schemas/api/ifc'
import {
  DeleteUploadRequest,
  deleteUploadRequestSchema,
} from '@/schemas/api/uploads/upload-requests'

async function createUpload(request: AuthenticatedValidationRequest<ParseIFCFileRequestClient>) {
  try {
    const userId = getUserId(request)
    const { projectId, file } = request.validatedData.data

    console.log('INFO#######', request.validatedData.data)

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

export const POST = withAuthAndValidation(parseIFCFileRequestClientSchema, createUpload, {
  method: 'formData',
})
export const DELETE = withAuthAndValidation(deleteUploadRequestSchema, deleteUpload, {
  method: 'json',
})
