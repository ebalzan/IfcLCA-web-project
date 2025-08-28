import { Types } from 'mongoose'
import { sendApiSuccessResponse, sendApiErrorResponse } from '@/lib/api-error-response'
import { MaterialService } from '@/lib/services/material-service'
import { withAuthAndDBValidation } from '@/lib/validation-middleware'
import { AuthenticatedValidationRequest } from '@/lib/validation-middleware/types'
import {
  CreateMaterialRequestApi,
  createMaterialRequestApiSchema,
} from '@/schemas/api/materials/material-requests'
import { CreateMaterialResponseApi } from '@/schemas/api/materials/material-responses'

async function createMaterial(
  request: AuthenticatedValidationRequest<CreateMaterialRequestApi['data']>
) {
  const { projectId, uploadId, ...rest } = request.validatedData

  try {
    const result = await MaterialService.createMaterial({
      data: {
        ...rest,
        projectId: new Types.ObjectId(projectId),
        uploadId: new Types.ObjectId(uploadId),
      },
    })

    return sendApiSuccessResponse<CreateMaterialResponseApi['data']>(
      {
        ...result,
        _id: result._id.toString(),
        projectId: result.projectId.toString(),
        uploadId: result.uploadId.toString(),
      },
      'Material created successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'create', resource: 'material' })
  }
}

export const POST = withAuthAndDBValidation({
  dataSchema: createMaterialRequestApiSchema.shape.data,
  handler: createMaterial,
  options: {
    method: 'json',
  },
})
