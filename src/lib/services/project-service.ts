import { IProjectWithNestedData } from '@/interfaces/projects/IProjectWithNestedData'
import { Project, Upload, Material, Element } from '@/models'
import {
  CreateProjectRequest,
  GetProjectBulkByUserRequest,
  GetProjectRequest,
  GetProjectWithNestedDataBulkByUserRequest,
  GetProjectWithNestedDataBulkRequest,
  GetProjectWithNestedDataRequest,
} from '@/schemas/services/projects/project-requests'
import {
  CreateProjectBulkRequest,
  GetProjectBulkRequest,
  UpdateProjectRequest,
  UpdateProjectBulkRequest,
  DeleteProjectRequest,
  DeleteProjectBulkRequest,
} from '@/schemas/services/projects/project-requests'
import {
  CreateProjectResponse,
  CreateProjectBulkResponse,
  GetProjectResponse,
  GetProjectBulkResponse,
  UpdateProjectResponse,
  UpdateProjectBulkResponse,
  DeleteProjectResponse,
  DeleteProjectBulkResponse,
  GetProjectWithNestedDataResponse,
  GetProjectWithNestedDataBulkResponse,
  GetProjectBulkByUserResponse,
  GetProjectWithNestedDataBulkByUserResponse,
} from '@/schemas/services/projects/project-responses'
import { SearchProjectsRequest, SearchProjectsResponse } from '@/schemas/services/projects/search'
import { withTransaction } from '@/utils/withTransaction'
import {
  DatabaseError,
  ProjectDeleteError,
  ProjectUpdateError,
  ProjectCreateError,
  ProjectNotFoundError,
  isAppError,
} from '../errors'
import { logger } from '../logger'

export class ProjectService {
  // Cache configuration
  private static projectCache = new Map<string, any>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  /**
   * Creates a new project
   */
  static async createProject({
    data: { project, userId },
    session,
  }: CreateProjectRequest): Promise<CreateProjectResponse> {
    try {
      const newProjectResult = await Project.insertOne(
        { ...project, userId },
        { session: session || null }
      )

      const newProject = newProjectResult.toObject()

      return newProject
    } catch (error: unknown) {
      logger.error('❌ [Project Service] Error in createProject:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new ProjectCreateError(
        error instanceof Error ? error.message : 'Failed to create project'
      )
    }
  }

  /**
   * Creates multiple projects
   */
  static async createProjectBulk({
    data: { projects, userId },
    session,
  }: CreateProjectBulkRequest): Promise<CreateProjectBulkResponse> {
    try {
      const newProjectsResult = await Project.insertMany(
        projects.map(project => ({
          ...project,
          userId,
        })),
        { session: session || null }
      )

      const newProjects = newProjectsResult.map(project => project.toObject())

      return newProjects
    } catch (error: unknown) {
      logger.error('❌ [Project Service] Error in createProjectBulk:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new ProjectCreateError(
        error instanceof Error ? error.message : 'Failed to create projects'
      )
    }
  }

  /**
   * Get a project by its ID
   */
  static async getProject({
    data: { projectId, userId },
    session,
  }: GetProjectRequest): Promise<GetProjectResponse> {
    try {
      const project = await Project.findOne({ _id: projectId, userId })
        .session(session || null)
        .lean()

      if (!project) {
        throw new ProjectNotFoundError(projectId.toString())
      }

      return project
    } catch (error: unknown) {
      logger.error('❌ [Project Service] Error in getProject:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new DatabaseError(
        error instanceof Error ? error.message : 'Failed to fetch project',
        'read'
      )
    }
  }

