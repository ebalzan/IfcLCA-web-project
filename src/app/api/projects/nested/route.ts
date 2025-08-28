import { Types } from 'mongoose'
import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { withAuthAndDBQueryParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  GetProjectWithNestedDataBulkRequestApi,
  getProjectWithNestedDataBulkRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import { GetProjectWithNestedDataBulkResponseApi } from '@/schemas/api/projects/project-responses'

async function getProjectWithNestedDataBulk(
  request: AuthenticatedRequest,
  context: ValidationContext<never, GetProjectWithNestedDataBulkRequestApi['query']>
) {
  try {
    const { projectIds, pagination } = context.query
    const { page, size } = pagination || { page: 1, size: 10 }

    if (!projectIds.every(id => Types.ObjectId.isValid(id))) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const projectBulk = await ProjectService.getProjectWithNestedDataBulk({
      data: {
        projectIds: projectIds.map(id => new Types.ObjectId(id)),
        pagination: { page, size },
      },
    })

    return sendApiSuccessResponse<GetProjectWithNestedDataBulkResponseApi['data']>(
      {
        projects: projectBulk.projects.map(project => ({
          ...project,
          _id: project._id.toString(),
          elements: project.elements.map(element => ({
            ...element,
            _id: element._id.toString(),
            projectId: element.projectId.toString(),
            uploadId: element.uploadId?.toString() || null,
            materialRefs: element.materialRefs.map(material => ({
              ...material,
              _id: material._id.toString(),
              projectId: material.projectId.toString(),
              uploadId: material.uploadId?.toString() || null,
            })),
            materialLayers: element.materialLayers.map(layer => ({
              ...layer,
              materialId: layer.materialId?.toString() || null,
            })),
          })),
          materials: project.materials.map(material => ({
            ...material,
            _id: material._id.toString(),
            projectId: material.projectId.toString(),
            uploadId: material.uploadId?.toString() || null,
          })),
          uploads: project.uploads.map(upload => ({
            ...upload,
            _id: upload._id.toString(),
            projectId: upload.projectId.toString(),
          })),
          totalIndicators: project.totalIndicators,
          _count: project._count,
        })) as GetProjectWithNestedDataBulkResponseApi['data']['projects'],
        pagination: {
          size,
          page,
          hasMore: projectBulk.pagination?.hasMore || false,
          totalCount: projectBulk.pagination?.totalCount || 0,
          totalPages: projectBulk.pagination?.totalPages || 0,
        },
      },
      'Projects fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'project' })
  }
}

export const GET = withAuthAndDBQueryParams({
  queryParamsSchema: getProjectWithNestedDataBulkRequestApiSchema.shape.query,
  handler: getProjectWithNestedDataBulk,
})
