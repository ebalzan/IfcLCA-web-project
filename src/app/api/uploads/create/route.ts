import { Types } from 'mongoose'
import { sendApiSuccessResponse, sendApiErrorResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { parseIFCFile } from '@/lib/services/ifc/ifc-parser-client'
import { withAuthAndDBValidation } from '@/lib/validation-middleware'
import { AuthenticatedValidationRequest } from '@/lib/validation-middleware/types'
import {
  CreateUploadRequestApi,
  createUploadRequestSchemaApi,
} from '@/schemas/api/uploads/upload-requests'
import { CreateUploadResponseApi } from '@/schemas/api/uploads/upload-responses'

async function createUpload(
  request: AuthenticatedValidationRequest<CreateUploadRequestApi['data']>
) {
  try {
    const userId = getUserId(request)
    const { projectId, elements, filename } = request.validatedData

    const parsedData = await parseIFCFile({
      data: {
        filename,
        elements,
        projectId: new Types.ObjectId(projectId),
        userId,
      },
    })

    return sendApiSuccessResponse<CreateUploadResponseApi['data']>(
      {
        uploadId: parsedData.data.uploadId.toString(),
        projectId,
        _count: {
          elements: parsedData.data._count.elements,
          matchedMaterials: parsedData.data._count.matchedMaterials,
          unmatchedMaterials: parsedData.data._count.unmatchedMaterials,
        },
        shouldRedirectToLibrary: parsedData.data.shouldRedirectToLibrary,
      },
      'IFC file processed successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'process', resource: 'Parsed IFC' })
  }
}

export const POST = withAuthAndDBValidation({
  dataSchema: createUploadRequestSchemaApi.shape.data,
  handler: createUpload,
  options: {
    method: 'json',
  },
})
