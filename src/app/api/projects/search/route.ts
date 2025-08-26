import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { withAuthAndDBQueryParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  SearchProjectsRequestApi,
  searchProjectsRequestSchemaApi,
} from '@/schemas/api/projects/search'

async function searchProjects(
  request: AuthenticatedRequest,
  context: ValidationContext<never, SearchProjectsRequestApi['query']>
) {
  try {
    const userId = getUserId(request)
    const { name, sortBy, pagination } = context.query
    const { page, size } = pagination

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

    return sendApiSuccessResponse(response, 'Projects searched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'search', resource: 'project' })
  }
}

export const GET = withAuthAndDBQueryParams({
  queryParamsSchema: searchProjectsRequestSchemaApi.shape.query,
  handler: searchProjects,
})
