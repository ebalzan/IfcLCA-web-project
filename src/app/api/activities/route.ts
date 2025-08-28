import { NextResponse } from 'next/server'
import IActivity from '@/interfaces/client/activities/IActivity'
import IProjectDB from '@/interfaces/projects/IProjectDB'
import { getUserId, AuthenticatedRequest, withAuthAndDB } from '@/lib/api-middleware'
import { Project, Upload, MaterialDeletion } from '@/models'
import { GetActivitiesResponse } from '@/schemas/api/responses'
import sortByDate from '@/utils/sortByDate'

async function getActivities(request: AuthenticatedRequest) {
  const userId = getUserId(request)

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  // Get total counts for pagination (even though no pagination UI exists yet)
  const [projectsCount, uploadsCount, materialDeletionsCount] = await Promise.all([
    Project.countDocuments({ userId }),
    Upload.countDocuments({ userId }),
    MaterialDeletion.countDocuments({ userId }),
  ])

  // Fetch paginated projects and uploads
  const [projects, uploads, materialDeletions] = await Promise.all([
    Project.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Upload.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{
        projectId: Pick<IProjectDB, 'name' | '_id'>
      }>('projectId', 'name')
      .lean(),
    MaterialDeletion.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{
        projectId: Pick<IProjectDB, 'name' | '_id'>
      }>('projectId', 'name')
      .lean(),
  ])

  // Format activities
  const activities: IActivity[] = [
    ...projects.map(({ _id, name, createdAt }) => ({
      id: _id.toString(),
      type: 'project_created',
      user: {
        name: 'You',
        imageUrl: null,
      },
      action: 'created a new project',
      project: {
        id: _id.toString(),
        name,
      },
      timestamp: createdAt,
      details: null,
    })),
    ...uploads.map(({ _id, filename, elementCount, createdAt, projectId }) => ({
      id: _id.toString(),
      type: 'file_uploaded',
      user: {
        name: 'You',
        imageUrl: null,
      },
      action: 'uploaded a file to',
      project: {
        id: projectId._id.toString(),
        name: projectId.name,
      },
      timestamp: createdAt,
      details: {
        filename,
        elementCount,
      },
    })),
    ...materialDeletions.map(({ _id, materialName, reason, createdAt, projectId }) => ({
      id: _id.toString(),
      type: 'material_deleted',
      user: {
        name: 'You',
        imageUrl: null,
      },
      action: 'deleted a material from',
      project: {
        id: projectId._id.toString(),
        name: projectId.name,
      },
      timestamp: createdAt,
      details: {
        materialName,
        reason,
      },
    })),
  ] as IActivity[]

  // Sort by timestamp descending
  const sortedActivities = sortByDate(activities)

  const totalCount = projectsCount + uploadsCount + materialDeletionsCount
  const hasMore = skip + sortedActivities.length < totalCount

  return NextResponse.json<GetActivitiesResponse>({
    data: sortedActivities,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: hasMore,
      hasPrev: page > 1,
    },
  })
}

export const GET = withAuthAndDB(getActivities)
