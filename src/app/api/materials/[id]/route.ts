import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { getErrorResponse } from '@/lib/errors'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { IdParamSchema, idParamSchema } from '@/schemas/api/general'
import {
  DeleteMaterialRequest,
  deleteMaterialRequestSchema,
  GetMaterialRequest,
  getMaterialRequestSchema,
} from '@/schemas/api/materials/materialRequests'
import {
  DeleteMaterialResponse,
  GetMaterialResponse,
} from '@/schemas/api/materials/materialResponses'

async function getMaterial(
  request: AuthenticatedValidationRequest<GetMaterialRequest>,
  context: { params: Promise<IdParamSchema> }
) {
  const validatedParams = await validatePathParams(idParamSchema, context.params)
  const materialId = validatedParams.id

  const material = await MaterialService.getMaterial({
    data: { materialId: new Types.ObjectId(materialId) },
  })

  return NextResponse.json<GetMaterialResponse>({
    success: true,
    message: 'Material fetched successfully',
    data: material.data,
  })
}

async function deleteMaterial(
  request: AuthenticatedValidationRequest<DeleteMaterialRequest>,
  context: { params: Promise<IdParamSchema> }
) {
  const validatedParams = await validatePathParams(idParamSchema, context.params)
  const materialId = validatedParams.id

  try {
    const result = await MaterialService.deleteMaterial({
      data: { materialId: new Types.ObjectId(materialId) },
    })

    return NextResponse.json<DeleteMaterialResponse>({
      success: true,
      message: 'Material deleted successfully',
      data: result.data,
    })
  } catch (error: unknown) {
    const errorResponse = getErrorResponse(error)

    return NextResponse.json(
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

export const GET = withAuthAndValidation(getMaterialRequestSchema, getMaterial)
export const DELETE = withAuthAndValidation(deleteMaterialRequestSchema, deleteMaterial)
