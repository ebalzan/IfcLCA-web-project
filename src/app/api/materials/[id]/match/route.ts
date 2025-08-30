import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import { withAuthAndDBValidationWithPathParams } from '@/lib/validation-middleware'
import {
  AuthenticatedValidationRequest,
  ValidationContext,
} from '@/lib/validation-middleware/types'
import {
  CreateEC3MatchRequestApi,
  createEC3MatchRequestApiSchema,
} from '@/schemas/api/materials/material-requests'
import { CreateEC3MatchResponseApi } from '@/schemas/api/materials/material-responses'

async function createEC3Match(
  request: AuthenticatedValidationRequest<CreateEC3MatchRequestApi['data']>,
  context: ValidationContext<CreateEC3MatchRequestApi['pathParams'], never>
) {
  try {
    const { updates } = request.validatedData
    const { id: materialId } = await context.params

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const result = await MaterialService.createEC3Match({
      data: {
        materialId: new Types.ObjectId(materialId),
        updates,
      },
    })

    if (!result) {
      return sendApiErrorResponse(new Error('Failed to match material with EC3 product'), request, {
        operation: 'match',
        resource: 'material',
      })
    }

    return sendApiSuccessResponse<CreateEC3MatchResponseApi['data']>(
      {
        ...result,
        _id: result._id.toString(),
        materialId: result.materialId.toString(),
      },
      'Material matched with EC3 product successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'match', resource: 'material' })
  }
}

export const POST = withAuthAndDBValidationWithPathParams({
  dataSchema: createEC3MatchRequestApiSchema.shape.data,
  pathParamsSchema: createEC3MatchRequestApiSchema.shape.pathParams,
  handler: createEC3Match,
  options: {
    method: 'json',
  },
})
