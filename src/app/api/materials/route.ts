import { NextResponse } from "next/server";
import { Material, Project } from "@/models";
import IMaterialDB, {
  IMaterialVirtuals,
} from "@/interfaces/materials/IMaterialDB";
import { AuthenticatedRequest, getUserId } from "@/lib/auth-middleware";
import IProjectDB from "@/interfaces/projects/IProjectDB";
import { withAuthAndDB } from "@/lib/api-middleware";
import IKBOBMaterial from "@/interfaces/materials/IKBOBMaterial";
import { logger } from "@/lib/logger";

async function getMaterials(request: AuthenticatedRequest) {
  const userId = getUserId(request);

  // Get projects for the current user
  const userProjects = await Project.find({ userId })
    .select<Pick<IProjectDB, "_id">>("_id")
    .lean();

  const projectIds = userProjects.map((project) => project._id.toString());

  const materials = await Material.find({
    projectId: { $in: projectIds },
  })
    .lean<(IMaterialDB & IMaterialVirtuals)[]>({ virtuals: true })
    .populate<{ kbobMatchId: IKBOBMaterial }>("kbobMatchId");

  const transformedMaterials: IMaterialVirtuals[] = materials.map(
    (material) => ({
      ...material,
      totalVolume: material.totalVolume,
      kbobMatchId: material.kbobMatchId,
    })
  );

  return NextResponse.json(transformedMaterials);
}

export const GET = withAuthAndDB(getMaterials);
