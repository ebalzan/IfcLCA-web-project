import { IProjectWithNestedData } from '@/interfaces/projects/IProjectWithNestedData'
import { Project, Upload, Material, Element } from '@/models'
import {
  CreateProjectRequest,
  GetProjectRequest,
  GetProjectWithNestedDataBulkRequest,
  GetProjectWithNestedDataRequest,
} from '@/schemas/api/projects/project-requests'
import {
  CreateProjectBulkRequest,
  GetProjectBulkRequest,
  UpdateProjectRequest,
  UpdateProjectBulkRequest,
  DeleteProjectRequest,
  DeleteProjectBulkRequest,
} from '@/schemas/api/projects/project-requests'
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
} from '@/schemas/api/projects/project-responses'
import {
  QueryConditions,
  SearchProjectsRequest,
  SearchProjectsResponse,
  SortObject,
} from '@/schemas/api/projects/search'
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
      const newProject = await Project.insertOne(
        { ...project, userId },
        { session: session || null }
      )

      return {
        success: true,
        data: newProject,
        message: 'Project created successfully',
      }
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
    return withTransaction(async useSession => {
      try {
        const newProjects = await Project.insertMany(
          projects.map(project => ({
            ...project,
            userId,
          })),
          { session: useSession }
        )

        return {
          success: true,
          data: newProjects,
          message: 'Projects created successfully',
        }
      } catch (error: unknown) {
        logger.error('❌ [Project Service] Error in createProjectBulk:', error)

        if (isAppError(error)) {
          throw error
        }

        throw new ProjectCreateError(
          error instanceof Error ? error.message : 'Failed to create projects'
        )
      }
    }, session)
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

      return {
        success: true,
        data: project,
        message: 'Project fetched successfully',
      }
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
    data: { projectIds, userId, pagination },
    session,
  }: GetProjectBulkRequest): Promise<GetProjectBulkResponse> {
    try {
      const { page, size } = pagination
      const skip = (page - 1) * size

      const query = projectIds.length > 0 ? { _id: { $in: projectIds }, userId } : { userId }

      const projects = await Project.find(query)
        .session(session || null)
        .skip(skip)
        .limit(size)
        .lean()

      if (!projects || projects.length === 0) {
        throw new ProjectNotFoundError(projectIds.join(', '))
      }

      const totalCount = await Project.countDocuments(query).session(session || null)
      const hasMore = page * size < totalCount

      return {
        success: true,
        data: {
          projects,
          pagination: { page, size, totalCount, hasMore, totalPages: Math.ceil(totalCount / size) },
        },
        message: 'Projects fetched successfully',
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

  /**
   * Get a project with nested data
   */
  static async getProjectWithNestedData({
    data: { projectId, userId },
    session,
  }: GetProjectWithNestedDataRequest): Promise<GetProjectWithNestedDataResponse> {
    try {
      const project = await Project.findOne({ _id: projectId, userId })
        .session(session || null)
        .lean()

      if (!project) {
        throw new ProjectNotFoundError(projectId.toString())
      }

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
                  localField: 'materials.material',
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
                      { $ifNull: ['$ec3Match.gwp', 0] },
                    ],
                  },
                  ubp: {
                    $multiply: [
                      {
                        $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                      },
                      { $ifNull: ['$density', 0] },
                      { $ifNull: ['$ec3Match.ubp', 0] },
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

      return {
        success: true,
        data: projectWithNestedData,
        message: 'Project fetched successfully',
      }
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
  }

  /**
   * Get multiple projects with nested data
   */
  static async getProjectWithNestedDataBulk({
    data: { projectIds, userId, pagination },
    session,
  }: GetProjectWithNestedDataBulkRequest): Promise<GetProjectWithNestedDataBulkResponse> {
    try {
      const { page, size } = pagination
      const skip = (page - 1) * size

      const query = projectIds.length > 0 ? { _id: { $in: projectIds }, userId } : { userId }

      const projects = await Project.find(query)
        .session(session || null)
        .skip(skip)
        .limit(size)
        .lean()

      if (!projects || projects.length === 0) {
        throw new ProjectNotFoundError(projectIds.join(', '))
      }

      const projectsWithNestedData = await Project.aggregate<IProjectWithNestedData>([
        {
          $match: query,
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
                      { $ifNull: ['$ec3Match.gwp', 0] },
                    ],
                  },
                  ubp: {
                    $multiply: [
                      {
                        $ifNull: [{ $arrayElemAt: ['$volumeData.totalVolume', 0] }, 0],
                      },
                      { $ifNull: ['$density', 0] },
                      { $ifNull: ['$ec3Match.ubp', 0] },
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
        .session(session || null)
        .skip(skip)
        .limit(size)

      const totalCount = await Project.countDocuments(query).session(session || null)
      const hasMore = page * size < totalCount

      return {
        success: true,
        data: {
          projects: projectsWithNestedData,
          pagination: {
            size,
            page,
            hasMore,
            totalCount,
            totalPages: Math.ceil(totalCount / size),
          },
        },
        message: 'Projects fetched successfully',
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
  /**
   * Updates a project
   */
  static async updateProject({
    data: { projectId, updates, userId },
    session,
  }: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    try {
      const project = await Project.findOne({ _id: projectId, userId })
        .session(session || null)
        .lean()

      if (!project) {
        throw new ProjectNotFoundError(projectId.toString())
      }

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
          session: session || null,
        }
      )

      if (!updatedResult) {
        throw new ProjectUpdateError(`Failed to update project: ${projectId.toString()}`)
      }

      return {
        success: true,
        data: updatedResult,
        message: 'Project updated successfully',
      }
    } catch (error: unknown) {
      logger.error('❌ [Project Service] Error in updateProject:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new ProjectUpdateError(
        error instanceof Error ? error.message : 'Failed to update project'
      )
    }
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
        const projectUpdatePromises = projectIds.map(async (projectId, index) => {
          try {
            const project = await Project.findOne({ _id: projectId, userId })
              .session(useSession)
              .lean()

            if (!project) {
              throw new ProjectNotFoundError(projectId.toString())
            }

            const updateResult = await Project.findOneAndUpdate(
              { _id: projectId, userId },
              {
                $set: {
                  ...updates[index],
                  updatedAt: new Date(),
                },
              },
              { session: useSession, upsert: false }
            )

            if (!updateResult) {
              throw new ProjectUpdateError(`Failed to update project: ${projectId.toString()}`)
            }

            const updatedProject = await Project.findOne({ _id: projectId, userId })
              .session(session || null)
              .lean()

            if (!updatedProject) {
              throw new ProjectNotFoundError(projectId.toString())
            }

            return updatedProject
          } catch (error: unknown) {
            logger.error('❌ [Project Service] Error in updateProjectBulk:', error)
            throw error
          }
        })

        const projects = await Promise.all(projectUpdatePromises)

        return {
          success: true,
          data: projects,
          message: 'Projects updated successfully',
        }
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
        const project = await Project.findOne({ _id: projectId, userId }).session(useSession).lean()

        if (!project) {
          throw new ProjectNotFoundError(projectId.toString())
        }

        // Delete all associated data in order
        await Upload.deleteMany({ projectId })
        await Element.deleteMany({ projectId })
        await Material.deleteMany({ projectId })

        const deleteResult = await Project.findOneAndDelete({ _id: projectId, userId })
          .session(useSession)
          .lean()

        if (!deleteResult) {
          throw new ProjectDeleteError('Failed to delete project')
        }

        return {
          success: true,
          data: project,
          message: 'Project deleted successfully',
        }
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
        const projects = await Project.find({ _id: { $in: projectIds }, userId })
          .session(useSession)
          .lean()

        if (!projects || projects.length === 0) {
          throw new ProjectNotFoundError(projectIds.join(', '))
        }

        // Delete all associated data in order
        await Upload.deleteMany({ projectId: { $in: projectIds } })
        await Element.deleteMany({ projectId: { $in: projectIds } })
        await Material.deleteMany({ projectId: { $in: projectIds } })

        const deleteResult = await Project.deleteMany({ _id: { $in: projectIds }, userId })
          .session(useSession)
          .lean()

        if (!deleteResult || deleteResult.deletedCount !== projectIds.length) {
          throw new ProjectDeleteError('Failed to delete projects')
        }

        return {
          success: true,
          data: projects,
          message: 'Projects deleted successfully',
        }
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
    data: { userId, searchTerm, all, dateFrom, dateTo, sortBy, sortOrder, pagination },
    session,
  }: SearchProjectsRequest): Promise<SearchProjectsResponse> {
    try {
      const { page, size } = pagination

      // Build query conditions with proper typing
      const queryConditions: QueryConditions = {
        userId,
      }

      // Add search condition if not fetching all projects and searchTerm is provided
      if (!all && searchTerm && searchTerm.trim()) {
        try {
          queryConditions.$text = { $search: searchTerm }
        } catch {
          queryConditions.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
          ]
        }
      }

      // Add date range filtering
      if (dateFrom || dateTo) {
        queryConditions.createdAt = {}
        if (dateFrom) {
          queryConditions.createdAt.$gte = new Date(dateFrom)
        }
        if (dateTo) {
          queryConditions.createdAt.$lte = new Date(dateTo)
        }
      }

      // Build sort object with proper typing
      const sortObject: SortObject = {
        [sortBy || 'name']: sortOrder === 'desc' ? -1 : 1,
      }

      // Calculate pagination
      const skip = (page - 1) * size

      // Get total count for pagination
      const total = await Project.countDocuments(queryConditions).session(session || null)

      // Get paginated results
      const projects = await Project.find(queryConditions)
        .select('name description _id userId emissions createdAt updatedAt')
        .sort(sortObject)
        .skip(skip)
        .limit(size)
        .session(session || null)
        .lean()

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / size)
      const hasMore = page < totalPages

      return {
        success: true,
        data: {
          projects,
          pagination: {
            size,
            page,
            hasMore,
            totalCount: total,
            totalPages,
          },
        },
        message: 'Projects searched successfully',
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
  }

  /**
   * Update project emissions
   */
  static async updateProjectEmissions(
    projectId: string,
    emissions: { gwp: number; ubp: number; penre: number },
    session?: any
  ): Promise<void> {
    try {
      await Project.findByIdAndUpdate(
        projectId,
        {
          $set: {
            emissions: {
              ...emissions,
              lastCalculated: new Date(),
            },
          },
        },
        { session: session || null }
      )
    } catch (error: unknown) {
      logger.error('❌ [Project Service] Error in updateProjectEmissions:', error)

      if (isAppError(error)) {
        throw error
      }

      throw new ProjectUpdateError(
        error instanceof Error ? error.message : 'Failed to update project emissions'
      )
    }
  }
}
