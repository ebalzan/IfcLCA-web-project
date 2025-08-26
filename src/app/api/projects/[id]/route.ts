import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { withAuthAndDBPathParams } from '@/lib/validation-middleware'
import { withAuthAndDBValidationWithPathParams } from '@/lib/validation-middleware'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  DeleteProjectRequestApi,
  deleteProjectRequestApiSchema,
  GetProjectRequestApi,
  getProjectRequestApiSchema,
  UpdateProjectRequestApi,
  updateProjectRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import {
  DeleteProjectResponseApi,
  GetProjectResponseApi,
  UpdateProjectResponseApi,
} from '@/schemas/api/projects/project-responses'

async function getProject(
  request: AuthenticatedRequest,
  context: ValidationContext<GetProjectRequestApi['pathParams'], never>
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await context.params

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const project = await ProjectService.getProject({
      data: { projectId: new Types.ObjectId(projectId), userId },
    })

    return sendApiSuccessResponse<GetProjectResponseApi['data']>(
      {
        ...project.data,
        _id: project.data._id.toString(),
      },
      'Project fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'project' })
  }
}

async function updateProject(
  request: AuthenticatedValidationRequest<UpdateProjectRequestApi['data']>,
  context: ValidationContext<UpdateProjectRequestApi['pathParams'], never>
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await context.params
    const { updates } = request.validatedData

    const editedProject = await ProjectService.updateProject({
      data: { projectId: new Types.ObjectId(projectId), updates, userId },
    })

    return sendApiSuccessResponse<UpdateProjectResponseApi['data']>(
      {
        ...editedProject.data,
        _id: editedProject.data._id.toString(),
      },
      'Project updated successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update', resource: 'project' })
  }
}

export async function deleteProject(
  request: AuthenticatedRequest,
  context: ValidationContext<DeleteProjectRequestApi['pathParams'], never>
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await context.params

    const result = await ProjectService.deleteProject({
      data: { projectId: new Types.ObjectId(projectId), userId },
    })

    return sendApiSuccessResponse<DeleteProjectResponseApi['data']>(
      {
        ...result.data,
        _id: result.data._id.toString(),
      },
      'Project deleted successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'project' })
  }
}

export const GET = withAuthAndDBPathParams({
  pathParamsSchema: getProjectRequestApiSchema.shape.pathParams,
  handler: getProject,
})
export const PATCH = withAuthAndDBValidationWithPathParams({
  dataSchema: updateProjectRequestApiSchema.shape.data,
  pathParamsSchema: updateProjectRequestApiSchema.shape.pathParams,
  handler: updateProject,
  options: {
    method: 'json',
  },
})
export const DELETE = withAuthAndDBPathParams({
  pathParamsSchema: deleteProjectRequestApiSchema.shape.pathParams,
  handler: deleteProject,
})
