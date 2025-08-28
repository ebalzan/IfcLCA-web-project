import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { withAuthAndDBPathAndQueryParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  GetProjectBulkByUserRequestApi,
  getProjectBulkByUserRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import { GetProjectBulkResponseApi } from '@/schemas/api/projects/project-responses'

async function getProjectBulkByUser(
  request: AuthenticatedRequest,
  context: ValidationContext<
    GetProjectBulkByUserRequestApi['pathParams'],
    GetProjectBulkByUserRequestApi['query']
  >
) {
  try {
    const { id: userId } = await context.params
    const { pagination } = context.query
    const { page, size } = pagination || { page: 1, size: 50 }

    const projects = await ProjectService.getProjectBulkByUser({
      data: {
        userId,
        pagination: { page, size },
      },
    })

    return sendApiSuccessResponse<GetProjectBulkResponseApi['data']>(
      {
        projects: projects.projects.map(project => ({
          ...project,
          _id: project._id.toString(),
        })),
        pagination: {
          size,
          page,
          hasMore: projects.pagination?.hasMore || false,
          totalCount: projects.pagination?.totalCount || 0,
          totalPages: projects.pagination?.totalPages || 0,
        },
      },
      'Projects fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'projects' })
  }
}

export const GET = withAuthAndDBPathAndQueryParams({
  pathParamsSchema: getProjectBulkByUserRequestApiSchema.shape.pathParams,
  queryParamsSchema: getProjectBulkByUserRequestApiSchema.shape.query,
  handler: getProjectBulkByUser,
})
