import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDBParams } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { validatePathParams } from '@/lib/validation-middleware'
import { idParamSchema, IdParamSchema } from '@/schemas/api/general'

async function getProjectWithNestedData(
  request: AuthenticatedRequest,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await validatePathParams(idParamSchema, context.pathParams)

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const project = await ProjectService.getProjectWithNestedData({
      data: { projectId: new Types.ObjectId(projectId), userId },
    })

    return sendApiSuccessResponse(project.data, 'Project fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'project' })
  }
}

export const GET = withAuthAndDBParams(getProjectWithNestedData)
