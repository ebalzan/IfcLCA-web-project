import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { AuthenticatedRequest, getUserId, withAuthAndDBParams } from '@/lib/api-middleware'
import { ProjectService } from '@/lib/services/project-service'
import { validatePathParams } from '@/lib/validation-middleware'
import { GetProjectWithNestedDataResponseApi } from '@/schemas/api/projects/project-responses'
import { idParamSchema, IdParamSchema } from '@/schemas/general'

async function getProjectWithNestedData(
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

    const project = await ProjectService.getProjectWithNestedData({
      data: { projectId: new Types.ObjectId(projectId), userId },
    })

    return sendApiSuccessResponse<GetProjectWithNestedDataResponseApi['data']>(
      {
        ...project.data,
        _id: project.data._id.toString(),
        elements: project.data.elements.map(element => ({
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
        materials: project.data.materials.map(material => ({
          ...material,
          _id: material._id.toString(),
          projectId: material.projectId.toString(),
          uploadId: material.uploadId?.toString() || null,
        })),
        uploads: project.data.uploads.map(upload => ({
          ...upload,
          _id: upload._id.toString(),
          projectId: upload.projectId.toString(),
        })),
        totalIndicators: project.data.totalIndicators,
        _count: project.data._count,
      } as GetProjectWithNestedDataResponseApi['data'],
      'Project fetched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'fetch', resource: 'project' })
  }
}

export const GET = withAuthAndDBParams(getProjectWithNestedData)
