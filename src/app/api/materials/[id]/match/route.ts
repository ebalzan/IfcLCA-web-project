import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { idParamSchema } from '@/schemas/api/general'
import {
  CreateEC3MatchRequest,
  createEC3MatchRequestSchema,
} from '@/schemas/api/materials/materialRequests'
import { CreateEC3MatchResponse } from '@/schemas/api/materials/materialResponses'

async function createEC3Match(
  request: AuthenticatedValidationRequest<CreateEC3MatchRequest>,
  context: { params: Promise<{ [key: string]: string }> }
) {
  const validatedParams = await validatePathParams(idParamSchema, context.params)
  const materialId = validatedParams.id

  const { data } = request.validatedData

  try {
    const result = await MaterialService.createEC3Match({
      data: {
        materialId: new Types.ObjectId(materialId),
        updates: data.updates,
      },
    })

    return NextResponse.json<CreateEC3MatchResponse>({
      success: true,
      message: 'Material matched with EC3 product successfully',
      data: result.data,
    })
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: 'Failed to match material with EC3 product',
      code: 'MATCH_MATERIAL_WITH_EC3_FAILED',
      meta: {
        timestamp: new Date(),
      },
    })
  }
}

export const POST = withAuthAndValidation(createEC3MatchRequestSchema, createEC3Match)
