import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { IFCProcessingService } from '@/lib/services/ifc/ifc-processing-service'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { Upload } from '@/models'
import {
  IFCElement,
  ProcessUploadRequest,
  processUploadSchema,
  projectIdSchema,
} from '@/schemas/api'

interface IFCMaterial {
  name: string
  volume: number
}

async function processUpload(
  request: AuthenticatedValidationRequest<ProcessUploadRequest>,
  context: { params: Promise<Record<string, string>> }
) {
  const validatedParams = await validatePathParams(projectIdSchema, context.params)
  const projectId = new Types.ObjectId(validatedParams.id)

  const validatedData = request.validatedData
  const elements = validatedData.elements
  const uploadId = new Types.ObjectId(validatedData.uploadId)

  // Process elements and find automatic matches
  const uniqueMaterialNames = [
    ...new Set(
      elements.flatMap(
        (element: IFCElement) =>
          element.materials?.map((material: IFCMaterial) => material.name) || []
      )
    ),
  ]

  // Run both operations in parallel
  const [elementResult, matchResult] = await Promise.all([
    IFCProcessingService.processElementsAndMaterialsFromIFC(projectId, elements, uploadId),
    IFCProcessingService.applyAutomaticMaterialMatches(projectId, uniqueMaterialNames),
  ])

  // Update upload status
  await Upload.findByIdAndUpdate(uploadId, {
    ...elementResult,
    status: 'completed',
    matchedMaterialCount: matchResult.matchedCount,
  })

  return NextResponse.json({
    success: true,
    shouldRedirectToLibrary: true,
  })
}

export const POST = withAuthAndValidation(processUploadSchema, processUpload)
