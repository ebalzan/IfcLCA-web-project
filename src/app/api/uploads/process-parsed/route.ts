import { Types } from 'mongoose'
import { z } from 'zod'
import { sendApiErrorResponse } from '@/lib/api-error-response'
import { sendApiSuccessResponse } from '@/lib/api-error-response'
import { getUserId } from '@/lib/api-middleware'
import { IFCProcessingService } from '@/lib/services/ifc/ifc-processing-service'
import { MaterialService } from '@/lib/services/material-service'
import { UploadService } from '@/lib/services/upload-service'
import { AuthenticatedValidationRequest, withAuthAndValidation } from '@/lib/validation-middleware'

const processParsedIfcRequestSchema = z.object({
  data: z.object({
    projectId: z.string(),
    elements: z.array(z.any()),
    filename: z.string(),
  }),
})

type ProcessParsedIfcRequest = AuthenticatedValidationRequest<
  z.infer<typeof processParsedIfcRequestSchema>
>

async function processParsedIfc(request: ProcessParsedIfcRequest) {
  try {
    const userId = getUserId(request)
    const { projectId, elements, filename } = request.validatedData.data

    // Create upload record
    const uploadResult = await UploadService.createUpload({
      data: {
        projectId: new Types.ObjectId(projectId),
        userId,
        filename,
        status: 'Processing',
        _count: {
          elements: 0,
          materials: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    if (!uploadResult.success) {
      throw new Error('Failed to create upload record')
    }

    // Process materials
    const processElementsAndMaterialsFromIFCResponse =
      await IFCProcessingService.processElementsAndMaterialsFromIFC({
        data: {
          projectId: new Types.ObjectId(projectId),
          elements,
          uploadId: new Types.ObjectId(uploadResult.data._id),
        },
      })
    const { elementCount, materialCount } = processElementsAndMaterialsFromIFCResponse.data

    // Get all materials
    const materials = await MaterialService.getMaterialBulk({
      data: {
        materialIds: [],
        projectId: new Types.ObjectId(projectId),
        pagination: { page: 1, size: materialCount },
      },
    })

    // Apply automatic material matches
    const applyAutomaticMaterialMatchesResponse =
      await IFCProcessingService.applyAutomaticMaterialMatches({
        data: {
          materialIds: materials.data.materials.map(material => new Types.ObjectId(material._id)),
          projectId: new Types.ObjectId(projectId),
        },
      })
    const { matchedCount } = applyAutomaticMaterialMatchesResponse.data

    return sendApiSuccessResponse(
      {
        uploadId: uploadResult.data._id.toString(),
        projectId: projectId,
        _count: {
          elements: elementCount,
          matchedMaterials: matchedCount,
          unmatchedMaterials: materialCount - matchedCount,
        },
        shouldRedirectToLibrary: materialCount - matchedCount > 0,
      },
      'IFC file processed successfully',
      request
    )
  } catch (error: unknown) {
    return sendApiErrorResponse(error, request, { operation: 'process', resource: 'Parsed IFC' })
  }
}

export const POST = withAuthAndValidation(processParsedIfcRequestSchema, processParsedIfc, {
  method: 'json',
})
