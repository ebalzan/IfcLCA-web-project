import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { parseIFCFile } from '@/lib/services/ifc/ifc-parser-client'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'
import { ParseIFCFileRequest, parseIFCFileRequestSchema } from '@/schemas/services/ifc'

async function parseIfc(request: AuthenticatedValidationRequest<ParseIFCFileRequest>) {
  try {
    const userId = getUserId(request)
    const { projectId, elements, filename } = request.validatedData.data

    const parsedData = await parseIFCFile({
      data: {
        filename,
        elements,
        projectId,
        userId,
      },
    })

    return sendApiSuccessResponse(
      {
        uploadId: parsedData.data.uploadId,
        projectId: projectId.toString(),
        _count: {
          elements: parsedData.data._count.elements,
          matchedMaterials: parsedData.data._count.matchedMaterials,
          unmatchedMaterials: parsedData.data._count.unmatchedMaterials,
        },
        shouldRedirectToLibrary: parsedData.data.shouldRedirectToLibrary,
      },
      'IFC file processed successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'process', resource: 'Parsed IFC' })
  }
}

export const POST = withAuthAndValidation(parseIFCFileRequestSchema, parseIfc, {
  method: 'json',
})
