import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { withAuthAndDBQueryParams, withAuthAndDBValidation } from '@/lib/validation-middleware'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  CreateProjectBulkRequestApi,
  createProjectBulkRequestApiSchema,
  DeleteProjectBulkRequestApi,
  deleteProjectBulkRequestApiSchema,
  GetProjectBulkRequestApi,
  getProjectBulkRequestApiSchema,
  UpdateProjectBulkRequestApi,
  updateProjectBulkRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import {
  CreateProjectBulkResponseApi,
  DeleteProjectBulkResponseApi,
  GetProjectBulkResponseApi,
  UpdateProjectBulkResponseApi,
} from '@/schemas/api/projects/project-responses'

async function createProjectBulk(
  request: AuthenticatedValidationRequest<CreateProjectBulkRequestApi['data']>
) {
  try {
    const userId = getUserId(request)
    const { projects } = request.validatedData

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

async function getProjectBulk(
  request: AuthenticatedRequest,
  context: ValidationContext<never, GetProjectBulkRequestApi['query']>
) {
  try {
    const userId = getUserId(request)
    const { pagination } = context.query
    const { page, size } = pagination

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
  request: AuthenticatedValidationRequest<UpdateProjectBulkRequestApi['data']>
) {
  try {
    const userId = getUserId(request)
    const { projectIds, updates } = request.validatedData

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
  request: AuthenticatedValidationRequest<DeleteProjectBulkRequestApi['data']>
) {
  try {
    const userId = getUserId(request)
    const { projectIds } = request.validatedData

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

export const POST = withAuthAndDBValidation({
  dataSchema: createProjectBulkRequestApiSchema.shape.data,
  handler: createProjectBulk,
  options: {
    method: 'json',
  },
})
export const GET = withAuthAndDBQueryParams({
  queryParamsSchema: getProjectBulkRequestApiSchema.shape.query,
  handler: getProjectBulk,
})
export const PUT = withAuthAndDBValidation({
  dataSchema: updateProjectBulkRequestApiSchema.shape.data,
  handler: updateProjectBulk,
  options: {
    method: 'json',
  },
})
export const DELETE = withAuthAndDBValidation({
  dataSchema: deleteProjectBulkRequestApiSchema.shape.data,
  handler: deleteProjectBulk,
  options: {
    method: 'json',
  },
})
