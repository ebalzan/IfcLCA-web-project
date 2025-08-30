import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'
import { withAuthAndDBPathAndQueryParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  GetMaterialBulkByUserRequestApi,
  getMaterialBulkByUserRequestApiSchema,
} from '@/schemas/api/materials/material-requests'
import { GetMaterialBulkByUserResponseApi } from '@/schemas/api/materials/material-responses'

async function getMaterialBulkByUser(
  request: AuthenticatedRequest,
  context: ValidationContext<
    GetMaterialBulkByUserRequestApi['pathParams'],
    GetMaterialBulkByUserRequestApi['query']
  >
) {
  try {
    const { id: userId } = await context.params
    const { pagination } = context.query
    const { page, size } = pagination || { page: 1, size: 50 }

    const materials = await MaterialService.getMaterialBulkByUser({
      data: { userId, pagination: { page, size } },
    })

    return sendApiSuccessResponse<GetMaterialBulkByUserResponseApi['data']>(
      {
        materials: materials.materials.map(material => ({
          ...material,
          _id: material._id.toString(),
          projectId: material.projectId.toString(),
          uploadId: material.uploadId.toString(),
        })),
        pagination: {
          size,
          page,
          hasMore: materials.pagination?.hasMore || false,
          totalCount: materials.pagination?.totalCount || 0,
          totalPages: materials.pagination?.totalPages || 0,
        },
      },
      'Materials fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'material' })
  }
}

export const GET = withAuthAndDBPathAndQueryParams({
  pathParamsSchema: getMaterialBulkByUserRequestApiSchema.shape.pathParams,
  queryParamsSchema: getMaterialBulkByUserRequestApiSchema.shape.query,
  handler: getMaterialBulkByUser,
})
