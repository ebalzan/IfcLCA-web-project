import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { withAuthAndDBPathParams } from '@/lib/validation-middleware'
import { ValidationContext } from '@/lib/validation-middleware/types'
import {
  GetProjectWithNestedDataRequestApi,
  getProjectWithNestedDataRequestApiSchema,
} from '@/schemas/api/projects/project-requests'
import { GetProjectWithNestedDataResponseApi } from '@/schemas/api/projects/project-responses'

async function getProjectWithNestedData(
  request: AuthenticatedRequest,
  context: ValidationContext<GetProjectWithNestedDataRequestApi['pathParams'], never>
) {
  try {
    const userId = getUserId(request)
    const { id: projectId } = await context.params

    if (!Types.ObjectId.isValid(projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    const project = await ProjectService.getProjectWithNestedData({
      data: { projectId: new Types.ObjectId(projectId), userId },
    })

    return sendApiSuccessResponse<GetProjectWithNestedDataResponseApi['data']>(
      {
        ...project,
        _id: project._id.toString(),
        elements: project.elements.map(element => ({
          ...element,
          _id: element._id.toString(),
          projectId: element.projectId.toString(),
          uploadId: element.uploadId?.toString() || null,
          materialLayers: element.materialLayers.map(layer => ({
            ...layer,
            materialId: layer.materialId?.toString() || null,
          })),
          materialRefs: element.materialRefs.map(material => ({
            ...material,
            _id: material._id.toString(),
            projectId: material.projectId.toString(),
            uploadId: material.uploadId?.toString() || null,
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
      } as GetProjectWithNestedDataResponseApi['data'],
      'Project fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'project' })
  }
}

export const GET = withAuthAndDBPathParams({
  pathParamsSchema: getProjectWithNestedDataRequestApiSchema.shape.pathParams,
  handler: getProjectWithNestedData,
})
