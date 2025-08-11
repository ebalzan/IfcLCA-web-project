import { Types } from 'mongoose'
import { sendApiErrorResponse, sendApiSuccessResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { idParamSchema, IdParamSchema } from '@/schemas/api/general'
import {
  CreateEC3MatchRequest,
  createEC3MatchRequestSchema,
} from '@/schemas/api/materials/materialRequests'

async function createEC3Match(
  request: AuthenticatedValidationRequest<CreateEC3MatchRequest>,
  context: { params: Promise<IdParamSchema> }
) {
  try {
    const { id: materialId } = await validatePathParams(idParamSchema, context.params)
    const { data } = request.validatedData

    if (!Types.ObjectId.isValid(materialId)) {
      return sendApiErrorResponse(new Error('Invalid material ID'), request, {
        resource: 'material',
      })
    }

    const result = await MaterialService.createEC3Match({
      data: {
        materialId: new Types.ObjectId(materialId),
        updates: data.updates,
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

export const POST = withAuthAndValidation(createEC3MatchRequestSchema, createEC3Match)
