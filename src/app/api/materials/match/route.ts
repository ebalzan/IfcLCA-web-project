import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import {
  CreateEC3BulkMatchRequestApi,
  createEC3BulkMatchRequestApiSchema,
} from '@/schemas/api/materials/material-requests'
import { CreateEC3BulkMatchResponseApi } from '@/schemas/api/materials/material-responses'

async function createEC3BulkMatch(
  request: AuthenticatedValidationRequest<CreateEC3BulkMatchRequestApi>
) {
  try {
    const { materialIds, updates, projectId } = request.validatedData.data

    const results = await MaterialService.createEC3BulkMatch({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
        updates: updates.map(update => ({
          ...update,
          projectId: new Types.ObjectId(projectId),
          uploadId: new Types.ObjectId(update.uploadId),
        })),
        projectId: new Types.ObjectId(projectId),
      },
    })

    return sendApiSuccessResponse<CreateEC3BulkMatchResponseApi['data']>(
      results.data.map(match => ({
        ...match,
        _id: match._id.toString(),
        materialId: match.materialId.toString(),
      })),
      'Materials matched successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'bulk match', resource: 'materials' })
  }
}

export const POST = withAuthAndValidation(createEC3BulkMatchRequestApiSchema, createEC3BulkMatch, {
  method: 'json',
})
