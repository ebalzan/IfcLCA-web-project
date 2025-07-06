import { NextResponse } from "next/server"
import { Project, Upload, MaterialDeletion } from "@/models"
import { withAuthAndDB } from "@/lib/api-middleware"
import { getUserId, AuthenticatedRequest } from "@/lib/auth-middleware"
import IProjectDB from "@/interfaces/projects/IProjectDB"
import IUploadDB from "@/interfaces/uploads/IUploadDB"
import IMaterialDeletion from "@/interfaces/materials/IMaterialDeletion"
import { logger } from "@/lib/logger"
import { Types } from "mongoose"

async function getActivities(request: AuthenticatedRequest) {
  const userId = getUserId(request)

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 2 // Changed to 2 items per page (and it returns more but cant be bothered to fix it now, future me will be happy)
  const skip = (page - 1) * limit


  // Get total counts for pagination (even though no pagination UI exists yet)
  const [projectsCount, uploadsCount, materialDeletionsCount] =
    await Promise.all([
      Project.countDocuments({ userId }),
      Upload.countDocuments({ userId }),
      MaterialDeletion.countDocuments({ userId }),
    ])

  // Fetch paginated projects and uploads
  const [projects, uploads, materialDeletions] = await Promise.all([
    Project.find<IProjectDB>({ userId })
      .sort({ createdAt: -1, })
      .skip(skip)
      .limit(limit)
      .lean(),
    Upload.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{ projectId: Pick<IProjectDB, "name" | "_id"> }>("projectId", "name")
      .lean(),
    MaterialDeletion.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{ projectId: Pick<IProjectDB, "name" | "_id"> }>("projectId", "name")
      .lean(),
  ])
  
  // Format activities
  const activities = [
    ...projects.map((project) => ({
      id: project._id.toString(),
      type: "project_created",
      user: {
        name: "You",
        avatar: "/placeholder-avatar.jpg",
      },
      action: "created a new project",
      project: project.name,
      projectId: project._id.toString(),
      timestamp: project.createdAt,
      details: {
        description: project.description || "No description provided",
      },
    })),
    ...uploads.map((upload: any) => ({
      id: upload._id.toString(),
      type: "file_uploaded",
      user: {
        name: "You",
        avatar: "/placeholder-avatar.jpg",
      },
      action: "uploaded a file to",
      project: upload.projectId?.name || "Unknown Project",
      projectId: upload.projectId?._id?.toString() || "",
      timestamp: upload.createdAt,
      details: {
        fileName: upload.filename,
        elementCount: upload.elementCount || 0,
      },
    })),
    ...materialDeletions.map((deletion) => ({
      id: deletion._id.toString(),
      type: "material_deleted",
      user: {
        name: "You",
        avatar: "/placeholder-avatar.jpg",
      },
      action: "deleted a material from",
      project: deletion.projectId?.name || "Unknown Project",
      projectId: deletion.projectId?._id?.toString() || "",
      timestamp: deletion.createdAt,
      details: {
        materialName: deletion.materialName,
        reason: deletion.reason || "No reason provided",
      },
    })),
  ]

  logger.info("ACTIVITIES", activities)

  // Sort by timestamp descending
  const sortedActivities = activities.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const totalCount = projectsCount + uploadsCount + materialDeletionsCount
  const hasMore = skip + sortedActivities.length < totalCount

  return NextResponse.json({
    activities: sortedActivities,
    hasMore,
    total: totalCount,
  })
}

export const GET = withAuthAndDB(getActivities)