  /**
   * Get multiple projects by their IDs
   */
  static async getProjectBulk({
    data: { projectIds, pagination },
    session,
  }: GetProjectBulkRequest): Promise<GetProjectBulkResponse> {
    return withTransaction(async useSession => {
      if (!pagination) {
        try {
          const projects = await Project.find({ _id: { $in: projectIds } })
            .session(useSession)
            .lean()

          if (!projects || projects.length === 0) {
            throw new ProjectNotFoundError(projectIds.join(', '))
          }

          return { projects }
        } catch (error: unknown) {
          logger.error('❌ [Project Service] Error in getProjectBulk:', error)
          throw error
        }
      } else {
        try {
          const { page, size } = pagination
          const skip = (page - 1) * size

          const projects = await Project.find({ _id: { $in: projectIds } })
            .session(useSession)
            .skip(skip)
            .limit(size)
            .lean()

          if (!projects || projects.length === 0) {
            throw new ProjectNotFoundError(projectIds.join(', '))
          }

          const totalCount = await Project.countDocuments({ _id: { $in: projectIds } }).session(
            useSession
          )
          const hasMore = page * size < totalCount

          return {
            projects,
            pagination: {
              page,
              size,
              totalCount,
              hasMore,
              totalPages: Math.ceil(totalCount / size),
            },
          }
        } catch (error: unknown) {
          logger.error('❌ [Project Service] Error in getProjectBulk:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new DatabaseError(
            error instanceof Error ? error.message : 'Failed to fetch projects',
            'read'
          )
        }
      }
    }, session)
  }

  /**
   * Get multiple projects by their IDs
   */
  static async getProjectBulkByUser({
    data: { userId, pagination },
    session,
  }: GetProjectBulkByUserRequest): Promise<GetProjectBulkByUserResponse> {
    return withTransaction(async useSession => {
      if (!pagination) {
        try {
          const projects = await Project.find({ userId }).session(useSession).lean()

          if (!projects || projects.length === 0) {
            throw new ProjectNotFoundError(userId)
          }

          return { projects }
        } catch (error: unknown) {
          logger.error('❌ [Project Service] Error in getProjectBulk:', error)
          throw error
        }
      } else {
        try {
          const { page, size } = pagination
          const skip = (page - 1) * size

          const projects = await Project.find({ userId })
            .session(useSession)
            .skip(skip)
            .limit(size)
            .lean()

          if (!projects || projects.length === 0) {
            throw new ProjectNotFoundError(userId)
          }

          const totalCount = await Project.countDocuments({ userId }).session(useSession)
          const hasMore = page * size < totalCount

          return {
            projects,
            pagination: {
              page,
              size,
              totalCount,
              hasMore,
              totalPages: Math.ceil(totalCount / size),
            },
          }
        } catch (error: unknown) {
          logger.error('❌ [Project Service] Error in getProjectBulk:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new DatabaseError(
            error instanceof Error ? error.message : 'Failed to fetch projects',
            'read'
          )
        }
      }
    }, session)
  }

