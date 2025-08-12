import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidationWithParams,
} from '@/lib/validation-middleware'
import { idParamSchema, IdParamSchema } from '@/schemas/api/general'
import {
  CreateEC3MatchRequest,
  createEC3MatchRequestSchema,
} from '@/schemas/api/materials/material-requests'

async function createEC3Match(
  request: AuthenticatedValidationRequest<CreateEC3MatchRequest>,
  context: { pathParams: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.pathParams)
    const { updates } = request.validatedData.data

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

    return sendApiSuccessResponse(
      result.data,
      'Material matched with EC3 product successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'match', resource: 'material' })
  }
}

export const POST = withAuthAndValidationWithParams(createEC3MatchRequestSchema, createEC3Match)
