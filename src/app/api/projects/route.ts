import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDB } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import {
  AuthenticatedValidationRequest,
  validateQueryParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { paginationRequestSchema } from '@/schemas/api/general'
import {
  CreateProjectBulkRequest,
  createProjectBulkRequestSchema,
  DeleteProjectBulkRequest,
  deleteProjectBulkRequestSchema,
  UpdateProjectBulkRequest,
  updateProjectBulkRequestSchema,
} from '@/schemas/api/projects/project-requests'

async function createProjectBulk(
  request: AuthenticatedValidationRequest<CreateProjectBulkRequest>
) {
  try {
    const userId = getUserId(request)
    const { projects } = request.validatedData.data

    const result = await ProjectService.createProjectBulk({
      data: { projects, userId },
    })

    return sendApiSuccessResponse(result.data, 'Projects created successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create bulk', resource: 'project' })
  }
}

async function getProjectBulk(request: AuthenticatedRequest) {
  try {
    const userId = getUserId(request)
    const queryParams = validateQueryParams(paginationRequestSchema, request, {
      page: 1,
      size: 10,
    })
    const { page, size } = queryParams

    const projects = await ProjectService.getProjectBulk({
      data: { projectIds: [], userId, pagination: { page, size } },
    })

    return sendApiSuccessResponse(projects.data, 'Projects fetched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'projects' })
  }
}

async function updateProjectBulk(
  request: AuthenticatedValidationRequest<UpdateProjectBulkRequest>
) {
  try {
    const userId = getUserId(request)
    const { projectIds, updates } = request.validatedData.data

    const result = await ProjectService.updateProjectBulk({
      data: { projectIds, updates, userId },
    })

    return sendApiSuccessResponse(result.data, 'Projects updated successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update bulk', resource: 'project' })
  }
}

async function deleteProjectBulk(
  request: AuthenticatedValidationRequest<DeleteProjectBulkRequest>
) {
  try {
    const userId = getUserId(request)
    const { projectIds } = request.validatedData.data

    const result = await ProjectService.deleteProjectBulk({
      data: { projectIds, userId },
    })

    return sendApiSuccessResponse(result.data, 'Projects deleted successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete bulk', resource: 'project' })
  }
}

export const POST = withAuthAndValidation(createProjectBulkRequestSchema, createProjectBulk)
export const GET = withAuthAndDB(getProjectBulk)
export const PUT = withAuthAndValidation(updateProjectBulkRequestSchema, updateProjectBulk)
export const DELETE = withAuthAndValidation(deleteProjectBulkRequestSchema, deleteProjectBulk)
