import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDBParams } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidationWithParams,
} from '@/lib/validation-middleware'
import {
  UpdateProjectRequestApi,
  updateProjectRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import {
  DeleteProjectResponseApi,
  GetProjectResponseApi,
  UpdateProjectResponseApi,
} from '@/schemas/api/projects/project-responses'
import { idParamSchema, IdParamSchema } from '@/schemas/general'

async function getProject(
  request: AuthenticatedRequest,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await validatePathParams(idParamSchema, context.params)

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
  request: AuthenticatedValidationRequest<UpdateProjectRequestApi>,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await validatePathParams(idParamSchema, context.params)
    const { updates } = request.validatedData.data

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
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await validatePathParams(idParamSchema, context.params)

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

export const GET = withAuthAndDBParams(getProject)
export const PATCH = withAuthAndValidationWithParams(updateProjectRequestApiSchema, updateProject, {
  method: 'json',
})
export const DELETE = withAuthAndDBParams(deleteProject)
