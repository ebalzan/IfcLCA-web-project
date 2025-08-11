import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import {
  CreateEC3BulkMatchRequest,
  createEC3BulkMatchRequestSchema,
} from '@/schemas/api/materials/materialRequests'

async function createEC3BulkMatch(
  request: AuthenticatedValidationRequest<CreateEC3BulkMatchRequest>
) {
  try {
    const { materialIds, updates } = request.validatedData.data

    const results = await MaterialService.createEC3BulkMatch({
      data: {
        materialIds,
        updates,
      },
    })

    return sendApiSuccessResponse(results.data, 'Materials matched successfully', request)
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'bulk match', resource: 'materials' })
  }
}

export const POST = withAuthAndValidation(createEC3BulkMatchRequestSchema, createEC3BulkMatch)
