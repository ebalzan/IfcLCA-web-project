import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { UploadResponse } from '@/interfaces/client/uploads/UploadResponse'
import { getUserId } from '@/lib/api-middleware'
import {
  AuthenticatedValidationRequest,
  validatePathParams,
  withAuthAndValidation,
} from '@/lib/validation-middleware'
import { Upload } from '@/models'
import { CreateUploadRequest, createUploadSchema, projectIdSchema } from '@/schemas/api'

export const runtime = 'nodejs'

async function createUpload(
  request: AuthenticatedValidationRequest<CreateUploadRequest>,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse<UploadResponse>> {
  const userId = getUserId(request)

  const validatedParams = await validatePathParams(projectIdSchema, context.params)
  const projectId = new Types.ObjectId(validatedParams.id)

  const { filename } = request.validatedData

  // Create upload document with all required fields
  const upload = await Upload.create({
    projectId,
    userId,
    filename,
    status: 'Processing',
    elementCount: 0,
    materialCount: 0,
    deleted: false,
  })

  return NextResponse.json({
    uploadId: upload._id.toString(),
    status: upload.status,
    filename: upload.filename,
  })
}

export const POST = withAuthAndValidation(createUploadSchema, createUpload)
