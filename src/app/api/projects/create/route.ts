import { sendApiSuccessResponse, sendApiErrorResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import {
  CreateProjectRequest,
  createProjectRequestSchema,
} from '@/schemas/api/projects/project-requests'

async function createProject(
  request: AuthenticatedValidationRequest<Omit<CreateProjectRequest, 'userId'>>
) {
  try {
    const userId = getUserId(request)
    const { project } = request.validatedData.data

    const result = await ProjectService.createProject({
      data: { project, userId },
    })

    return sendApiSuccessResponse(result.data, 'Project created successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create', resource: 'project' })
  }
}

export const POST = withAuthAndValidation(createProjectRequestSchema, createProject, {
  method: 'json',
})
