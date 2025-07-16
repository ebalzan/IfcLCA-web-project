import { NextResponse } from 'next/server'
import { withAuthAndDB } from '@/lib/api-middleware'
import { AuthenticatedRequest } from '@/lib/auth-middleware'
import { fetchApi } from '@/lib/fetch'

export const maxDuration = 300 // 5 minutes
export const runtime = 'nodejs'

async function processIfcFile(request: AuthenticatedRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Forward to external API without API key (public endpoint)
  const externalFormData = new FormData()
  const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type })
  externalFormData.append('file', fileBlob, file.name || 'upload.ifc')

  const response = await fetchApi(
    'https://openbim-service-production.up.railway.app/api/ifc/process',
    {
      method: 'POST',
      body: externalFormData,
    }
  )

  return NextResponse.json(response)
}

export const POST = withAuthAndDB(processIfcFile)
