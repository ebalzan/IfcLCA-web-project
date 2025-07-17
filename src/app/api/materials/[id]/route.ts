import { NextResponse } from 'next/server'
import { getUserId, AuthenticatedRequest, withAuthAndDBParams } from '@/lib/api-middleware'
import { Material, MaterialDeletion } from '@/models'

async function deleteMaterial(
  request: AuthenticatedRequest,
  context: { params: Promise<{ [key: string]: string }> }
) {
  const userId = getUserId(request)

  const params = await context.params
  const materialId = params.id

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
