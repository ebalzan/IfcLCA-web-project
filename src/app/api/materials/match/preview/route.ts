import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { MaterialService } from '@/lib/services/material-service'

interface GetKBOBMatchPreviewRequest {
  materialIds: string[]
  kbobMaterialId: string
}

async function getKBOBMatchPreview(request: AuthenticatedRequest) {
  const body: GetKBOBMatchPreviewRequest = await request.json()
  const { materialIds, kbobMaterialId } = body

  const preview = await MaterialService.getKBOBMatchPreview(materialIds, kbobMaterialId)

  return NextResponse.json(preview)
}

export const POST = withAuthAndDBParams(getKBOBMatchPreview)
