import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDB } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'

async function getProjectWithNestedDataBulk(request: AuthenticatedRequest) {
  try {
    const userId = getUserId(request)

    const projects = await ProjectService.getProjectWithNestedDataBulk({
      data: { projectIds: [], userId, pagination: { page: 1, size: 10 } },
    })

    return sendApiSuccessResponse(projects.data, 'Projects fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'project' })
  }
}

export const GET = withAuthAndDB(getProjectWithNestedDataBulk)
