import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import { withAuthAndDBValidation } from '@/lib/validation-middleware'
import { AuthenticatedValidationRequest } from '@/lib/validation-middleware/types'
import {
  CreateEC3BulkMatchRequestApi,
  createEC3BulkMatchRequestApiSchema,
} from '@/schemas/api/materials/material-requests'
import { CreateEC3BulkMatchResponseApi } from '@/schemas/api/materials/material-responses'

async function createEC3BulkMatch(
  request: AuthenticatedValidationRequest<CreateEC3BulkMatchRequestApi['data']>
) {
  try {
    const { materialIds, updates } = request.validatedData

    if (!materialIds.every(id => Types.ObjectId.isValid(id))) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        operation: 'bulk match',
        resource: 'materials',
      })
    }

    const results = await MaterialService.createEC3BulkMatch({
      data: {
        materialIds: materialIds.map(id => new Types.ObjectId(id)),
        updates,
      },
    })

    return sendApiSuccessResponse<CreateEC3BulkMatchResponseApi['data']>(
      results.map(match => ({
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

export const POST = withAuthAndDBValidation({
  dataSchema: createEC3BulkMatchRequestApiSchema.shape.data,
  handler: createEC3BulkMatch,
  options: {
    method: 'json',
  },
})
