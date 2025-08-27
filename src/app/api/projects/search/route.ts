import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { withAuthAndDBQueryParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  SearchProjectsRequestApi,
  searchProjectsRequestSchemaApi,
  SearchProjectsResponseApi,
} from '@/schemas/api/projects/search'

async function searchProjects(
  request: AuthenticatedRequest,
  context: ValidationContext<never, SearchProjectsRequestApi['query']>
) {
  try {
    const userId = getUserId(request)
    const { name, sortBy, pagination } = context.query
    const { page, size } = pagination || { page: 1, size: 50 }

    const response = await ProjectService.searchProjects({
      data: {
        userId,
        name,
        sortBy,
        pagination: {
          page,
          size,
        },
      },
    })

    return sendApiSuccessResponse<SearchProjectsResponseApi['data']>(
      {
        projects: response.projects.map(project => ({
          ...project,
          _id: project._id.toString(),
        })),
        pagination: {
          page,
          size,
          hasMore: response.pagination?.hasMore || false,
          totalCount: response.pagination?.totalCount || 0,
          totalPages: response.pagination?.totalPages || 0,
        },
      },
      'Projects searched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'search', resource: 'project' })
  }
}

export const GET = withAuthAndDBQueryParams({
  queryParamsSchema: searchProjectsRequestSchemaApi.shape.query,
  handler: searchProjects,
})
