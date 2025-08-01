import { NextResponse } from 'next/server'
import { getUserId, AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { validatePathParams } from '@/lib/validation-middleware'
import { Material, MaterialDeletion } from '@/models'
import { materialIdSchema } from '@/schemas/api'

async function deleteMaterial(
  request: AuthenticatedRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const userId = getUserId(request)

  const validatedParams = await validatePathParams(materialIdSchema, context.params)
  const materialId = validatedParams.id

  // Find the material to get its name and project ID before deletion
  const material = await Material.findById(materialId).lean()
  if (!material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 })
  }

  // Delete the material
  await Material.findByIdAndDelete(materialId)

  // Create a material deletion record
  await MaterialDeletion.create({
    projectId: material.projectId,
    userId,
    materialName: material.name,
    reason: 'Material deleted by user',
  })

  return NextResponse.json({ message: 'Material deleted successfully' }, { status: 200 })
}

export const DELETE = withAuthAndDBParams(deleteMaterial)
