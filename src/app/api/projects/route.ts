import { NextResponse } from 'next/server'
import IProjectWithStatsClient from '@/interfaces/client/projects/IProjectWithStatsClient'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { ProjectsWithStatsResponse } from '@/interfaces/projects/ProjectsResponse'
import { AuthenticatedRequest, getUserId, withAuthAndDB } from '@/lib/api-middleware'
import { Project } from '@/models'

export const runtime = 'nodejs'

async function getProjectsWithStats(userId: string, limit: number, page: number) {
  return Project.aggregate<IProjectWithStatsClient>([
    {
      $match: { userId },
    },
    {
      $lookup: {
        from: 'uploads',
        localField: '_id',
        foreignField: 'projectId',
        as: 'uploads',
      },
    },
    {
      $lookup: {
        from: 'elements',
        localField: '_id',
        foreignField: 'projectId',
        as: 'elements',
        pipeline: [
          {
            $lookup: {
              from: 'materials',
              localField: 'materials.material',
              foreignField: '_id',
              as: 'materialRefs',
              pipeline: [
                {
                  $lookup: {
                    from: 'indicatorsKBOB',
                    localField: 'kbobMatchId',
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
              ],
            },
          },
          {
            $addFields: {
              materials: {
                $map: {
                  input: '$materials',
                  as: 'mat',
                  in: {
                    $mergeObjects: [
                      '$$mat',
                      {
                        material: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$materialRefs',
                                cond: {
                                  $eq: ['$$this._id', '$$mat.material'],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                    ],
                  },
                },
              },
              totalVolume: { $sum: '$materials.volume' },
              emissions: {
                $reduce: {
                  input: '$materials',
                  initialValue: { gwp: 0, ubp: 0, penre: 0 },
                  in: {
                    gwp: {
                      $add: [
                        '$$value.gwp',
                        {
                          $multiply: [
                            '$$this.volume',
                            { $ifNull: ['$$this.material.density', 0] },
                            { $ifNull: ['$$this.material.kbobMatch.GWP', 0] },
                          ],
                        },
                      ],
                    },
                    ubp: {
                      $add: [
                        '$$value.ubp',
                        {
                          $multiply: [
                            '$$this.volume',
                            { $ifNull: ['$$this.material.density', 0] },
                            { $ifNull: ['$$this.material.kbobMatch.UBP', 0] },
                          ],
                        },
                      ],
                    },
                    penre: {
                      $add: [
                        '$$value.penre',
                        {
                          $multiply: [
                            '$$this.volume',
                            { $ifNull: ['$$this.material.density', 0] },
                            {
                              $ifNull: ['$$this.material.kbobMatch.PENRE', 0],
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'materials',
        localField: '_id',
        foreignField: 'projectId',
        as: 'materials',
        pipeline: [
          {
            $lookup: {
              from: 'indicatorsKBOB',
              localField: 'kbobMatchId',
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
            $lookup: {
              from: 'elements',
              let: { materialId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$$materialId', '$materials.material'],
                    },
                  },
                },
                {
                  $unwind: '$materials',
                },
                {
                  $match: {
                    $expr: {
                      $eq: ['$materials.material', '$$materialId'],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalVolume: { $sum: '$materials.volume' },
                  },
                },
              ],
              as: 'volumeData',
            },
          },
          {
            $addFields: {
              volume: {
                $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
              },
              gwp: {
                $multiply: [
                  {
                    $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                  },
                  { $ifNull: ['$density', 0] },
                  { $ifNull: ['$kbobMatch.GWP', 0] },
                ],
              },
              ubp: {
                $multiply: [
                  {
                    $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                  },
                  { $ifNull: ['$density', 0] },
                  { $ifNull: ['$kbobMatch.UBP', 0] },
                ],
              },
              penre: {
                $multiply: [
                  {
                    $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                  },
                  { $ifNull: ['$density', 0] },
                  { $ifNull: ['$kbobMatch.PENRE', 0] },
                ],
              },
            },
          },
          {
            $project: {
              volumeData: 0,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        lastActivityAt: {
          $max: [
            '$updatedAt',
            { $max: '$uploads.createdAt' },
            { $max: '$elements.createdAt' },
            { $max: '$materials.createdAt' },
          ],
        },
        _count: {
          elements: { $size: '$elements' },
          uploads: { $size: '$uploads' },
          materials: { $size: '$materials' },
        },
        totalEmissions: {
          $reduce: {
            input: '$elements',
            initialValue: { gwp: 0, ubp: 0, penre: 0 },
            in: {
              gwp: { $add: ['$$value.gwp', '$$this.emissions.gwp'] },
              ubp: { $add: ['$$value.ubp', '$$this.emissions.ubp'] },
              penre: { $add: ['$$value.penre', '$$this.emissions.penre'] },
            },
          },
        },
      },
    },
  ])
    .limit(limit)
    .skip((page - 1) * limit)
}

async function getProjects(request: AuthenticatedRequest) {
  const userId = getUserId(request)

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const page = parseInt(searchParams.get('page') || '1')

  const projects = await getProjectsWithStats(userId, limit, page)

  const totalCount = await Project.countDocuments({ userId })
  const hasMore = page * limit < totalCount

  return NextResponse.json<ProjectsWithStatsResponse>({
    projects,
    hasMore,
    totalCount,
  })
}

async function createProject(request: AuthenticatedRequest) {
  const userId = getUserId(request)
  const body: Pick<IProjectDB, 'name' | 'description' | 'imageUrl'> = await request.json()

  const project: IProjectDB = await Project.create({
    ...body,
    userId,
    emissions: {
      gwp: 0,
      ubp: 0,
      penre: 0,
      lastCalculated: new Date(),
    },
  })

  return NextResponse.json<IProjectDB>(project)
}

export const GET = withAuthAndDB(getProjects)
export const POST = withAuthAndDB(createProject)
