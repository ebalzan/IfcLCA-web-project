import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import {
  idParamSchema,
  CreateMaterialMatchRequest,
  createMaterialMatchRequestSchema,
} from '@/schemas/api/requests'
import {
  CreateMaterialMatchResponse,
  ErrorResponse,
  SuccessResponse,
} from '@/schemas/api/responses'

async function createMaterialMatch(
  request: AuthenticatedValidationRequest<CreateMaterialMatchRequest>,
  context: { params: Promise<{ [key: string]: string }> }
) {
  const validatedParams = await validatePathParams(idParamSchema, context.params)
  const materialId = validatedParams.id

  const { data } = request.validatedData

  try {
    const result = await MaterialService.createMaterialMatch({
      materialId: new Types.ObjectId(materialId),
      data,
    })

    return NextResponse.json<SuccessResponse<CreateMaterialMatchResponse>>({
      success: true,
      message: 'Material matched with EC3 product successfully',
      data: result,
    })
  } catch (error: unknown) {
    return NextResponse.json<ErrorResponse>({
      success: false,
      error: 'Failed to match material with EC3 product',
      code: 'MATCH_MATERIAL_WITH_EC3_FAILED',
      meta: {
        timestamp: new Date(),
      },
    })
  }
}

export const POST = withAuthAndValidation(createMaterialMatchRequestSchema, createMaterialMatch)
