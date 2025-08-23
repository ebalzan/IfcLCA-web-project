import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDB } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { validateQueryParams } from '@/lib/validation-middleware'
import { searchQuerySchema } from '@/schemas/services/projects/search'

async function searchProjects(request: AuthenticatedRequest) {
  try {
    const userId = getUserId(request)
    const queryParams = validateQueryParams(searchQuerySchema, request)
    const { q: searchTerm, all, dateFrom, dateTo, sortBy, sortOrder, page, size } = queryParams

    const response = await ProjectService.searchProjects({
      data: {
        userId,
        searchTerm,
        all,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
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

export const GET = withAuthAndDB(searchProjects)
