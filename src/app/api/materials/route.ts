import { NextResponse } from "next/server"
import { Material, Project } from "@/models"
import { IMaterialDBWithVirtuals } from "@/interfaces/materials/IMaterialDB"
import { logger } from "@/lib/logger"
import { AuthenticatedRequest, getUserId } from "@/lib/auth-middleware"
import IProjectDB from "@/interfaces/projects/IProjectDB"
import { withAuthAndDB } from "@/lib/api-middleware"

async function getMaterials(request: AuthenticatedRequest) {
  const userId = getUserId(request)

  // Get projects for the current user
  const userProjects = await Project.find({ userId })
    .select("_id")
    .lean<Pick<IProjectDB, "_id">[]>()

  const projectIds = userProjects.map((p) => p._id.toString())

  const materials = await Material.find({
    projectId: { $in: projectIds },
  })
    .select("name category density kbobMatchId projectId")
    .populate("kbobMatchId")
    .lean<IMaterialDBWithVirtuals[]>({ virtuals: true })

  const transformedMaterials: IMaterialDBWithVirtuals[] = materials.map((material) => ({
    ...material,
    totalVolume: material.totalVolume,
    kbobMatchId: material.kbobMatchId,
  }))

  return NextResponse.json(transformedMaterials)
}

export const GET = withAuthAndDB(getMaterials)
