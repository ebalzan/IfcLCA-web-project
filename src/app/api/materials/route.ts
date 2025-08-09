import { NextResponse } from 'next/server'
import { IEC3Match } from '@/interfaces/materials/IEC3Match'
import IMaterialDB, { IMaterialVirtuals } from '@/interfaces/materials/IMaterialDB'
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
    .populate<{ ec3MatchId: IEC3Match }>('ec3MatchId')

  const transformedMaterials: IMaterialVirtuals[] = materials.map(material => ({
    ...material,
    totalVolume: material.totalVolume,
    ec3MatchId: material.ec3MatchId,
  }))

  return NextResponse.json(transformedMaterials)
}

export const GET = withAuthAndDB(getMaterials)
