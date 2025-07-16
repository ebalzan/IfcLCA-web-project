import { NextResponse } from 'next/server'
import IKBOBMaterial from '@/interfaces/materials/IKBOBMaterial'
import IMaterialDB, { IMaterialVirtuals } from '@/interfaces/materials/IMaterialDB'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { withAuthAndDB } from '@/lib/api-middleware'
import { AuthenticatedRequest, getUserId } from '@/lib/auth-middleware'
import { logger } from '@/lib/logger'
import { Material, Project } from '@/models'

async function getMaterials(request: AuthenticatedRequest) {
  const userId = getUserId(request)

  // Get projects for the current user
  const userProjects = await Project.find({ userId }).select<Pick<IProjectDB, '_id'>>('_id').lean()

  const projectIds = userProjects.map(project => project._id.toString())

  const materials = await Material.find({
    projectId: { $in: projectIds },
  })
    .lean<(IMaterialDB & IMaterialVirtuals)[]>({ virtuals: true })
    .populate<{ kbobMatchId: IKBOBMaterial }>('kbobMatchId')

  const transformedMaterials: IMaterialVirtuals[] = materials.map(material => ({
    ...material,
    totalVolume: material.totalVolume,
    kbobMatchId: material.kbobMatchId,
  }))

  return NextResponse.json(transformedMaterials)
}

export const GET = withAuthAndDB(getMaterials)
