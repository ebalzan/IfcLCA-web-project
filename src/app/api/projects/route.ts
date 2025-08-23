import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDB } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import {
  AuthenticatedValidationRequest,
  validateQueryParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import {
  CreateProjectBulkRequestApi,
  createProjectBulkRequestApiSchema,
  DeleteProjectBulkRequestApi,
  deleteProjectBulkRequestApiSchema,
  UpdateProjectBulkRequestApi,
  updateProjectBulkRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import {
  CreateProjectBulkResponseApi,
  DeleteProjectBulkResponseApi,
  GetProjectBulkResponseApi,
  UpdateProjectBulkResponseApi,
} from '@/schemas/api/projects/project-responses'
import { paginationRequestSchema } from '@/schemas/general'

async function createProjectBulk(
  request: AuthenticatedValidationRequest<CreateProjectBulkRequestApi>
) {
  try {
    const userId = getUserId(request)
    const { projects } = request.validatedData.data

    const result = await ProjectService.createProjectBulk({
      data: { projects, userId },
    })

    return sendApiSuccessResponse<CreateProjectBulkResponseApi['data']>(
      result.data.map(project => ({
        ...project,
        _id: project._id.toString(),
      })),
      'Projects created successfully',
      request
    )
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
      data: { userId, pagination: { page, size } },
    })

    return sendApiSuccessResponse<GetProjectBulkResponseApi['data']>(
      {
        projects: projects.data.projects.map(project => ({
          ...project,
          _id: project._id.toString(),
        })),
        pagination: projects.data.pagination,
      },
      'Projects fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'projects' })
  }
}

async function updateProjectBulk(
  request: AuthenticatedValidationRequest<UpdateProjectBulkRequestApi>
) {
  try {
    const userId = getUserId(request)
    const { projectIds, updates } = request.validatedData.data

    const result = await ProjectService.updateProjectBulk({
      data: { projectIds: projectIds.map(id => new Types.ObjectId(id)), updates, userId },
    })

    return sendApiSuccessResponse<UpdateProjectBulkResponseApi['data']>(
      result.data.map(project => ({
        ...project,
        _id: project._id.toString(),
      })),
      'Projects updated successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'update bulk', resource: 'project' })
  }
}

async function deleteProjectBulk(
  request: AuthenticatedValidationRequest<DeleteProjectBulkRequestApi>
) {
  try {
    const userId = getUserId(request)
    const { projectIds } = request.validatedData.data

    const result = await ProjectService.deleteProjectBulk({
      data: { projectIds: projectIds.map(id => new Types.ObjectId(id)), userId },
    })

    return sendApiSuccessResponse<DeleteProjectBulkResponseApi['data']>(
      result.data.map(project => ({
        ...project,
        _id: project._id.toString(),
      })),
      'Projects deleted successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'delete bulk', resource: 'project' })
  }
}

export const POST = withAuthAndValidation(createProjectBulkRequestApiSchema, createProjectBulk, {
  method: 'json',
})
export const GET = withAuthAndDB(getProjectBulk)
export const PUT = withAuthAndValidation(updateProjectBulkRequestApiSchema, updateProjectBulk, {
  method: 'json',
})
export const DELETE = withAuthAndValidation(deleteProjectBulkRequestApiSchema, deleteProjectBulk, {
  method: 'json',
})
