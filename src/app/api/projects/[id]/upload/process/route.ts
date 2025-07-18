import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { IFCProcessingService } from '@/lib/services/ifc-processing-service'
import { Upload } from '@/models'

interface IFCMaterial {
  name: string
  volume: number
}

interface IFCElement {
  globalId: string
  type: string
  name: string
  volume: number
  properties: {
    loadBearing?: boolean
    isExternal?: boolean
  }
  materials: IFCMaterial[]
}

async function processUpload(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params

  const { uploadId, elements } = (await request.json()) as {
    uploadId: string
    elements: IFCElement[]
  }

  // Process elements and find automatic matches
  const uniqueMaterialNames = [
    ...new Set(
      elements.flatMap((e: IFCElement) => e.materials?.map((m: IFCMaterial) => m.name) || [])
    ),
  ]

  // Run both operations in parallel
  const [elementResult, matchResult] = await Promise.all([
    IFCProcessingService.processElementsAndMaterialsFromIFC(params.id, elements, uploadId),
    IFCProcessingService.applyAutomaticMaterialMatches(params.id, uniqueMaterialNames),
  ])

  // Update upload status
  await Upload.findByIdAndUpdate(uploadId, {
    status: 'completed',
    elementCount: elementResult.elementCount,
    materialCount: elementResult.materialCount,
    matchedMaterialCount: matchResult.matchedCount,
  })

  return NextResponse.json({
    success: true,
    shouldRedirectToLibrary: true,
  })
}

export const POST = withAuthAndDBParams(processUpload)
