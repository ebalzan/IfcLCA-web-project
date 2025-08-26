import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import { withAuthAndDBValidationWithQueryParams } from '@/lib/validation-middleware'
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
  context: ValidationContext<never, CreateEC3MatchRequestApi['query']>
) {
  try {
    const { materialId } = context.query
    const { updates } = request.validatedData

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    if (!Types.ObjectId.isValid(updates.projectId)) {
      return sendApiErrorResponse(new Error('Invalid project ID'), request, {
        resource: 'project',
      })
    }

    if (!Types.ObjectId.isValid(updates.uploadId)) {
      return sendApiErrorResponse(new Error('Invalid upload ID'), request, {
        resource: 'upload',
      })
    }

    const result = await MaterialService.createEC3Match({
      data: {
        materialId: new Types.ObjectId(materialId),
        updates: {
          ...updates,
          projectId: new Types.ObjectId(updates.projectId),
          uploadId: new Types.ObjectId(updates.uploadId),
        },
      },
    })

    if (!result.data) {
      return sendApiErrorResponse(new Error('Failed to match material with EC3 product'), request, {
        operation: 'match',
        resource: 'material',
      })
    }

    return sendApiSuccessResponse<CreateEC3MatchResponseApi['data']>(
      {
        ...result.data,
        _id: result.data._id.toString(),
        materialId: result.data.materialId.toString(),
      },
      'Material matched with EC3 product successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'match', resource: 'material' })
  }
}

export const POST = withAuthAndDBValidationWithQueryParams({
  dataSchema: createEC3MatchRequestApiSchema.shape.data,
  queryParamsSchema: createEC3MatchRequestApiSchema.shape.query,
  handler: createEC3Match,
  options: {
    method: 'json',
  },
})
