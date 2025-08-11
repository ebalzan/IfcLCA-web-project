import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDBParams } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
  withAuthAndValidationParams,
} from '@/lib/validation-middleware'
import { idParamSchema, IdParamSchema } from '@/schemas/api/general'
import {
  CreateProjectRequest,
  createProjectRequestSchema,
  UpdateProjectRequest,
  updateProjectRequestSchema,
} from '@/schemas/api/projects/project-requests'

export const runtime = 'nodejs'

async function createProject(request: AuthenticatedValidationRequest<CreateProjectRequest>) {
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

async function getProject(
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

    const project = await ProjectService.getProject({
      data: { projectId: new Types.ObjectId(projectId), userId },
    })

    return sendApiSuccessResponse(project.data, 'Project fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'project' })
  }
}

async function updateProject(
  request: AuthenticatedValidationRequest<UpdateProjectRequest>,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await validatePathParams(idParamSchema, context.pathParams)
    const { updates } = request.validatedData.data

    const editedProject = await ProjectService.updateProject({
      data: { projectId: new Types.ObjectId(projectId), updates, userId },
    })

    return sendApiSuccessResponse(editedProject.data, 'Project updated successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update', resource: 'project' })
  }
}

export async function deleteProject(
  request: AuthenticatedRequest,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await validatePathParams(idParamSchema, context.pathParams)

    const result = await ProjectService.deleteProject({
      data: { projectId: new Types.ObjectId(projectId), userId },
    })

    return sendApiSuccessResponse(result.data, 'Project deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete', resource: 'project' })
  }
}

export const POST = withAuthAndValidation(createProjectRequestSchema, createProject)
export const GET = withAuthAndDBParams(getProject)
export const PUT = withAuthAndValidationParams(updateProjectRequestSchema, updateProject)
export const DELETE = withAuthAndDBParams(deleteProject)
