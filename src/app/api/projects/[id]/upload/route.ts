import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { UploadResponse } from '@/interfaces/client/uploads/UploadResponse'
import { AuthenticatedRequest, getUserId, withAuthAndDBParams } from '@/lib/api-middleware'
import { Upload } from '@/models'

export const runtime = 'nodejs'

type CreateUploadRequest = {
  filename: string
}

async function createUpload(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request)
  const params = await context.params

  const body: CreateUploadRequest = await request.json()
  const filename = body.filename || 'Unnamed File'

  // Validate and convert project ID
  if (!Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
  }

  // Create upload document with all required fields
  const upload = await Upload.create({
    projectId: new Types.ObjectId(params.id),
    userId,
    filename,
    status: 'Processing',
    elementCount: 0,
    materialCount: 0,
    deleted: false,
  })

  return NextResponse.json<UploadResponse>({
    uploadId: upload._id.toString(),
    status: upload.status,
    filename: upload.filename,
  })
}

export const POST = withAuthAndDBParams(createUpload)
