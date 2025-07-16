import { NextResponse } from 'next/server'
import { startSession, Types } from 'mongoose'
import IProjectWithStats from '@/interfaces/projects/IProjectWithStats'
import { ProjectResponse } from '@/interfaces/projects/ProjectResponse'
import { withAuthAndDBParams } from '@/lib/api-middleware'
import { AuthenticatedRequest, getUserId } from '@/lib/auth-middleware'
import { Element, Material, Project, Upload } from '@/models'

export const runtime = 'nodejs'

async function getProjectWithStats(projectId: Types.ObjectId) {
  const [project] = await Project.aggregate<IProjectWithStats>([
    {
      $match: { _id: projectId },
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

  return project
}

async function getProject(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params

  if (!Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
  }

  const projectId = new Types.ObjectId(params.id)

  const { searchParams } = new URL(request.url)
  const withStats = searchParams.get('withStats') === 'true'

  const project = withStats
    ? await getProjectWithStats(projectId)
    : await Project.findById(projectId)

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

async function updateProject(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request)
  const params = await context.params

  const body: { name: string; description: string } = await request.json()

  const project = await Project.findOneAndUpdate(
    { _id: params.id, userId },
    { $set: body },
    { new: true }
  ).lean()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json<ProjectResponse>({
    ...project,
    _id: project._id.toString(),
  })
}

export async function deleteProject(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(request)
  const params = await context.params

  // Verify project exists and belongs to user
  const project = await Project.findOne({
    _id: params.id,
    userId,
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Delete all associated data in order
  await Upload.deleteMany({ projectId: params.id })
  await Element.deleteMany({ projectId: params.id })
  await Material.deleteMany({ projectId: params.id })

  // Finally delete the project
  await Project.deleteOne({ _id: params.id })

  return NextResponse.json({ success: true })
}

export const DELETE = withAuthAndDBParams(deleteProject)
export const GET = withAuthAndDBParams(getProject)
export const PATCH = withAuthAndDBParams(updateProject)
