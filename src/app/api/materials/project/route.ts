import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import { withAuthAndDBQueryParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  GetMaterialBulkByProjectRequestApi,
  getMaterialBulkByProjectRequestApiSchema,
} from '@/schemas/api/materials/material-requests'
import { GetMaterialBulkByProjectResponseApi } from '@/schemas/api/materials/material-responses'

async function getMaterialBulkByProject(
  request: AuthenticatedRequest,
  context: ValidationContext<never, GetMaterialBulkByProjectRequestApi['query']>
) {
  try {
    const { projectId, userId, pagination } = context.query
    const { page, size } = pagination || { page: 1, size: 50 }

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const results = await MaterialService.getMaterialBulkByProject({
      data: {
        projectId: new Types.ObjectId(projectId),
        userId,
        pagination: { page, size },
      },
    })

    return sendApiSuccessResponse<GetMaterialBulkByProjectResponseApi['data']>(
      {
        materials: results.materials.map(material => ({
          ...material,
          _id: material._id.toString(),
          projectId: material.projectId.toString(),
          uploadId: material.uploadId?.toString() || '',
        })),
        pagination: {
          page,
          size,
          hasMore: results.pagination?.hasMore || false,
          totalCount: results.pagination?.totalCount || 0,
          totalPages: results.pagination?.totalPages || 0,
        },
      },
      'Materials fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'material' })
  }
}

export const GET = withAuthAndDBQueryParams({
  queryParamsSchema: getMaterialBulkByProjectRequestApiSchema.shape.query,
  handler: getMaterialBulkByProject,
})
