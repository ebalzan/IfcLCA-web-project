import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { MaterialService } from '@/lib/services/material-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { IdParamSchema, idParamSchema } from '@/schemas/api/general'
import {
  GetMaterialBulkRequest,
  getMaterialBulkRequestSchema,
} from '@/schemas/api/materials/materialRequests'
import { GetMaterialBulkResponse } from '@/schemas/api/materials/materialResponses'

async function getMaterialBulk(
  request: AuthenticatedValidationRequest<GetMaterialBulkRequest>,
  context: { params: Promise<IdParamSchema> }
) {
  const validatedParams = await validatePathParams(idParamSchema, context.params)
  const materialId = validatedParams.id

  const material = await MaterialService.getMaterialBulk({
    data: { materialIds: [new Types.ObjectId(materialId)] },
  })

  return NextResponse.json<GetMaterialBulkResponse>({
    success: true,
    message: 'Material fetched successfully',
    data: material.data,
  })
}

export const GET = withAuthAndValidation(getMaterialBulkRequestSchema, getMaterialBulk)
