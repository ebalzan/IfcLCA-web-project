import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { withAuthAndDBValidation } from '@/lib/validation-middleware'
import { AuthenticatedValidationRequest } from '@/lib/validation-middleware/types'
import {
  CreateProjectRequestApi,
  createProjectRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import { CreateProjectResponseApi } from '@/schemas/api/projects/project-responses'

async function createProject(
  request: AuthenticatedValidationRequest<CreateProjectRequestApi['data']>
) {
  try {
    const userId = getUserId(request)
    const { project } = request.validatedData

    const result = await ProjectService.createProject({
      data: { project, userId },
    })

    return sendApiSuccessResponse<CreateProjectResponseApi['data']>(
      {
        ...result,
        _id: result._id.toString(),
      },
      'Project created successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create', resource: 'project' })
  }
}

export const POST = withAuthAndDBValidation({
  dataSchema: createProjectRequestApiSchema.shape.data,
  handler: createProject,
  options: {
    method: 'json',
  },
})
