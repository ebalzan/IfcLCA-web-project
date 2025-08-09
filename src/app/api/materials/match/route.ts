import { NextResponse } from 'next/server'
import { MaterialService } from '@/lib/services/material-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import {
  CreateMaterialBulkMatchRequest,
  createMaterialBulkMatchRequestSchema,
} from '@/schemas/api/requests'
import {
  CreateMaterialBulkMatchResponse,
  ErrorResponse,
  SuccessResponse,
} from '@/schemas/api/responses'

async function createBulkMaterialMatches(
  request: AuthenticatedValidationRequest<CreateMaterialBulkMatchRequest>
) {
  const { materialIds, data } = request.validatedData

  try {
    const results = await MaterialService.createMaterialBulkMatch({
      materialIds,
      data,
    })

    return NextResponse.json<SuccessResponse<CreateMaterialBulkMatchResponse>>({
      success: true,
      message: 'Materials matched successfully',
      data: results,
    })
  } catch (error: unknown) {
    return NextResponse.json<ErrorResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bulk material matches',
      code: 'BULK_MATCH_MATERIALS_FAILED',
      meta: {
        timestamp: new Date(),
      },
    })
  }
}

export const POST = withAuthAndValidation(
  createMaterialBulkMatchRequestSchema,
  createBulkMaterialMatches
)
