import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { UploadService } from '@/lib/services/upload-service'
import { withAuthAndDBQueryParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  GetUploadBulkByProjectRequestApi,
  getUploadBulkByProjectRequestSchemaApi,
} from '@/schemas/api/uploads/upload-requests'

async function getUploadBulkByProject(
  request: AuthenticatedRequest,
  context: ValidationContext<never, GetUploadBulkByProjectRequestApi['query']>
) {
  try {
    const { projectId, pagination } = context.query
    const { page, size } = pagination || { page: 1, size: 50 }

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const uploads = await UploadService.getUploadBulkByProject({
      data: { projectId: new Types.ObjectId(projectId), pagination: { page, size } },
    })

    return sendApiSuccessResponse(uploads, 'Uploads fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'get', resource: 'Uploads' })
  }
}

export const GET = withAuthAndDBQueryParams({
  queryParamsSchema: getUploadBulkByProjectRequestSchemaApi.shape.query,
  handler: getUploadBulkByProject,
})