  /**
   * Get a project with nested data
   */
  static async getProjectWithNestedData({
    data: { projectId, userId },
    session,
  }: GetProjectWithNestedDataRequest): Promise<GetProjectWithNestedDataResponse> {
    return withTransaction(async useSession => {
      try {
        await this.getProject({ data: { projectId, userId }, session: useSession })

        const [projectWithNestedData] = await Project.aggregate<IProjectWithNestedData>([
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
                    localField: 'materialLayers.materialId',
                    foreignField: '_id',
                    as: 'materialRefs',
                    pipeline: [
                      {
                        $lookup: {
                          from: 'EC3Matches',
                          localField: 'ec3MatchId',
                          foreignField: '_id',
                          as: 'ec3Match',
                        },
                      },
                      {
                        $unwind: {
                          path: '$ec3Match',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    ],
                  },
                },
                {
                  $addFields: {
                    totalVolume: { $sum: '$materialLayers.volume' },
                    indicators: {
                      $reduce: {
                        input: '$materialLayers',
                        initialValue: { gwp: 0, ubp: 0, penre: 0 },
                        in: {
                          gwp: {
                            $add: [
                              '$$value.gwp',
                              {
                                $multiply: [
                                  '$$this.volume',
                                  { $ifNull: ['$$this.materialId.density', 0] },
                                  { $ifNull: ['$$this.materialId.indicators.gwp', 0] },
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
                                  { $ifNull: ['$$this.materialId.density', 0] },
                                  { $ifNull: ['$$this.materialId.indicators.ubp', 0] },
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
                                  { $ifNull: ['$$this.materialId.density', 0] },
                                  {
                                    $ifNull: ['$$this.materialId.indicators.penre', 0],
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
                    from: 'EC3Matches',
                    localField: 'ec3MatchId',
                    foreignField: 'ec3MatchId',
                    as: 'ec3Match',
                  },
                },
                {
                  $unwind: {
                    path: '$ec3Match',
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
                            $in: ['$$materialId', '$materialLayers.materialId'],
                          },
                        },
                      },
                      {
                        $unwind: '$materialLayers',
                      },
                      {
                        $match: {
                          $expr: {
                            $eq: ['$materialLayers.materialId', '$$materialId'],
                          },
                        },
                      },
                      {
                        $group: {
                          _id: null,
                          totalVolume: { $sum: '$materialLayers.volume' },
                        },
                      },
                    ],
                    as: 'volumeData',
                  },
                },
                {
                  $addFields: {
                    totalVolume: {
                      $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                    },
                    gwp: {
                      $multiply: [
                        {
                          $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                        },
                        { $ifNull: ['$density', 0] },
                        { $ifNull: ['$indicators.gwp', 0] },
                      ],
                    },
                    ubp: {
                      $multiply: [
                        {
                          $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                        },
                        { $ifNull: ['$density', 0] },
                        { $ifNull: ['$indicators.ubp', 0] },
                      ],
                    },
                    penre: {
                      $multiply: [
                        {
                          $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                        },
                        { $ifNull: ['$density', 0] },
                        { $ifNull: ['$ec3Match.penre', 0] },
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
              _count: {
                elements: { $size: '$elements' },
                uploads: { $size: '$uploads' },
                materials: { $size: '$materials' },
              },
              totalIndicators: {
                $reduce: {
                  input: '$elements',
                  initialValue: { gwp: 0, ubp: 0, penre: 0 },
                  in: {
                    gwp: { $add: ['$$value.gwp', '$$this.indicators.gwp'] },
                    ubp: { $add: ['$$value.ubp', '$$this.indicators.ubp'] },
                    penre: { $add: ['$$value.penre', '$$this.indicators.penre'] },
                  },
                },
              },
            },
          },
        ]).session(useSession)

        return projectWithNestedData
      } catch (error: unknown) {
        logger.error('❌ [Project Service] Error in getProjectWithNestedData:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new DatabaseError(
          error instanceof Error ? error.message : 'Failed to fetch project with nested data',
          'read'
        )
      }
    }, session)
  }

  /**
   * Get multiple projects with nested data
   */
  static async getProjectWithNestedDataBulk({
    data: { projectIds, pagination },
    session,
  }: GetProjectWithNestedDataBulkRequest): Promise<GetProjectWithNestedDataBulkResponse> {
    return withTransaction(async useSession => {
      if (!pagination) {
        try {
          await this.getProjectBulk({
            data: { projectIds },
            session: useSession,
          })

          const projectWithNestedDataBulk = await Project.aggregate<IProjectWithNestedData>([
            {
              $match: { _id: { $in: projectIds } },
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
                      localField: 'materialLayers.materialId',
                      foreignField: '_id',
                      as: 'materialRefs',
                      pipeline: [
                        {
                          $lookup: {
                            from: 'EC3Matches',
                            localField: 'ec3MatchId',
                            foreignField: '_id',
                            as: 'ec3Match',
                          },
                        },
                        {
                          $unwind: {
                            path: '$ec3Match',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      totalVolume: { $sum: '$materialLayers.volume' },
                      indicators: {
                        $reduce: {
                          input: '$materialLayers',
                          initialValue: { gwp: 0, ubp: 0, penre: 0 },
                          in: {
                            gwp: {
                              $add: [
                                '$$value.gwp',
                                {
                                  $multiply: [
                                    '$$this.volume',
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    { $ifNull: ['$$this.materialId.indicators.gwp', 0] },
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
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    { $ifNull: ['$$this.materialId.indicators.ubp', 0] },
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
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    {
                                      $ifNull: ['$$this.materialId.indicators.penre', 0],
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
                      from: 'EC3Matches',
                      localField: 'ec3MatchId',
                      foreignField: 'ec3MatchId',
                      as: 'ec3Match',
                    },
                  },
                  {
                    $unwind: {
                      path: '$ec3Match',
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
                              $in: ['$$materialId', '$materialLayers.materialId'],
                            },
                          },
                        },
                        {
                          $unwind: '$materialLayers',
                        },
                        {
                          $match: {
                            $expr: {
                              $eq: ['$materialLayers.materialId', '$$materialId'],
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            totalVolume: { $sum: '$materialLayers.volume' },
                          },
                        },
                      ],
                      as: 'volumeData',
                    },
                  },
                  {
                    $addFields: {
                      totalVolume: {
                        $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                      },
                      gwp: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$indicators.gwp', 0] },
                        ],
                      },
                      ubp: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$indicators.ubp', 0] },
                        ],
                      },
                      penre: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$ec3Match.penre', 0] },
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
                _count: {
                  elements: { $size: '$elements' },
                  uploads: { $size: '$uploads' },
                  materials: { $size: '$materials' },
                },
                totalIndicators: {
                  $reduce: {
                    input: '$elements',
                    initialValue: { gwp: 0, ubp: 0, penre: 0 },
                    in: {
                      gwp: { $add: ['$$value.gwp', '$$this.indicators.gwp'] },
                      ubp: { $add: ['$$value.ubp', '$$this.indicators.ubp'] },
                      penre: { $add: ['$$value.penre', '$$this.indicators.penre'] },
                    },
                  },
                },
              },
            },
          ]).session(useSession)

          if (!projectWithNestedDataBulk || projectWithNestedDataBulk.length === 0) {
            throw new ProjectNotFoundError(projectIds.join(', '))
          }

          return { projects: projectWithNestedDataBulk }
        } catch (error: unknown) {
          logger.error('❌ [Project Service] Error in getProjectWithNestedDataBulk:', error)
          throw error
        }
      } else {
        try {
          const { page, size } = pagination
          const skip = (page - 1) * size

          await this.getProjectBulk({
            data: { projectIds, pagination: { page, size } },
            session: useSession,
          })

          const projectWithNestedDataBulk = await Project.aggregate<IProjectWithNestedData>([
            {
              $match: { _id: { $in: projectIds } },
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
                      localField: 'materialLayers.materialId',
                      foreignField: '_id',
                      as: 'materialRefs',
                      pipeline: [
                        {
                          $lookup: {
                            from: 'EC3Matches',
                            localField: 'ec3MatchId',
                            foreignField: '_id',
                            as: 'ec3Match',
                          },
                        },
                        {
                          $unwind: {
                            path: '$ec3Match',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      totalVolume: { $sum: '$materialLayers.volume' },
                      indicators: {
                        $reduce: {
                          input: '$materialLayers',
                          initialValue: { gwp: 0, ubp: 0, penre: 0 },
                          in: {
                            gwp: {
                              $add: [
                                '$$value.gwp',
                                {
                                  $multiply: [
                                    '$$this.volume',
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    { $ifNull: ['$$this.materialId.indicators.gwp', 0] },
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
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    { $ifNull: ['$$this.materialId.indicators.ubp', 0] },
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
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    {
                                      $ifNull: ['$$this.materialId.indicators.penre', 0],
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
                      from: 'EC3Matches',
                      localField: 'ec3MatchId',
                      foreignField: 'ec3MatchId',
                      as: 'ec3Match',
                    },
                  },
                  {
                    $unwind: {
                      path: '$ec3Match',
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
                              $in: ['$$materialId', '$materialLayers.materialId'],
                            },
                          },
                        },
                        {
                          $unwind: '$materialLayers',
                        },
                        {
                          $match: {
                            $expr: {
                              $eq: ['$materialLayers.materialId', '$$materialId'],
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            totalVolume: { $sum: '$materialLayers.volume' },
                          },
                        },
                      ],
                      as: 'volumeData',
                    },
                  },
                  {
                    $addFields: {
                      totalVolume: {
                        $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                      },
                      gwp: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$indicators.gwp', 0] },
                        ],
                      },
                      ubp: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$indicators.ubp', 0] },
                        ],
                      },
                      penre: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$ec3Match.penre', 0] },
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
                _count: {
                  elements: { $size: '$elements' },
                  uploads: { $size: '$uploads' },
                  materials: { $size: '$materials' },
                },
                totalIndicators: {
                  $reduce: {
                    input: '$elements',
                    initialValue: { gwp: 0, ubp: 0, penre: 0 },
                    in: {
                      gwp: { $add: ['$$value.gwp', '$$this.indicators.gwp'] },
                      ubp: { $add: ['$$value.ubp', '$$this.indicators.ubp'] },
                      penre: { $add: ['$$value.penre', '$$this.indicators.penre'] },
                    },
                  },
                },
              },
            },
          ])
            .session(useSession)
            .skip(skip)
            .limit(size)

          const totalCount = await Project.countDocuments({ _id: { $in: projectIds } }).session(
            useSession
          )
          const hasMore = page * size < totalCount

          return {
            projects: projectWithNestedDataBulk,
            pagination: {
              size,
              page,
              hasMore,
              totalCount,
              totalPages: Math.ceil(totalCount / size),
            },
          }
        } catch (error: unknown) {
          logger.error('❌ [Project Service] Error in getProjectWithNestedDataBulk:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new DatabaseError(
            error instanceof Error ? error.message : 'Failed to fetch projects',
            'read'
          )
        }
      }
    }, session)
  }

  /**
   * Get multiple projects with nested data
   */
  static async getProjectWithNestedDataBulkByUser({
    data: { userId, pagination },
    session,
  }: GetProjectWithNestedDataBulkByUserRequest): Promise<GetProjectWithNestedDataBulkByUserResponse> {
    return withTransaction(async useSession => {
      if (!pagination) {
        try {
          await this.getProjectBulkByUser({
            data: { userId },
            session: useSession,
          })

          const projectWithNestedDataBulk = await Project.aggregate<IProjectWithNestedData>([
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
                      localField: 'materialLayers.materialId',
                      foreignField: '_id',
                      as: 'materialRefs',
                      pipeline: [
                        {
                          $lookup: {
                            from: 'EC3Matches',
                            localField: 'ec3MatchId',
                            foreignField: '_id',
                            as: 'ec3Match',
                          },
                        },
                        {
                          $unwind: {
                            path: '$ec3Match',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      totalVolume: { $sum: '$materialLayers.volume' },
                      indicators: {
                        $reduce: {
                          input: '$materialLayers',
                          initialValue: { gwp: 0, ubp: 0, penre: 0 },
                          in: {
                            gwp: {
                              $add: [
                                '$$value.gwp',
                                {
                                  $multiply: [
                                    '$$this.volume',
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    { $ifNull: ['$$this.materialId.indicators.gwp', 0] },
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
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    { $ifNull: ['$$this.materialId.indicators.ubp', 0] },
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
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    {
                                      $ifNull: ['$$this.materialId.indicators.penre', 0],
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
                      from: 'EC3Matches',
                      localField: 'ec3MatchId',
                      foreignField: 'ec3MatchId',
                      as: 'ec3Match',
                    },
                  },
                  {
                    $unwind: {
                      path: '$ec3Match',
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
                              $in: ['$$materialId', '$materialLayers.materialId'],
                            },
                          },
                        },
                        {
                          $unwind: '$materialLayers',
                        },
                        {
                          $match: {
                            $expr: {
                              $eq: ['$materialLayers.materialId', '$$materialId'],
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            totalVolume: { $sum: '$materialLayers.volume' },
                          },
                        },
                      ],
                      as: 'volumeData',
                    },
                  },
                  {
                    $addFields: {
                      totalVolume: {
                        $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                      },
                      gwp: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$indicators.gwp', 0] },
                        ],
                      },
                      ubp: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$indicators.ubp', 0] },
                        ],
                      },
                      penre: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$ec3Match.penre', 0] },
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
                _count: {
                  elements: { $size: '$elements' },
                  uploads: { $size: '$uploads' },
                  materials: { $size: '$materials' },
                },
                totalIndicators: {
                  $reduce: {
                    input: '$elements',
                    initialValue: { gwp: 0, ubp: 0, penre: 0 },
                    in: {
                      gwp: { $add: ['$$value.gwp', '$$this.indicators.gwp'] },
                      ubp: { $add: ['$$value.ubp', '$$this.indicators.ubp'] },
                      penre: { $add: ['$$value.penre', '$$this.indicators.penre'] },
                    },
                  },
                },
              },
            },
          ]).session(useSession)

          if (!projectWithNestedDataBulk || projectWithNestedDataBulk.length === 0) {
            throw new ProjectNotFoundError(userId)
          }

          return { projects: projectWithNestedDataBulk }
        } catch (error: unknown) {
          logger.error('❌ [Project Service] Error in getProjectWithNestedDataBulk:', error)
          throw error
        }
      } else {
        try {
          const { page, size } = pagination
          const skip = (page - 1) * size

          await this.getProjectBulkByUser({
            data: { userId, pagination: { page, size } },
            session: useSession,
          })

          const projectWithNestedDataBulk = await Project.aggregate<IProjectWithNestedData>([
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
                      localField: 'materialLayers.materialId',
                      foreignField: '_id',
                      as: 'materialRefs',
                      pipeline: [
                        {
                          $lookup: {
                            from: 'EC3Matches',
                            localField: 'ec3MatchId',
                            foreignField: '_id',
                            as: 'ec3Match',
                          },
                        },
                        {
                          $unwind: {
                            path: '$ec3Match',
                            preserveNullAndEmptyArrays: true,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $addFields: {
                      totalVolume: { $sum: '$materialLayers.volume' },
                      indicators: {
                        $reduce: {
                          input: '$materialLayers',
                          initialValue: { gwp: 0, ubp: 0, penre: 0 },
                          in: {
                            gwp: {
                              $add: [
                                '$$value.gwp',
                                {
                                  $multiply: [
                                    '$$this.volume',
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    { $ifNull: ['$$this.materialId.indicators.gwp', 0] },
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
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    { $ifNull: ['$$this.materialId.indicators.ubp', 0] },
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
                                    { $ifNull: ['$$this.materialId.density', 0] },
                                    {
                                      $ifNull: ['$$this.materialId.indicators.penre', 0],
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
                      from: 'EC3Matches',
                      localField: 'ec3MatchId',
                      foreignField: 'ec3MatchId',
                      as: 'ec3Match',
                    },
                  },
                  {
                    $unwind: {
                      path: '$ec3Match',
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
                              $in: ['$$materialId', '$materialLayers.materialId'],
                            },
                          },
                        },
                        {
                          $unwind: '$materialLayers',
                        },
                        {
                          $match: {
                            $expr: {
                              $eq: ['$materialLayers.materialId', '$$materialId'],
                            },
                          },
                        },
                        {
                          $group: {
                            _id: null,
                            totalVolume: { $sum: '$materialLayers.volume' },
                          },
                        },
                      ],
                      as: 'volumeData',
                    },
                  },
                  {
                    $addFields: {
                      totalVolume: {
                        $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                      },
                      gwp: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$indicators.gwp', 0] },
                        ],
                      },
                      ubp: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$indicators.ubp', 0] },
                        ],
                      },
                      penre: {
                        $multiply: [
                          {
                            $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                          },
                          { $ifNull: ['$density', 0] },
                          { $ifNull: ['$ec3Match.penre', 0] },
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
                _count: {
                  elements: { $size: '$elements' },
                  uploads: { $size: '$uploads' },
                  materials: { $size: '$materials' },
                },
                totalIndicators: {
                  $reduce: {
                    input: '$elements',
                    initialValue: { gwp: 0, ubp: 0, penre: 0 },
                    in: {
                      gwp: { $add: ['$$value.gwp', '$$this.indicators.gwp'] },
                      ubp: { $add: ['$$value.ubp', '$$this.indicators.ubp'] },
                      penre: { $add: ['$$value.penre', '$$this.indicators.penre'] },
                    },
                  },
                },
              },
            },
          ])
            .session(useSession)
            .skip(skip)
            .limit(size)

          const totalCount = await Project.countDocuments({ userId }).session(useSession)
          const hasMore = page * size < totalCount

          return {
            projects: projectWithNestedDataBulk,
            pagination: {
              size,
              page,
              hasMore,
              totalCount,
              totalPages: Math.ceil(totalCount / size),
            },
          }
        } catch (error: unknown) {
          logger.error('❌ [Project Service] Error in getProjectWithNestedDataBulk:', error)

          if (isAppError(error)) {
            throw error
          }

          throw new DatabaseError(
            error instanceof Error ? error.message : 'Failed to fetch projects',
            'read'
          )
        }
      }
    }, session)
  }

  /**
   * Updates a project
   */
  static async updateProject({
    data: { projectId, updates, userId },
    session,
  }: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    return withTransaction(async useSession => {
      try {
        await this.getProject({
          data: { projectId, userId },
          session: useSession,
        })

        const updatedResult = await Project.findOneAndUpdate(
          { _id: projectId, userId },
          {
            $set: {
              ...updates,
              updatedAt: new Date(),
            },
          },
          {
            new: true,
            session: useSession,
          }
        ).lean()

        if (!updatedResult) {
          throw new ProjectUpdateError(`Failed to update project: ${projectId.toString()}`)
        }

        return updatedResult
      } catch (error: unknown) {
        logger.error('❌ [Project Service] Error in updateProject:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new ProjectUpdateError(
          error instanceof Error ? error.message : 'Failed to update project'
        )
      }
    }, session)
  }

  /**
   * Updates multiple projects
   */
  static async updateProjectBulk({
    data: { projectIds, updates, userId },
    session,
  }: UpdateProjectBulkRequest): Promise<UpdateProjectBulkResponse> {
    return withTransaction(async useSession => {
      try {
        if (projectIds.length !== updates.length) {
          throw new ProjectUpdateError('Project IDs and updates arrays must have the same length')
        }

        const { projects: existingProjects } = await this.getProjectBulk({
          data: { projectIds },
          session: useSession,
        })

        if (existingProjects.length !== projectIds.length) {
          const foundIds = existingProjects.map(p => p._id.toString())
          const missingIds = projectIds.filter(id => !foundIds.includes(id.toString()))
          throw new ProjectNotFoundError(`Projects not found: ${missingIds.join(', ')}`)
        }

        const bulkOps = projectIds.map((projectId, index) => ({
          updateOne: {
            filter: { _id: projectId, userId },
            update: {
              $set: {
                ...updates[index],
                updatedAt: new Date(),
              },
            },
          },
        }))

        const bulkResult = await Project.bulkWrite(bulkOps, { session: useSession })

        if (bulkResult.modifiedCount !== projectIds.length) {
          throw new ProjectUpdateError(
            `Expected to update ${projectIds.length} projects, but only updated ${bulkResult.modifiedCount}`
          )
        }

        const { projects: updatedProjects } = await this.getProjectBulk({
          data: { projectIds },
          session: useSession,
        })

        return updatedProjects
      } catch (error: unknown) {
        logger.error('❌ [Project Service] Error in updateProjectBulk:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new ProjectUpdateError(
          error instanceof Error ? error.message : 'Failed to update projects'
        )
      }
    }, session)
  }

  /**
   * Deletes a project
   */
  static async deleteProject({
    data: { projectId, userId },
    session,
  }: DeleteProjectRequest): Promise<DeleteProjectResponse> {
    return withTransaction(async useSession => {
      try {
        await this.getProject({
          data: { projectId, userId },
          session: useSession,
        })

        const [uploads, elements, materials] = await Promise.all([
          Upload.deleteMany({ projectId }).session(useSession),
          Element.deleteMany({ projectId }).session(useSession),
          Material.deleteMany({ projectId }).session(useSession),
        ])

        if (
          uploads.deletedCount !== 1 ||
          elements.deletedCount !== 1 ||
          materials.deletedCount !== 1
        ) {
          throw new ProjectDeleteError('Failed to delete project')
        }

        const deleteResult = await Project.findOneAndDelete({ _id: projectId, userId })
          .session(useSession)
          .lean()

        if (!deleteResult) {
          throw new ProjectDeleteError('Failed to delete project')
        }

        return deleteResult
      } catch (error: unknown) {
        if (isAppError(error)) {
          throw error
        }

        throw new DatabaseError(
          error instanceof Error ? error.message : 'Unknown database error',
          'delete'
        )
      }
    }, session)
  }

  /**
   * Deletes multiple projects
   */
  static async deleteProjectBulk({
    data: { projectIds, userId },
    session,
  }: DeleteProjectBulkRequest): Promise<DeleteProjectBulkResponse> {
    return withTransaction(async useSession => {
      try {
        const { projects: existingProjects } = await this.getProjectBulk({
          data: { projectIds },
          session: useSession,
        })

        if (existingProjects.length !== projectIds.length) {
          const foundIds = existingProjects.map(p => p._id.toString())
          const missingIds = projectIds.filter(id => !foundIds.includes(id.toString()))
          throw new ProjectNotFoundError(`Projects not found: ${missingIds.join(', ')}`)
        }

        const [uploads, elements, materials] = await Promise.all([
          Upload.deleteMany({ projectId: { $in: projectIds } }).session(useSession),
          Element.deleteMany({ projectId: { $in: projectIds } }).session(useSession),
          Material.deleteMany({ projectId: { $in: projectIds } }).session(useSession),
        ])

        if (
          uploads.deletedCount !== projectIds.length ||
          elements.deletedCount !== projectIds.length ||
          materials.deletedCount !== projectIds.length
        ) {
          throw new ProjectDeleteError('Failed to delete projects')
        }

        const deleteResult = await Project.deleteMany({ _id: { $in: projectIds }, userId })
          .session(useSession)
          .lean()

        if (!deleteResult || deleteResult.deletedCount !== projectIds.length) {
          throw new ProjectDeleteError('Failed to delete projects')
        }

        return existingProjects
      } catch (error: unknown) {
        if (isAppError(error)) {
          throw error
        }

        throw new DatabaseError(
          error instanceof Error ? error.message : 'Unknown database error',
          'delete'
        )
      }
    }, session)
  }

  /**
   * Search projects by name or description
   */
  static async searchProjects({
    data: { userId, name, sortBy, pagination },
    session,
  }: SearchProjectsRequest): Promise<SearchProjectsResponse> {
    return withTransaction(async useSession => {
      try {
        const { page, size } = pagination
        const skip = (page - 1) * size

        const total = await Project.countDocuments({ name, userId }).session(useSession)

        const projects = await Project.find({ name, userId })
          .select('name _id userId createdAt updatedAt')
          .sort({ [sortBy || 'name']: 1 })
          .skip(skip)
          .limit(size)
          .session(useSession)
          .lean()

        const totalPages = Math.ceil(total / size)
        const hasMore = page < totalPages

        return {
          projects,
          pagination: {
            size,
            page,
            hasMore,
            totalCount: total,
            totalPages,
          },
        }
      } catch (error: unknown) {
        logger.error('❌ [Project Service] Error in searchProjects:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new DatabaseError(
          error instanceof Error ? error.message : 'Failed to search projects',
          'search'
        )
      }
    }, session)
  }
}
