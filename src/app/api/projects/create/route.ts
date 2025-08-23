import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import {
  CreateProjectRequestApi,
  createProjectRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import { CreateProjectResponseApi } from '@/schemas/api/projects/project-responses'

async function createProject(request: AuthenticatedValidationRequest<CreateProjectRequestApi>) {
  try {
    const userId = getUserId(request)
    const { project } = request.validatedData.data

    const result = await ProjectService.createProject({
      data: { project, userId },
    })

    return sendApiSuccessResponse<CreateProjectResponseApi['data']>(
      {
        ...result.data,
        _id: result.data._id.toString(),
      },
      'Project created successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create', resource: 'project' })
  }
}

export const POST = withAuthAndValidation(createProjectRequestApiSchema, createProject, {
  method: 'json',
})
