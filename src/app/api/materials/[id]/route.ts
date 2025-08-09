import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { getUserId, AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { getErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { MaterialService } from '@/lib/services/material-service'
import { validatePathParams } from '@/lib/validation-middleware'
import { idParamSchema } from '@/schemas/api/requests'
import { DeleteMaterialResponse, ErrorResponse, SuccessResponse } from '@/schemas/api/responses'

async function deleteMaterial(
  request: AuthenticatedRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const userId = getUserId(request)
  const validatedParams = await validatePathParams(idParamSchema, context.params)
  const materialId = validatedParams.id

  try {
    const result = await MaterialService.deleteMaterial(new Types.ObjectId(materialId), userId)

    return NextResponse.json<SuccessResponse<DeleteMaterialResponse>>({
      success: true,
      message: 'Material deleted successfully',
      data: result,
    })
  } catch (error: unknown) {
    const errorResponse = getErrorResponse(error)

    logger.error('Error deleting material', {
      error: error instanceof Error ? error.message : 'Unknown error',
      materialId,
      userId,
    })

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: errorResponse.error,
        code: errorResponse.code,
        meta: {
          timestamp: new Date(),
        },
      },
      { status: errorResponse.statusCode }
    )
  }
}

export const DELETE = withAuthAndDBParams(deleteMaterial)
