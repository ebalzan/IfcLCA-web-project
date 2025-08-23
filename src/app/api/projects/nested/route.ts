import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDB } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { GetProjectWithNestedDataBulkResponseApi } from '@/schemas/api/projects/project-responses'

async function getProjectWithNestedDataBulk(request: AuthenticatedRequest) {
  try {
    const userId = getUserId(request)

    const projectBulk = await ProjectService.getProjectWithNestedDataBulk({
      data: { userId, pagination: { page: 1, size: 10 } },
    })
    const { projects, pagination } = projectBulk.data

    return sendApiSuccessResponse<GetProjectWithNestedDataBulkResponseApi['data']>(
      {
        projects: projects.map(project => ({
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
        pagination,
      },
      'Projects fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'project' })
  }
}

export const GET = withAuthAndDB(getProjectWithNestedDataBulk)
