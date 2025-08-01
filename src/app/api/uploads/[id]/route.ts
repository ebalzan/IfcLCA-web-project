import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { validatePathParams } from '@/lib/validation-middleware'
import { Upload } from '@/models'
import { uploadIdSchema } from '@/schemas/api'

async function getUpload(
  request: AuthenticatedRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const validatedParams = await validatePathParams(uploadIdSchema, context.params)
  const upload = await Upload.findById(validatedParams.id).populate('elements')

  if (!upload) {
    return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
  }

  return NextResponse.json(upload)
}

export const GET = withAuthAndDBParams(getUpload)
