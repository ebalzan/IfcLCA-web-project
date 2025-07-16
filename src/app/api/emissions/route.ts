import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import ILCAIndicators from '@/interfaces/materials/ILCAIndicators'
import { withAuthAndDB } from '@/lib/api-middleware'
import { getUserId, AuthenticatedRequest } from '@/lib/auth-middleware'
import { Project } from '@/models'

export type IProjectEmissionsResponse = IProjectEmissions[]

export const runtime = 'nodejs'

interface IProjectEmissions extends ILCAIndicators {
  _id: Types.ObjectId | null
}

async function getEmissionsFromAllProjects(request: AuthenticatedRequest) {
  const userId = getUserId(request)

  // Aggregate emissions across all active projects for the user
  const projectsEmissions = await Project.aggregate<IProjectEmissions>([
    {
      $match: {
        userId,
        isArchived: { $ne: true },
      },
    },
    {
      $lookup: {
        from: 'elements',
        localField: '_id',
        foreignField: 'projectId',
        as: 'elements',
      },
    },
    {
      $unwind: {
        path: '$elements',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$elements.materials',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'materials',
        localField: 'elements.materials.material',
        foreignField: '_id',
        as: 'material',
      },
    },
    {
      $unwind: {
        path: '$material',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'indicatorsKBOB',
        localField: 'material.kbobMatchId',
        foreignField: '_id',
        as: 'kbobMatch',
      },
    },
    {
      $unwind: {
        path: '$kbobMatch',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: null,
        gwp: {
          $sum: {
            $multiply: [
              { $ifNull: ['$kbobMatch.GWP', 0] },
              { $ifNull: ['$elements.materials.volume', 0] },
              { $ifNull: ['$material.density', 1] },
            ],
          },
        },
        ubp: {
          $sum: {
            $multiply: [
              { $ifNull: ['$kbobMatch.UBP', 0] },
              { $ifNull: ['$elements.materials.volume', 0] },
              { $ifNull: ['$material.density', 1] },
            ],
          },
        },
        penre: {
          $sum: {
            $multiply: [
              { $ifNull: ['$kbobMatch.PENRE', 0] },
              { $ifNull: ['$elements.materials.volume', 0] },
              { $ifNull: ['$material.density', 1] },
            ],
          },
        },
      },
    },
  ]).exec()

  // // If no projects or materials found, return zeros
  // const totalEmissions: IProjectEmissions = projectsEmissions[0] || {
  //   _id: null,
  //   gwp: 0,
  //   ubp: 0,
  //   penre: 0,
  // };

  return NextResponse.json<IProjectEmissionsResponse>(projectsEmissions)
}

export const GET = withAuthAndDB(getEmissionsFromAllProjects)
