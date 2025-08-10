import { NextResponse } from 'next/server'
import { MaterialService } from '@/lib/services/material-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import {
  CreateEC3BulkMatchRequest,
  createEC3BulkMatchRequestSchema,
} from '@/schemas/api/materials/materialRequests'
import { CreateEC3BulkMatchResponse } from '@/schemas/api/materials/materialResponses'

async function createEC3BulkMatch(
  request: AuthenticatedValidationRequest<CreateEC3BulkMatchRequest>
) {
  const { materialIds, updates } = request.validatedData.data

  try {
    const results = await MaterialService.createEC3BulkMatch({
      data: {
        materialIds,
        updates,
      },
    })

    return NextResponse.json<CreateEC3BulkMatchResponse>({
      success: true,
      message: 'Materials matched successfully',
      data: results.data,
    })
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bulk material matches',
      code: 'BULK_MATCH_MATERIALS_FAILED',
      meta: {
        timestamp: new Date(),
      },
    })
  }
}

export const POST = withAuthAndValidation(createEC3BulkMatchRequestSchema, createEC3BulkMatch)
