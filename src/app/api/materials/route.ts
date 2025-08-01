import { NextResponse } from 'next/server'
import IMaterialDB, { IMaterialVirtuals } from '@/interfaces/materials/IMaterialDB'
import IOpenEPDProduct from '@/interfaces/materials/IOpenEPDProduct'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { AuthenticatedRequest, getUserId, withAuthAndDB } from '@/lib/api-middleware'
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
    .populate<{ openEPDMatchId: IOpenEPDProduct }>('openEPDMatchId')

  const transformedMaterials: IMaterialVirtuals[] = materials.map(material => ({
    ...material,
    totalVolume: material.totalVolume,
    openEPDMatchId: material.openEPDMatchId,
  }))

  return NextResponse.json(transformedMaterials)
}

export const GET = withAuthAndDB(getMaterials)
